<?php

namespace App\Services;

use App\Models\User;
use App\Models\Clinic;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;

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

        // Generate token
        $token = $user->createToken('auth-token')->plainTextToken;

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
            'token' => $token,
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
            $this->sendOtp($user);
            return ['otp_required' => true];
        }

        // Update login info
        $user->updateLoginInfo(request()->ip(), request()->userAgent());

        // Generate token
        $token = $user->createToken('auth-token')->plainTextToken;

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
            'token' => $token,
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

        return false;
    }

    /**
     * Send OTP to user email
     */
    public function sendOtp(User $user): string
    {
        $otp = rand(100000, 999999);
        
        // Store OTP in cache (expires in 10 minutes)
        cache()->put('otp_' . $user->id, $otp, now()->addMinutes(10));

        // TODO: Send email with OTP
        // Mail::to($user->email)->send(new OtpMail($otp));

        return $otp;
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(User $user, int $otp): bool
    {
        $cachedOtp = cache()->get('otp_' . $user->id);
        
        if ($cachedOtp && $cachedOtp == $otp) {
            cache()->forget('otp_' . $user->id);
            
            // Update login info after successful OTP verification
            $user->updateLoginInfo(request()->ip(), request()->userAgent());

            // Generate token
            $token = $user->createToken('auth-token')->plainTextToken;

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

            return true;
        }

        return false;
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
}
