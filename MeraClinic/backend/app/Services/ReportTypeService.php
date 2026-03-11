<?php

namespace App\Services;

use App\Models\ReportType;
use App\Models\AuditLog;
use Illuminate\Pagination\LengthAwarePaginator;

class ReportTypeService
{
    /**
     * Get all report types
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = ReportType::query();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->orderBy('name')->paginate(20);
    }

    /**
     * Get active report types for dropdown
     */
    public function getActive(): \Illuminate\Database\Eloquent\Collection
    {
        return ReportType::where('is_active', true)->orderBy('name')->get();
    }

    /**
     * Get report type by ID
     */
    public function getById(int $id): ?ReportType
    {
        return ReportType::with(['reports'])->find($id);
    }

    /**
     * Create report type
     */
    public function create(array $data): ReportType
    {
        $reportType = ReportType::create([
            'clinic_id' => $data['clinic_id'],
            'name' => $data['name'],
            'unit' => $data['unit'] ?? null,
            'normal_range' => $data['normal_range'] ?? null,
            'is_active' => true,
        ]);

        // Audit log
        AuditLog::log(
            $data['clinic_id'],
            auth()->id(),
            'create',
            'report_type',
            $reportType->id,
            request()->ip(),
            request()->userAgent(),
            null,
            $reportType->toArray()
        );

        return $reportType;
    }

    /**
     * Update report type
     */
    public function update(int $id, array $data): ?ReportType
    {
        $reportType = ReportType::find($id);
        
        if (!$reportType) {
            return null;
        }

        $oldValues = $reportType->toArray();

        $reportType->update([
            'name' => $data['name'] ?? $reportType->name,
            'unit' => $data['unit'] ?? $reportType->unit,
            'normal_range' => $data['normal_range'] ?? $reportType->normal_range,
            'is_active' => $data['is_active'] ?? $reportType->is_active,
        ]);

        // Audit log
        AuditLog::log(
            $reportType->clinic_id,
            auth()->id(),
            'update',
            'report_type',
            $reportType->id,
            request()->ip(),
            request()->userAgent(),
            $oldValues,
            $reportType->fresh()->toArray()
        );

        return $reportType->fresh();
    }

    /**
     * Delete report type
     */
    public function delete(int $id): bool
    {
        $reportType = ReportType::find($id);
        
        if (!$reportType) {
            return false;
        }

        $clinicId = $reportType->clinic_id;
        $reportTypeData = $reportType->toArray();

        $reportType->delete();

        // Audit log
        AuditLog::log(
            $clinicId,
            auth()->id(),
            'delete',
            'report_type',
            $id,
            request()->ip(),
            request()->userAgent(),
            $reportTypeData,
            null
        );

        return true;
    }
}
