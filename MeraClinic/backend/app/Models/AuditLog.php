<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'clinic_id',
        'user_id',
        'action',
        'description',
        'ip_address',
        'device_info',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Relationships
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Create audit log
    public static function log(
        ?int $clinicId,
        ?int $userId,
        string $action,
        string $entityType = null,
        ?int $entityId = null,
        string $ipAddress = null,
        string $userAgent = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): self {
        return self::create([
            'clinic_id' => $clinicId,
            'user_id' => $userId,
            'action' => $action,
            'description' => $entityType ? "{$entityType} ID: {$entityId}" : null,
            'ip_address' => $ipAddress,
            'device_info' => $userAgent,
            'created_at' => now(),
        ]);
    }
}
