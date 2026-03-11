<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Patient extends BaseModel
{
    protected $fillable = [
        'clinic_id',
        'user_id',
        'reference_number',
        'reference_counter',
        'name',
        'phone',
        'whatsapp',
        'address',
        'country',
        'gender',
        'age',
        'date_of_birth',
        'diseases',
        'prescription',
        'notes',
    ];

    protected $casts = [
        'age' => 'integer',
    ];

    // Relationships
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function visits(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Visit::class)->orderBy('visit_date', 'desc');
    }

    public function diseaseList(): BelongsToMany
    {
        return $this->belongsToMany(Disease::class, 'patient_diseases');
    }

    public function reports(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function files(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(File::class);
    }

    // Accessors
    public function getBalanceAttribute(): float
    {
        $totalAmount = $this->visits()->sum('total_amount');
        $receivedAmount = $this->visits()->sum('received_amount');
        
        return $totalAmount - $receivedAmount;
    }

    public function getTotalVisitsAttribute(): int
    {
        return $this->visits()->count();
    }

    public function getLastVisitAttribute(): ?Visit
    {
        return $this->visits()->latest('visit_date')->first();
    }

    // Generate reference number
    public static function generateReferenceNumber(Clinic $clinic): string
    {
        return $clinic->generatePatientReferenceNumber();
    }
}
