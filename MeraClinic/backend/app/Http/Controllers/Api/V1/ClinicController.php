<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ClinicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClinicController extends Controller
{
    public function __construct(
        private ClinicService $clinicService
    ) {}

    /**
     * Get all clinics (Super Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $clinics = $this->clinicService->getAll($request->all());

        return response()->json([
            'success' => true,
            'data' => $clinics->items(),
            'meta' => [
                'current_page' => $clinics->currentPage(),
                'last_page' => $clinics->lastPage(),
                'per_page' => $clinics->perPage(),
                'total' => $clinics->total(),
            ],
        ]);
    }

    /**
     * Get clinic by ID
     */
    public function show(int $id): JsonResponse
    {
        $clinic = $this->clinicService->getById($id);

        if (!$clinic) {
            return response()->json([
                'success' => false,
                'message' => 'Clinic not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $clinic,
        ]);
    }

    /**
     * Create new clinic (Super Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'patient_prefix' => 'nullable|string|max:10',
            'admin_name' => 'nullable|string|max:255',
            'admin_email' => 'nullable|email',
            'admin_password' => 'nullable|string|min:6',
            'expires_at' => 'nullable|date',
        ]);

        $clinic = $this->clinicService->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Clinic created successfully',
            'data' => $clinic,
        ], 201);
    }

    /**
     * Update clinic (Super Admin only)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'patient_prefix' => 'nullable|string|max:10',
            'expires_at' => 'nullable|date',
        ]);

        $clinic = $this->clinicService->update($id, $validated);

        if (!$clinic) {
            return response()->json([
                'success' => false,
                'message' => 'Clinic not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Clinic updated successfully',
            'data' => $clinic,
        ]);
    }

    /**
     * Toggle clinic status (Super Admin only)
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $clinic = $this->clinicService->toggleStatus($id);

        if (!$clinic) {
            return response()->json([
                'success' => false,
                'message' => 'Clinic not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Clinic status updated successfully',
            'data' => $clinic,
        ]);
    }

    /**
     * Delete clinic (Super Admin only)
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->clinicService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Clinic not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Clinic deleted successfully',
        ]);
    }

    /**
     * Reset clinic password (Super Admin only)
     */
    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'new_password' => 'required|string|min:6',
        ]);

        $reset = $this->clinicService->resetPassword($id, $validated['new_password']);

        if (!$reset) {
            return response()->json([
                'success' => false,
                'message' => 'Clinic not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully',
        ]);
    }

    /**
     * Get clinic stats
     */
    public function stats(int $id): JsonResponse
    {
        $stats = $this->clinicService->getStats($id);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
