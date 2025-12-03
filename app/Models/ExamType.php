<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamType extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'category',
        'preparation_time_hours',
        'preparation_instructions',
        'requires_fasting',
        'active',
    ];

    protected $casts = [
        'requires_fasting' => 'boolean',
        'active' => 'boolean',
        'preparation_time_hours' => 'integer',
    ];

    public function parameters(): HasMany
    {
        return $this->hasMany(ExamParameter::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }
}
