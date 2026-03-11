<?php

namespace App\Services;

use App\Models\Disease;
use App\Models\AuditLog;
use Illuminate\Pagination\LengthAwarePaginator;

class DiseaseService
{
    /**
     * Get all diseases
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Disease::query();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        return $query->orderBy('name')->paginate(20);
    }

    /**
     * Get disease by ID
     */
    public function getById(int $id): ?Disease
    {
        return Disease::with(['patients'])->find($id);
    }

    /**
     * Create disease
     */
    public function create(array $data): Disease
    {
        $disease = Disease::create([
            'clinic_id' => $data['clinic_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        // Audit log
        AuditLog::log(
            $data['clinic_id'],
            auth()->id(),
            'create',
            'disease',
            $disease->id,
            request()->ip(),
            request()->userAgent(),
            null,
            $disease->toArray()
        );

        return $disease;
    }

    /**
     * Update disease
     */
    public function update(int $id, array $data): ?Disease
    {
        $disease = Disease::find($id);
        
        if (!$disease) {
            return null;
        }

        $oldValues = $disease->toArray();

        $disease->update([
            'name' => $data['name'] ?? $disease->name,
            'description' => $data['description'] ?? $disease->description,
        ]);

        // Audit log
        AuditLog::log(
            $disease->clinic_id,
            auth()->id(),
            'update',
            'disease',
            $disease->id,
            request()->ip(),
            request()->userAgent(),
            $oldValues,
            $disease->fresh()->toArray()
        );

        return $disease->fresh();
    }

    /**
     * Delete disease
     */
    public function delete(int $id): bool
    {
        $disease = Disease::find($id);
        
        if (!$disease) {
            return false;
        }

        $clinicId = $disease->clinic_id;
        $diseaseData = $disease->toArray();

        $disease->delete();

        // Audit log
        AuditLog::log(
            $clinicId,
            auth()->id(),
            'delete',
            'disease',
            $id,
            request()->ip(),
            request()->userAgent(),
            $diseaseData,
            null
        );

        return true;
    }
}
