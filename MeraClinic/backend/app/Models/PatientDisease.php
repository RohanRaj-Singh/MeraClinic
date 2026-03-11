<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientDisease extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'patient_id',
        'disease_id',
        'diagnosed_at',
    ];

    protected $casts = [
        'diagnosed_at' => 'date',
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function disease(): BelongsTo
    {
        return $this->belongsTo(Disease::class);
    }
}
