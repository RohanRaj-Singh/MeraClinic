<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\VisitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisitController extends Controller
{
    public function __construct(
        private VisitService $visitService
    ) {}

    /**
     * Get next visit number for a patient
     */
    public function getNextVisitNumber(int $patientId): JsonResponse
    {
        $visitNumber = $this->visitService->getNextVisitNumber($patientId);

        return response()->json([
            'success' => true,
            'data' => [
                'visit_number' => $visitNumber,
            ],
        ]);
    }

    /**
     * Get all visits
     */
    public function index(Request $request): JsonResponse
    {
        $visits = $this->visitService->getAll($request->all());

        return response()->json([
            'success' => true,
            'data' => $visits->items(),
            'meta' => [
                'current_page' => $visits->currentPage(),
                'last_page' => $visits->lastPage(),
                'per_page' => $visits->perPage(),
                'total' => $visits->total(),
            ],
        ]);
    }

    /**
     * Get visit by ID
     */
    public function show(int $id): JsonResponse
    {
        $visit = $this->visitService->getById($id);

        if (!$visit) {
            return response()->json([
                'success' => false,
                'message' => 'Visit not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $visit,
        ]);
    }

    /**
     * Create new visit
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|integer|exists:patients,id',
            'visit_date' => 'nullable|date',
            'visit_time' => 'nullable',
            'prescription' => 'nullable|string',
            'notes' => 'nullable|string',
            'total_amount' => 'nullable|numeric|min:0',
            'received_amount' => 'nullable|numeric|min:0',
            'reports' => 'nullable|array',
            'reports.*.report_type_id' => 'required|integer|exists:report_types,id',
            'reports.*.value' => 'required|string',
            'reports.*.notes' => 'nullable|string',
            'reports.*.report_date' => 'nullable|date',
        ]);

        $validated['clinic_id'] = auth()->user()->clinic_id;

        $visit = $this->visitService->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Visit created successfully',
            'data' => $visit,
        ], 201);
    }

    /**
     * Update visit
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'visit_date' => 'nullable|date',
            'visit_time' => 'nullable',
            'prescription' => 'nullable|string',
            'notes' => 'nullable|string',
            'total_amount' => 'nullable|numeric|min:0',
            'received_amount' => 'nullable|numeric|min:0',
            'reports' => 'nullable|array',
            'reports.*.report_type_id' => 'required|integer|exists:report_types,id',
            'reports.*.value' => 'required|string',
            'reports.*.notes' => 'nullable|string',
            'reports.*.report_date' => 'nullable|date',
        ]);

        $visit = $this->visitService->update($id, $validated);

        if (!$visit) {
            return response()->json([
                'success' => false,
                'message' => 'Visit not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Visit updated successfully',
            'data' => $visit,
        ]);
    }

    /**
     * Delete visit
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->visitService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Visit not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Visit deleted successfully',
        ]);
    }

    /**
     * Record payment
     */
    public function recordPayment(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $visit = $this->visitService->recordPayment($id, $validated['amount']);

        if (!$visit) {
            return response()->json([
                'success' => false,
                'message' => 'Visit not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data' => $visit,
        ]);
    }
}
