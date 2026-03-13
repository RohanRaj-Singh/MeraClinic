<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PatientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function __construct(
        private PatientService $patientService
    ) {}

    /**
     * Get all patients
     */
    public function index(Request $request): JsonResponse
    {
        $patients = $this->patientService->getAll($request->all());

        return response()->json([
            'success' => true,
            'data' => $patients->items(),
            'meta' => [
                'current_page' => $patients->currentPage(),
                'last_page' => $patients->lastPage(),
                'per_page' => $patients->perPage(),
                'total' => $patients->total(),
            ],
        ]);
    }

    /**
     * Get patient by ID
     */
    public function show(int $id): JsonResponse
    {
        $patient = $this->patientService->getById($id);

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $patient,
        ]);
    }

    /**
     * Create new patient
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'country' => 'nullable|string|max:100',
            'gender' => 'nullable|in:male,female,other',
            'age' => 'nullable|integer|min:0|max:150',
            'date_of_birth' => 'nullable|date|before_or_equal:today',
            'diseases' => 'nullable|string',
            'prescription' => 'nullable|string',
            'notes' => 'nullable|string',
            'disease_ids' => 'nullable|array',
            'disease_ids.*' => 'integer|exists:diseases,id',
            'reports' => 'nullable|array',
            'reports.*' => 'array',
            'reports.*.report_type_id' => 'required|integer|exists:report_types,id',
            'reports.*.value' => 'required|string',
            'reports.*.notes' => 'nullable|string',
        ]);

        $validated['clinic_id'] = auth()->user()->clinic_id;

        $patient = $this->patientService->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Patient created successfully',
            'data' => $patient,
        ], 201);
    }

    /**
     * Update patient
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'country' => 'nullable|string|max:100',
            'gender' => 'nullable|in:male,female,other',
            'age' => 'nullable|integer|min:0|max:150',
            'date_of_birth' => 'nullable|date|before_or_equal:today',
            'diseases' => 'nullable|string',
            'prescription' => 'nullable|string',
            'notes' => 'nullable|string',
            'disease_ids' => 'nullable|array',
            'disease_ids.*' => 'integer|exists:diseases,id',
            'reports' => 'nullable|array',
            'reports.*' => 'array',
            'reports.*.report_type_id' => 'required|integer|exists:report_types,id',
            'reports.*.value' => 'required|string',
            'reports.*.notes' => 'nullable|string',
        ]);

        $patient = $this->patientService->update($id, $validated);

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Patient updated successfully',
            'data' => $patient,
        ]);
    }

    /**
     * Delete patient
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->patientService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Patient deleted successfully',
        ]);
    }

    /**
     * Get patient balance
     */
    public function balance(int $id): JsonResponse
    {
        $balance = $this->patientService->getBalance($id);

        return response()->json([
            'success' => true,
            'data' => [
                'patient_id' => $id,
                'balance' => $balance,
            ],
        ]);
    }
}
