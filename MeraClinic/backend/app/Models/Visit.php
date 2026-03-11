<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Visit extends BaseModel
{
    protected $fillable = [
        'clinic_id',
        'patient_id',
        'visit_date',
        'visit_time',
        'prescription',
        'notes',
        'total_amount',
        'received_amount',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'visit_time' => 'datetime',
        'total_amount' => 'decimal:2',
        'received_amount' => 'decimal:2',
    ];

    // Relationships
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
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
        return $this->total_amount - $this->received_amount;
    }

    public function getIsPaidAttribute(): bool
    {
        return $this->balance <= 0;
    }

    public function getPaymentStatusAttribute(): string
    {
        if ($this->received_amount == 0) {
            return 'unpaid';
        } elseif ($this->balance > 0) {
            return 'partial';
        }
        return 'paid';
    }
}
