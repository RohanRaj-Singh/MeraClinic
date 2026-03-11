<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

abstract class BaseModel extends Model
{
    /**
     * Global scope for clinic filtering
     */
    public static function boot(): void
    {
        parent::boot();

        static::addGlobalScope('clinic', function (Builder $builder) {
            // Skip for super_admin
            if (auth()->check() && auth()->user()->role !== 'super_admin') {
                $builder->where('clinic_id', auth()->user()->clinic_id);
            }
        });
    }

    /**
     * Scope to bypass clinic scope
     */
    public function scopeWithoutClinicScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope('clinic');
    }

    /**
     * Scope for specific clinic
     */
    public function scopeForClinic(Builder $query, int $clinicId): Builder
    {
        return $query->where('clinic_id', $clinicId);
    }
}
