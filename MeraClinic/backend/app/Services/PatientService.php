<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Clinic;
use App\Models\AuditLog;
use App\Models\Report;
use Illuminate\Pagination\LengthAwarePaginator;

class PatientService
{
    /**
     * Get all patients with pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Patient::with(['clinic', 'diseaseList', 'reports.reportType']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['disease_id'])) {
            $query->whereHas('diseaseList', function ($q) use ($filters) {
                $q->where('diseases.id', $filters['disease_id']);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    /**
     * Get patient by ID
     */
    public function getById(int $id): ?Patient
    {
        return Patient::with(['clinic', 'diseaseList', 'visits', 'reports.reportType', 'files'])->find($id);
    }

    /**
     * Create new patient
     */
    public function create(array $data): Patient
    {
        $clinic = Clinic::find($data['clinic_id']);
        
        $patient = Patient::create([
            'clinic_id' => $data['clinic_id'],
            'user_id' => auth()->id(),
            'reference_number' => $clinic->generatePatientReferenceNumber(),
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'whatsapp' => $data['whatsapp'] ?? null,
            'address' => $data['address'] ?? null,
            'country' => $data['country'] ?? 'Pakistan',
            'gender' => $data['gender'] ?? null,
            'age' => $data['age'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'diseases' => $data['diseases'] ?? null,
            'prescription' => $data['prescription'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        // Attach diseases if provided
        if (!empty($data['disease_ids'])) {
            $patient->diseaseList()->attach($data['disease_ids']);
        }

        // Create reports if provided
        if (!empty($data['reports'])) {
            foreach ($data['reports'] as $report) {
                Report::create([
                    'clinic_id' => $data['clinic_id'],
                    'patient_id' => $patient->id,
                    'report_type_id' => $report['report_type_id'],
                    'value' => $report['value'],
                    'notes' => $report['notes'] ?? null,
                    'report_date' => now()->toDateString(),
                ]);
            }
        }

        // Audit log
        AuditLog::log(
            $data['clinic_id'],
            auth()->id(),
            'create',
            'patient',
            $patient->id,
            request()->ip(),
            request()->userAgent(),
            null,
            $patient->toArray()
        );

        return $patient;
    }

    /**
     * Update patient
     */
    public function update(int $id, array $data): ?Patient
    {
        $patient = Patient::find($id);
        
        if (!$patient) {
            return null;
        }

        $oldValues = $patient->toArray();

        $patient->update([
            'name' => $data['name'] ?? $patient->name,
            'phone' => $data['phone'] ?? $patient->phone,
            'whatsapp' => $data['whatsapp'] ?? $patient->whatsapp,
            'address' => $data['address'] ?? $patient->address,
            'country' => $data['country'] ?? $patient->country,
            'gender' => $data['gender'] ?? $patient->gender,
            'age' => $data['age'] ?? $patient->age,
            'date_of_birth' => $data['date_of_birth'] ?? $patient->date_of_birth,
            'diseases' => $data['diseases'] ?? $patient->diseases,
            'prescription' => $data['prescription'] ?? $patient->prescription,
            'notes' => $data['notes'] ?? $patient->notes,
        ]);

        // Update diseases if provided
        if (isset($data['disease_ids'])) {
            $patient->diseaseList()->sync($data['disease_ids']);
        }

        // Update reports if provided
        if (isset($data['reports'])) {
            // Delete existing reports for this patient
            $patient->reports()->delete();
            
            // Create new reports
            foreach ($data['reports'] as $report) {
                Report::create([
                    'clinic_id' => $patient->clinic_id,
                    'patient_id' => $patient->id,
                    'report_type_id' => $report['report_type_id'],
                    'value' => $report['value'],
                    'notes' => $report['notes'] ?? null,
                    'report_date' => now()->toDateString(),
                ]);
            }
        }

        // Audit log
        AuditLog::log(
            $patient->clinic_id,
            auth()->id(),
            'update',
            'patient',
            $patient->id,
            request()->ip(),
            request()->userAgent(),
            $oldValues,
            $patient->fresh()->toArray()
        );

        return $patient->fresh();
    }

    /**
     * Delete patient
     */
    public function delete(int $id): bool
    {
        $patient = Patient::find($id);
        
        if (!$patient) {
            return false;
        }

        $clinicId = $patient->clinic_id;
        $patientData = $patient->toArray();

        $patient->delete();

        // Audit log
        AuditLog::log(
            $clinicId,
            auth()->id(),
            'delete',
            'patient',
            $id,
            request()->ip(),
            request()->userAgent(),
            $patientData,
            null
        );

        return true;
    }

    /**
     * Get patient balance
     */
    public function getBalance(int $id): float
    {
        $patient = $this->getById($id);
        return $patient ? $patient->balance : 0;
    }
}
