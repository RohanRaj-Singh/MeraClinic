<?php

namespace App\Services;

use App\Models\Visit;
use App\Models\Patient;
use App\Models\AuditLog;
use Illuminate\Pagination\LengthAwarePaginator;

class VisitService
{
    /**
     * Get all visits with pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Visit::with(['patient', 'clinic']);

        if (!empty($filters['patient_id'])) {
            $query->where('patient_id', $filters['patient_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('visit_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('visit_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['payment_status'])) {
            switch ($filters['payment_status']) {
                case 'paid':
                    $query->whereRaw('total_amount - received_amount <= 0');
                    break;
                case 'partial':
                    $query->whereRaw('total_amount > received_amount AND received_amount > 0');
                    break;
                case 'unpaid':
                    $query->where('received_amount', 0);
                    break;
            }
        }

        return $query->orderBy('visit_date', 'desc')->orderBy('visit_time', 'desc')->paginate(20);
    }

    /**
     * Get visit by ID
     */
    public function getById(int $id): ?Visit
    {
        return Visit::with(['patient', 'clinic', 'reports', 'files'])->find($id);
    }

    /**
     * Create new visit
     */
    public function create(array $data): Visit
    {
        $visit = Visit::create([
            'clinic_id' => $data['clinic_id'],
            'patient_id' => $data['patient_id'],
            'visit_date' => $data['visit_date'] ?? now()->toDateString(),
            'visit_time' => $data['visit_time'] ?? now(),
            'prescription' => $data['prescription'] ?? null,
            'notes' => $data['notes'] ?? null,
            'total_amount' => $data['total_amount'] ?? 0,
            'received_amount' => $data['received_amount'] ?? 0,
        ]);

        // Create reports if provided
        if (!empty($data['reports'])) {
            foreach ($data['reports'] as $report) {
                $visit->reports()->create([
                    'clinic_id' => $data['clinic_id'],
                    'patient_id' => $data['patient_id'],
                    'report_type_id' => $report['report_type_id'],
                    'value' => $report['value'],
                    'notes' => $report['notes'] ?? null,
                    'report_date' => $report['report_date'] ?? now()->toDateString(),
                ]);
            }
        }

        // Audit log
        AuditLog::log(
            $data['clinic_id'],
            auth()->id(),
            'create',
            'visit',
            $visit->id,
            request()->ip(),
            request()->userAgent(),
            null,
            $visit->toArray()
        );

        return $visit;
    }

    /**
     * Update visit
     */
    public function update(int $id, array $data): ?Visit
    {
        $visit = Visit::find($id);
        
        if (!$visit) {
            return null;
        }

        $oldValues = $visit->toArray();

        $visit->update([
            'visit_date' => $data['visit_date'] ?? $visit->visit_date,
            'visit_time' => $data['visit_time'] ?? $visit->visit_time,
            'prescription' => $data['prescription'] ?? $visit->prescription,
            'notes' => $data['notes'] ?? $visit->notes,
            'total_amount' => $data['total_amount'] ?? $visit->total_amount,
            'received_amount' => $data['received_amount'] ?? $visit->received_amount,
        ]);

        // Update reports if provided
        if (isset($data['reports'])) {
            $visit->reports()->delete();
            foreach ($data['reports'] as $report) {
                $visit->reports()->create([
                    'clinic_id' => $visit->clinic_id,
                    'patient_id' => $visit->patient_id,
                    'report_type_id' => $report['report_type_id'],
                    'value' => $report['value'],
                    'notes' => $report['notes'] ?? null,
                    'report_date' => $report['report_date'] ?? now()->toDateString(),
                ]);
            }
        }

        // Audit log
        AuditLog::log(
            $visit->clinic_id,
            auth()->id(),
            'update',
            'visit',
            $visit->id,
            request()->ip(),
            request()->userAgent(),
            $oldValues,
            $visit->fresh()->toArray()
        );

        return $visit->fresh();
    }

    /**
     * Delete visit
     */
    public function delete(int $id): bool
    {
        $visit = Visit::find($id);
        
        if (!$visit) {
            return false;
        }

        $clinicId = $visit->clinic_id;
        $visitData = $visit->toArray();

        $visit->delete();

        // Audit log
        AuditLog::log(
            $clinicId,
            auth()->id(),
            'delete',
            'visit',
            $id,
            request()->ip(),
            request()->userAgent(),
            $visitData,
            null
        );

        return true;
    }

    /**
     * Record payment for visit
     */
    public function recordPayment(int $id, float $amount): ?Visit
    {
        $visit = Visit::find($id);
        
        if (!$visit) {
            return null;
        }

        $newReceivedAmount = $visit->received_amount + $amount;
        
        $visit->update(['received_amount' => $newReceivedAmount]);

        // Audit log
        AuditLog::log(
            $visit->clinic_id,
            auth()->id(),
            'payment',
            'visit',
            $visit->id,
            request()->ip(),
            request()->userAgent(),
            ['received_amount' => $visit->fresh()->received_amount - $amount],
            ['received_amount' => $visit->fresh()->received_amount]
        );

        return $visit->fresh();
    }
}
