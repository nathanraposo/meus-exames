<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamParameter extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'exam_type_id',
        'name',
        'code',
        'description',
        'unit',
        'data_type',
        'decimal_places',
        'display_order',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'decimal_places' => 'integer',
        'display_order' => 'integer',
    ];

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }

    public function referenceValues(): HasMany
    {
        return $this->hasMany(ReferenceValue::class);
    }
}
