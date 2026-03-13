<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClinicService
{
    /**
     * Get current user's clinic
     */
    public function getCurrentClinic(): ?Clinic
    {
        $clinicId = auth()->user()->clinic_id;
        return Clinic::find($clinicId);
    }

    /**
     * Update current user's clinic
     */
    public function updateCurrent(array $data): Clinic
    {
        $clinicId = auth()->user()->clinic_id;
        $clinic = Clinic::findOrFail($clinicId);

        $clinic->update([
            'name' => $data['name'] ?? $clinic->name,
            'address' => $data['address'] ?? $clinic->address,
            'phone' => $data['phone'] ?? $clinic->phone,
            'whatsapp' => $data['whatsapp'] ?? $clinic->whatsapp,
            'patient_prefix' => isset($data['patient_prefix'])
                ? strtoupper($data['patient_prefix'])
                : $clinic->patient_prefix,
        ]);

        return $clinic->fresh();
    }

    /**
     * Get all clinics (Super Admin only)
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Clinic::query()
            ->withCount(['users', 'patients', 'visits'])
            ->with([
                'users' => fn ($query) => $query
                    ->select('id', 'clinic_id', 'name', 'email', 'phone', 'is_active')
                    ->orderBy('id'),
            ]);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    /**
     * Get clinic by ID
     */
    public function getById(int $id): ?Clinic
    {
        return Clinic::with([
            'users' => fn ($query) => $query
                ->select('id', 'clinic_id', 'name', 'email', 'phone', 'is_active', 'last_login_at', 'last_login_ip')
                ->orderBy('id'),
            'patients',
            'diseases',
            'reportTypes',
        ])->withCount(['users', 'patients', 'visits'])->find($id);
    }

    /**
     * Create new clinic
     */
    public function create(array $data): Clinic
    {
        $clinic = Clinic::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']) . '-' . time(),
            'email' => $data['admin_email'],
            'address' => $data['address'] ?? null,
            'phone' => $data['phone'] ?? null,
            'whatsapp' => $data['whatsapp'] ?? null,
            'patient_prefix' => strtoupper($data['patient_prefix'] ?? Clinic::DEFAULT_PATIENT_PREFIX),
            'reference_counter' => 0,
            'is_active' => true,
            'expires_at' => $data['expires_at'] ?? null,
        ]);

        // Create admin user if provided
        if (!empty($data['admin_email'])) {
            User::create([
                'clinic_id' => $clinic->id,
                'name' => $data['admin_name'] ?? 'Admin',
                'email' => $data['admin_email'],
                'password' => Hash::make($data['admin_password'] ?? 'password'),
                'role' => User::ROLE_DOCTOR,
                'phone' => $data['phone'] ?? null,
                'is_active' => true,
            ]);
        }

        // Audit log (Super Admin action - no clinic_id)
        AuditLog::log(
            null,
            auth()->id(),
            'create',
            'clinic',
            $clinic->id,
            request()->ip(),
            request()->userAgent(),
            null,
            $clinic->toArray()
        );

        return $clinic;
    }

    /**
     * Update clinic
     */
    public function update(int $id, array $data): ?Clinic
    {
        $clinic = Clinic::find($id);
        
        if (!$clinic) {
            return null;
        }

        $oldValues = $clinic->toArray();

        $clinic->update([
            'name' => $data['name'] ?? $clinic->name,
            'address' => $data['address'] ?? $clinic->address,
            'phone' => $data['phone'] ?? $clinic->phone,
            'whatsapp' => $data['whatsapp'] ?? $clinic->whatsapp,
            'patient_prefix' => isset($data['patient_prefix'])
                ? strtoupper($data['patient_prefix'])
                : $clinic->patient_prefix,
            'expires_at' => $data['expires_at'] ?? $clinic->expires_at,
        ]);

        // Audit log
        AuditLog::log(
            null,
            auth()->id(),
            'update',
            'clinic',
            $clinic->id,
            request()->ip(),
            request()->userAgent(),
            $oldValues,
            $clinic->fresh()->toArray()
        );

        return $clinic->fresh();
    }

    /**
     * Toggle clinic active status
     */
    public function toggleStatus(int $id): ?Clinic
    {
        $clinic = Clinic::find($id);
        
        if (!$clinic) {
            return null;
        }

        $oldValues = $clinic->toArray();
        
        $clinic->update(['is_active' => !$clinic->is_active]);

        // Disable all users in clinic
        User::where('clinic_id', $clinic->id)->update(['is_active' => $clinic->is_active]);

        // Audit log
        AuditLog::log(
            null,
            auth()->id(),
            'toggle_status',
            'clinic',
            $clinic->id,
            request()->ip(),
            request()->userAgent(),
            $oldValues,
            $clinic->fresh()->toArray()
        );

        return $clinic->fresh();
    }

    /**
     * Delete clinic (Soft delete or hard delete)
     */
    public function delete(int $id): bool
    {
        $clinic = Clinic::find($id);
        
        if (!$clinic) {
            return false;
        }

        $clinicData = $clinic->toArray();

        // Delete all related data
        User::where('clinic_id', $clinic->id)->delete();

        $clinic->delete();

        // Audit log
        AuditLog::log(
            null,
            auth()->id(),
            'delete',
            'clinic',
            $id,
            request()->ip(),
            request()->userAgent(),
            $clinicData,
            null
        );

        return true;
    }

    /**
     * Reset clinic admin password
     */
    public function resetPassword(int $clinicId, string $newPassword): bool
    {
        $clinic = Clinic::find($clinicId);
        
        if (!$clinic) {
            return false;
        }

        // Find first doctor user
        $user = User::where('clinic_id', $clinicId)->first();
        
        if (!$user) {
            return false;
        }

        $user->update(['password' => Hash::make($newPassword)]);

        // Audit log
        AuditLog::log(
            null,
            auth()->id(),
            'reset_password',
            'user',
            $user->id,
            request()->ip(),
            request()->userAgent()
        );

        return true;
    }

    /**
     * Get clinic statistics
     */
    public function getStats(int $clinicId): array
    {
        $clinic = Clinic::find($clinicId);
        
        if (!$clinic) {
            return [];
        }

        return [
            'total_patients' => $clinic->patients()->count(),
            'total_visits' => $clinic->visits()->count(),
            'total_revenue' => $clinic->visits()->sum('total_amount'),
            'total_received' => $clinic->visits()->sum('received_amount'),
            'total_balance' => $clinic->visits()->sum('total_amount') - $clinic->visits()->sum('received_amount'),
            'patients_this_month' => $clinic->patients()->whereMonth('created_at', now()->month)->count(),
            'visits_this_month' => $clinic->visits()->whereMonth('visit_date', now()->month)->count(),
            'revenue_this_month' => $clinic->visits()->whereMonth('visit_date', now()->month)->sum('total_amount'),
        ];
    }
}
