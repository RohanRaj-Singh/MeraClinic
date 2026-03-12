<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class File extends BaseModel
{
    protected $appends = [
        'url',
        'is_image',
        'is_pdf',
        'formatted_size',
    ];

    protected $fillable = [
        'clinic_id',
        'patient_id',
        'visit_id',
        'type',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    // Constants
    public const TYPE_IMAGE = 'image';
    public const TYPE_PDF = 'pdf';
    public const TYPE_OTHER = 'document';

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

    // Accessors
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    public function getIsImageAttribute(): bool
    {
        return $this->type === self::TYPE_IMAGE;
    }

    public function getIsPdfAttribute(): bool
    {
        return $this->type === self::TYPE_PDF;
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        
        if ($bytes >= 1024 * 1024) {
            return round($bytes / (1024 * 1024), 2) . ' MB';
        }
        
        return round($bytes / 1024, 2) . ' KB';
    }
}
