<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'exam_type_id',
        'laboratory_id',
        'title',
        'protocol_number',
        'collection_date',
        'collection_time',
        'result_date',
        'result_time',
        'status',
        'notes',
        'file_path',
        'requesting_doctor',
        'crm_doctor',
    ];

    protected $casts = [
        'collection_date' => 'date',
        'result_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Manter compatibilidade temporária
    public function patient(): BelongsTo
    {
        return $this->user();
    }

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }

    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('collection_date', '>=', now()->subDays($days));
    }
}
