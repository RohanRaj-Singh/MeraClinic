<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DiseaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiseaseController extends Controller
{
    public function __construct(
        private DiseaseService $diseaseService
    ) {}

    /**
     * Get all diseases
     */
    public function index(Request $request): JsonResponse
    {
        $diseases = $this->diseaseService->getAll($request->all());

        return response()->json([
            'success' => true,
            'data' => $diseases->items(),
            'meta' => [
                'current_page' => $diseases->currentPage(),
                'last_page' => $diseases->lastPage(),
                'per_page' => $diseases->perPage(),
                'total' => $diseases->total(),
            ],
        ]);
    }

    /**
     * Get disease by ID
     */
    public function show(int $id): JsonResponse
    {
        $disease = $this->diseaseService->getById($id);

        if (!$disease) {
            return response()->json([
                'success' => false,
                'message' => 'Disease not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $disease,
        ]);
    }

    /**
     * Create new disease
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $validated['clinic_id'] = auth()->user()->clinic_id;

        $disease = $this->diseaseService->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Disease created successfully',
            'data' => $disease,
        ], 201);
    }

    /**
     * Update disease
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $disease = $this->diseaseService->update($id, $validated);

        if (!$disease) {
            return response()->json([
                'success' => false,
                'message' => 'Disease not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Disease updated successfully',
            'data' => $disease,
        ]);
    }

    /**
     * Delete disease
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->diseaseService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Disease not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Disease deleted successfully',
        ]);
    }
}
