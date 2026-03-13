<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\User;
use App\Models\Clinic;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use DateTimeInterface;

class AuthService
{
    /**
     * Register new clinic and doctor
     */
    public function register(array $data): array
    {
        // Create clinic
        $clinic = Clinic::create([
            'name' => $data['clinic_name'],
            'slug' => Str::slug($data['clinic_name']) . '-' . time(),
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'patient_prefix' => strtoupper($data['patient_prefix'] ?? Clinic::DEFAULT_PATIENT_PREFIX),
            'patient_counter' => 0,
            'subscription_status' => 'trial',
            'is_active' => true,
        ]);

        // Create doctor user
        $user = User::create([
            'clinic_id' => $clinic->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => User::ROLE_DOCTOR,
            'phone' => $data['phone'] ?? null,
        ]);

        $tokenData = $this->createAccessToken($user);

        // Audit log
        AuditLog::log(
            $clinic->id,
            $user->id,
            'register',
            'user',
            $user->id,
            request()->ip(),
            request()->userAgent(),
            null,
            ['email' => $user->email, 'role' => $user->role]
        );

        return [
            'user' => $user,
            'clinic' => $clinic,
            'token' => $tokenData['token'],
            'expires_at' => $tokenData['expires_at'],
        ];
    }

    /**
     * Login user
     */
    public function login(string $email, string $password): ?array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        if (!$user->is_active) {
            return ['error' => 'Account is disabled'];
        }

        // Check if OTP is required
        if ($this->isOtpRequired($user)) {
            $otpData = $this->sendOtp($user);

            return [
                'otp_required' => true,
                'email' => $user->email,
                'otp_expires_at' => $otpData['expires_at'],
            ];
        }

        // Update login info
        $user->updateLoginInfo(request()->ip(), request()->userAgent());

        $tokenData = $this->createAccessToken($user);

        // Audit log
        AuditLog::log(
            $user->clinic_id,
            $user->id,
            'login',
            'user',
            $user->id,
            request()->ip(),
            request()->userAgent()
        );

        return [
            'user' => $user,
            'token' => $tokenData['token'],
            'expires_at' => $tokenData['expires_at'],
        ];
    }

    /**
     * Check if OTP is required
     */
    public function isOtpRequired(User $user): bool
    {
        // Check IP change
        if ($user->last_login_ip !== null && $user->last_login_ip !== request()->ip()) {
            return true;
        }

        // Check 3-day gap
        if ($user->last_login_at !== null) {
            $daysSinceLastLogin = $user->last_login_at->diffInDays(now());
            if ($daysSinceLastLogin >= 3) {
                return true;
            }
        }

        // Check device change
        if ($user->device_info !== null && $user->device_info !== request()->userAgent()) {
            return true;
        }

        return false;
    }

    /**
     * Send OTP to user email
     */
    public function sendOtp(User $user): array
    {
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = now()->addMinutes(10);
        
        // Store OTP in cache (expires in 10 minutes)
        cache()->put('otp_' . $user->id, $otp, $expiresAt);

        try {
            Mail::to($user->email)->send(
                new OtpMail(
                    user: $user,
                    otp: $otp,
                    expiresAt: $expiresAt->setTimezone(config('app.timezone'))->format('d M Y h:i A')
                )
            );
        } catch (\Throwable $exception) {
            Log::error('Failed to send login OTP email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'otp' => $otp,
                'expires_at' => $expiresAt->toISOString(),
                'error' => $exception->getMessage(),
            ]);
        }

        return [
            'otp' => $otp,
            'expires_at' => $expiresAt->toISOString(),
        ];
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(User $user, int $otp): ?array
    {
        $cachedOtp = cache()->get('otp_' . $user->id);
        
        if ($cachedOtp && $cachedOtp == $otp) {
            cache()->forget('otp_' . $user->id);
            
            // Update login info after successful OTP verification
            $user->updateLoginInfo(request()->ip(), request()->userAgent());

            $tokenData = $this->createAccessToken($user);

            // Audit log
            AuditLog::log(
                $user->clinic_id,
                $user->id,
                'login_otp_verified',
                'user',
                $user->id,
                request()->ip(),
                request()->userAgent()
            );

            return [
                'user' => $user->load('clinic'),
                'token' => $tokenData['token'],
                'expires_at' => $tokenData['expires_at'],
            ];
        }

        return null;
    }

    public function resendOtp(string $email): ?array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !$user->is_active) {
            return null;
        }

        $otpData = $this->sendOtp($user);

        AuditLog::log(
            $user->clinic_id,
            $user->id,
            'login_otp_resent',
            'user',
            $user->id,
            request()->ip(),
            request()->userAgent()
        );

        return [
            'email' => $user->email,
            'otp_expires_at' => $otpData['expires_at'],
        ];
    }

    /**
     * Logout user
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();

        // Audit log
        AuditLog::log(
            $user->clinic_id,
            $user->id,
            'logout',
            'user',
            $user->id,
            request()->ip(),
            request()->userAgent()
        );
    }

    /**
     * Reset password
     */
    public function resetPassword(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);
        
        return $status;
    }

    /**
     * Update password
     */
    public function updatePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (!Hash::check($currentPassword, $user->password)) {
            return false;
        }

        $user->update(['password' => Hash::make($newPassword)]);

        // Audit log
        AuditLog::log(
            $user->clinic_id,
            $user->id,
            'password_change',
            'user',
            $user->id,
            request()->ip(),
            request()->userAgent()
        );

        return true;
    }

    /**
     * Get authenticated user with clinic
     */
    public function getAuthUser(): ?User
    {
        return auth()->user()->load('clinic');
    }

    private function createAccessToken(User $user): array
    {
        $expiresAt = $this->resolveTokenExpiration();
        $token = $user->createToken('auth-token', ['*'], $expiresAt)->plainTextToken;

        return [
            'token' => $token,
            'expires_at' => $expiresAt?->toISOString(),
        ];
    }

    private function resolveTokenExpiration(): ?DateTimeInterface
    {
        $expiration = (int) config('sanctum.expiration');

        return $expiration > 0 ? now()->addMinutes($expiration) : null;
    }
}
