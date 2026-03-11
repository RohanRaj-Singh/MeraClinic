<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function __construct(
        private FileService $fileService
    ) {}

    /**
     * Get all files
     */
    public function index(Request $request): JsonResponse
    {
        $files = $this->fileService->getAll($request->all());

        return response()->json([
            'success' => true,
            'data' => $files->items(),
            'meta' => [
                'current_page' => $files->currentPage(),
                'last_page' => $files->lastPage(),
                'per_page' => $files->perPage(),
                'total' => $files->total(),
            ],
        ]);
    }

    /**
     * Get file by ID
     */
    public function show(int $id): JsonResponse
    {
        $file = $this->fileService->getById($id);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $file,
        ]);
    }

    /**
     * Upload file
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'patient_id' => 'nullable|integer|exists:patients,id',
            'visit_id' => 'nullable|integer|exists:visits,id',
        ]);

        $data = [
            'clinic_id' => auth()->user()->clinic_id,
            'patient_id' => $validated['patient_id'] ?? null,
            'visit_id' => $validated['visit_id'] ?? null,
        ];

        $file = $this->fileService->upload($data, $request->file('file'));

        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully',
            'data' => $file,
        ], 201);
    }

    /**
     * Delete file
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->fileService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully',
        ]);
    }

    /**
     * Download file
     */
    public function download(int $id)
    {
        $response = $this->fileService->download($id);

        if (!$response) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return $response;
    }
}
