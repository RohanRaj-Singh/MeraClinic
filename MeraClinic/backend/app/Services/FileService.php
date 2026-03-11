<?php

namespace App\Services;

use App\Models\File;
use App\Models\AuditLog;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class FileService
{
    /**
     * Get all files
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = File::with(['patient', 'visit']);

        if (!empty($filters['patient_id'])) {
            $query->where('patient_id', $filters['patient_id']);
        }

        if (!empty($filters['visit_id'])) {
            $query->where('visit_id', $filters['visit_id']);
        }

        if (!empty($filters['file_type'])) {
            $query->where('file_type', $filters['file_type']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    /**
     * Get file by ID
     */
    public function getById(int $id): ?File
    {
        return File::with(['patient', 'visit', 'clinic'])->find($id);
    }

    /**
     * Upload file
     */
    public function upload(array $data, UploadedFile $file): File
    {
        $clinicId = $data['clinic_id'];
        
        // Determine file type
        $fileType = $this->getFileType($file->getMimeType());
        
        // Generate unique filename
        $filename = time() . '_' . $file->getClientOriginalName();
        
        // Store file
        $path = $file->storeAs('clinics/' . $clinicId, $filename, 'public');

        // Create file record
        $fileRecord = File::create([
            'clinic_id' => $clinicId,
            'patient_id' => $data['patient_id'] ?? null,
            'visit_id' => $data['visit_id'] ?? null,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        // Audit log
        AuditLog::log(
            $clinicId,
            auth()->id(),
            'upload',
            'file',
            $fileRecord->id,
            request()->ip(),
            request()->userAgent(),
            null,
            $fileRecord->toArray()
        );

        return $fileRecord;
    }

    /**
     * Delete file
     */
    public function delete(int $id): bool
    {
        $file = File::find($id);
        
        if (!$file) {
            return false;
        }

        $clinicId = $file->clinic_id;
        
        // Delete physical file
        if (Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }

        $fileData = $file->toArray();
        
        $file->delete();

        // Audit log
        AuditLog::log(
            $clinicId,
            auth()->id(),
            'delete',
            'file',
            $id,
            request()->ip(),
            request()->userAgent(),
            $fileData,
            null
        );

        return true;
    }

    /**
     * Get file type from mime type
     */
    private function getFileType(string $mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return File::TYPE_IMAGE;
        }
        
        if ($mimeType === 'application/pdf') {
            return File::TYPE_PDF;
        }
        
        return File::TYPE_OTHER;
    }

    /**
     * Download file
     */
    public function download(int $id): ?\Symfony\Component\HttpFoundation\StreamedResponse
    {
        $file = $this->getById($id);
        
        if (!$file) {
            return null;
        }

        return Storage::disk('public')->download($file->file_path, $file->file_name);
    }
}
