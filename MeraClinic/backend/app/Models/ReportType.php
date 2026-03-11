<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportType extends BaseModel
{
    protected $fillable = [
        'clinic_id',
        'name',
        'unit',
        'normal_range',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
