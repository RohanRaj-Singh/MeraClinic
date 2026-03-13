<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * Register new clinic and doctor
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/', 'confirmed'],
            'clinic_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'patient_prefix' => 'nullable|string|max:10',
        ]);

        $result = $this->authService->register($validated);

        return response()->json([
            'success' => true,
            'message' => 'Registration submitted successfully. Waiting for approval.',
            'data' => [
                'user' => $result['user'],
                'clinic' => $result['clinic'],
                'waiting_approval' => $result['waiting_approval'],
            ],
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $result = $this->authService->login($validated['email'], $validated['password']);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => $result['error'],
            ], 403);
        }

        if (isset($result['otp_required'])) {
            return response()->json([
                'success' => true,
                'otp_required' => true,
                'message' => 'Please verify your identity',
                'data' => [
                    'email' => $result['email'],
                    'otp_expires_at' => $result['otp_expires_at'],
                ],
            ], 200);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $result['user'],
                'token' => $result['token'],
                'expires_at' => $result['expires_at'],
            ],
        ]);
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|digits:6',
        ]);

        $user = \App\Models\User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $verified = $this->authService->verifyOtp($user, $validated['otp']);

        if (!$verified) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully',
            'data' => [
                'user' => $verified['user'],
                'token' => $verified['token'],
                'expires_at' => $verified['expires_at'],
            ],
        ]);
    }

    public function resendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $result = $this->authService->resendOtp($validated['email']);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to resend OTP for this account',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully',
            'data' => $result,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(): JsonResponse
    {
        $this->authService->logout(auth()->user());

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(): JsonResponse
    {
        $user = $this->authService->getAuthUser();

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $status = $this->authService->resetPassword($validated['email']);

        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent to your email',
        ]);
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/'],
        ]);

        $updated = $this->authService->updatePassword(
            auth()->user(),
            $validated['current_password'],
            $validated['new_password']
        );

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = auth()->user();
        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user,
        ]);
    }
}
