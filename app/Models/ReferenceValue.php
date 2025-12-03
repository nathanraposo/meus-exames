<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferenceValue extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'exam_parameter_id',
        'laboratory_id',
        'gender',
        'age_min',
        'age_max',
        'min_value',
        'max_value',
        'optimal_min',
        'optimal_max',
        'text_reference',
        'condition_description',
        'is_default',
    ];

    protected $casts = [
        'age_min' => 'integer',
        'age_max' => 'integer',
        'min_value' => 'decimal:4',
        'max_value' => 'decimal:4',
        'optimal_min' => 'decimal:4',
        'optimal_max' => 'decimal:4',
        'is_default' => 'boolean',
    ];

    public function examParameter(): BelongsTo
    {
        return $this->belongsTo(ExamParameter::class);
    }

    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class);
    }

    public function scopeForPatient($query, $user)
    {
        $query->where(function ($q) use ($user) {
            $q->where('gender', $user->gender ?? 'all')
              ->orWhere('gender', 'all');
        });

        // Apenas filtra por idade se o usuário tiver birth_date
        if ($user->age !== null) {
            $age = $user->age;
            $query->where(function ($q) use ($age) {
                $q->where(function ($ageQuery) {
                    $ageQuery->whereNull('age_min')
                             ->whereNull('age_max');
                })->orWhere(function ($ageQuery) use ($age) {
                    $ageQuery->where('age_min', '<=', $age)
                             ->where('age_max', '>=', $age);
                });
            });
        } else {
            // Se não tem idade, retorna apenas valores sem restrição de idade
            $query->where(function ($q) {
                $q->whereNull('age_min')
                  ->whereNull('age_max');
            });
        }

        return $query;
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}
