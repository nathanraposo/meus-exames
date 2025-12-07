<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StandardReferenceRange extends Model
{
    protected $fillable = [
        'parameter_code',
        'parameter_name',
        'gender',
        'age_min',
        'age_max',
        'reference_min',
        'reference_max',
        'unit',
        'reference_type',
        'reference_categories',
        'condition',
        'description',
        'source',
        'laboratory_id',
        'active',
    ];

    protected $casts = [
        'reference_categories' => 'array',
        'active' => 'boolean',
    ];

    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class);
    }

    /**
     * Query scope to find matching reference range
     */
    public function scopeForParameter($query, string $parameterCode)
    {
        return $query->where('parameter_code', $parameterCode)
            ->where('active', true);
    }

    public function scopeForGender($query, ?string $gender)
    {
        return $query->where(function ($q) use ($gender) {
            $q->where('gender', 'both')
              ->orWhere('gender', $gender);
        });
    }

    public function scopeForAge($query, ?int $age)
    {
        if ($age === null) {
            return $query;
        }

        return $query->where(function ($q) use ($age) {
            $q->where(function ($subQ) use ($age) {
                // Case 1: age_min and age_max are both null (applies to all ages)
                $subQ->whereNull('age_min')
                     ->whereNull('age_max');
            })
            ->orWhere(function ($subQ) use ($age) {
                // Case 2: age is within the specified range
                $subQ->where('age_min', '<=', $age)
                     ->where('age_max', '>=', $age);
            })
            ->orWhere(function ($subQ) use ($age) {
                // Case 3: age_min is set but age_max is null (open-ended upper bound)
                $subQ->where('age_min', '<=', $age)
                     ->whereNull('age_max');
            })
            ->orWhere(function ($subQ) use ($age) {
                // Case 4: age_max is set but age_min is null (open-ended lower bound)
                $subQ->whereNull('age_min')
                     ->where('age_max', '>=', $age);
            });
        });
    }

    public function scopeForLaboratory($query, ?int $laboratoryId)
    {
        return $query->where(function ($q) use ($laboratoryId) {
            $q->whereNull('laboratory_id') // Global defaults
              ->orWhere('laboratory_id', $laboratoryId); // Lab-specific
        })->orderByRaw('laboratory_id IS NULL ASC'); // Prefer lab-specific over global
    }
}
