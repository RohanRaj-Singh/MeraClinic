<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ReportTypeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportTypeController extends Controller
{
    public function __construct(
        private ReportTypeService $reportTypeService
    ) {}

    /**
     * Get all report types
     */
    public function index(Request $request): JsonResponse
    {
        $reportTypes = $this->reportTypeService->getAll($request->all());

        return response()->json([
            'success' => true,
            'data' => $reportTypes->items(),
            'meta' => [
                'current_page' => $reportTypes->currentPage(),
                'last_page' => $reportTypes->lastPage(),
                'per_page' => $reportTypes->perPage(),
                'total' => $reportTypes->total(),
            ],
        ]);
    }

    /**
     * Get active report types for dropdown
     */
    public function active(): JsonResponse
    {
        $reportTypes = $this->reportTypeService->getActive();

        return response()->json([
            'success' => true,
            'data' => $reportTypes,
        ]);
    }

    /**
     * Get report type by ID
     */
    public function show(int $id): JsonResponse
    {
        $reportType = $this->reportTypeService->getById($id);

        if (!$reportType) {
            return response()->json([
                'success' => false,
                'message' => 'Report type not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $reportType,
        ]);
    }

    /**
     * Create new report type
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'nullable|string|max:50',
            'normal_range' => 'nullable|string|max:100',
        ]);

        $validated['clinic_id'] = auth()->user()->clinic_id;

        $reportType = $this->reportTypeService->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Report type created successfully',
            'data' => $reportType,
        ], 201);
    }

    /**
     * Update report type
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'unit' => 'nullable|string|max:50',
            'normal_range' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $reportType = $this->reportTypeService->update($id, $validated);

        if (!$reportType) {
            return response()->json([
                'success' => false,
                'message' => 'Report type not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Report type updated successfully',
            'data' => $reportType,
        ]);
    }

    /**
     * Delete report type
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->reportTypeService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Report type not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Report type deleted successfully',
        ]);
    }
}
