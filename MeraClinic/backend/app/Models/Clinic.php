<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Clinic extends Model
{
    public const DEFAULT_PATIENT_PREFIX = 'MC';

    protected $fillable = [
        'name',
        'slug',
        'email',
        'address',
        'phone',
        'whatsapp',
        'patient_prefix',
        'patient_counter',
        'reference_counter',
        'subscription_status',
        'subscription_expires_at',
        'is_active',
        'settings',
        'expires_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
        'subscription_expires_at' => 'datetime',
    ];

    // Relationships
    public function users(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class);
    }

    public function patients(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function visits(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Visit::class);
    }

    public function diseases(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Disease::class);
    }

    public function reportTypes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ReportType::class);
    }

    // Generate patient reference number
    public function generatePatientReferenceNumber(): string
    {
        $this->reference_counter = ($this->reference_counter ?? 0) + 1;
        $this->save();

        $patientPrefix = strtoupper(trim($this->patient_prefix ?: self::DEFAULT_PATIENT_PREFIX));

        return $patientPrefix . '-' . str_pad($this->reference_counter, 4, '0', STR_PAD_LEFT);
    }

    // Check subscription status
    public function hasActiveSubscription(): bool
    {
        return $this->is_active && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
