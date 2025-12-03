<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamResult extends Model
{
    protected $fillable = [
        'exam_id',
        'exam_parameter_id',
        'numeric_value',
        'text_value',
        'boolean_value',
        'reference_min',
        'reference_max',
        'status',
        'observation',
    ];

    protected $casts = [
        'numeric_value' => 'decimal:4',
        'reference_min' => 'decimal:4',
        'reference_max' => 'decimal:4',
        'boolean_value' => 'boolean',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function examParameter(): BelongsTo
    {
        return $this->belongsTo(ExamParameter::class);
    }

    public function determineStatus(): string
    {
        if ($this->numeric_value === null || $this->reference_min === null || $this->reference_max === null) {
            return 'normal';
        }

        if ($this->numeric_value < $this->reference_min) {
            return 'low';
        }

        if ($this->numeric_value > $this->reference_max) {
            return 'high';
        }

        return 'normal';
    }

    public function isAbnormal(): bool
    {
        return in_array($this->status, ['low', 'high', 'critical']);
    }
}
