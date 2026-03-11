<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'clinic_id',
        'name',
        'email',
        'password',
        'role',
        'phone',
        'is_active',
        'last_login_at',
        'last_login_ip',
        'device_info',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    // Constants
    public const ROLE_DOCTOR = 'doctor';
    public const ROLE_SUPER_ADMIN = 'super_admin';

    // Relationships
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function patients(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function visits(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Visit::class);
    }

    // Check if user is super admin
    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    // Check if user is doctor
    public function isDoctor(): bool
    {
        return $this->role === self::ROLE_DOCTOR;
    }

    // Update login info
    public function updateLoginInfo(string $ip, string $device): void
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
            'device_info' => $device,
        ]);
    }
}
