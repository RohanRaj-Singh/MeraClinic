<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends BaseModel
{
    protected $appends = [
        'report_type_name',
    ];

    protected $fillable = [
        'clinic_id',
        'patient_id',
        'visit_id',
        'report_type_id',
        'value',
        'notes',
        'report_date',
    ];

    protected $casts = [
        'report_date' => 'date',
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

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function reportType(): BelongsTo
    {
        return $this->belongsTo(ReportType::class);
    }

    // Accessor for report_type_name
    public function getReportTypeNameAttribute(): ?string
    {
        return $this->reportType?->name;
    }
}
