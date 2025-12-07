<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamResult;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = $this->getStats();
        $recentExams = $this->getRecentExams();
        $abnormalResults = $this->getAbnormalResults();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentExams' => $recentExams,
            'abnormalResults' => $abnormalResults,
        ]);
    }

    protected function getStats()
    {
        $query = Exam::where('user_id', auth()->id());

        $totalExams = $query->count();
        $examsThisMonth = (clone $query)->whereMonth('collection_date', now()->month)->count();

        // Conta apenas parâmetros cujo ÚLTIMO resultado está anormal
        $examIds = $query->pluck('id');
        $abnormalCount = ExamResult::with(['exam'])
            ->whereIn('exam_id', $examIds)
            ->get()
            ->groupBy('exam_parameter_id')
            ->map(function ($results) {
                // Para cada parâmetro, pega o resultado do ÚLTIMO EXAME
                return $results->sortByDesc(function ($result) {
                    return $result->exam->collection_date;
                })->first();
            })
            // Filtra: só conta se o último exame estiver anormal
            ->filter(function ($result) {
                return in_array($result->status, ['low', 'high', 'critical']);
            })
            ->count();

        return [
            'total_exams' => $totalExams,
            'exams_this_month' => $examsThisMonth,
            'abnormal_results' => $abnormalCount,
        ];
    }

    protected function getRecentExams()
    {
        return Exam::with(['user', 'laboratory', 'examType'])
            ->where('user_id', auth()->id())
            ->latest('collection_date')
            ->take(5)
            ->get();
    }

    protected function getAbnormalResults()
    {
        $examQuery = Exam::where('user_id', auth()->id());

        return ExamResult::with(['exam.user', 'examParameter'])
            ->whereIn('exam_id', $examQuery->pluck('id'))
            ->whereIn('status', ['low', 'high', 'critical'])
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(function ($result) {
                return [
                    'patient_name' => $result->exam->user->name,
                    'parameter_name' => $result->examParameter->name,
                    'value' => $result->numeric_value,
                    'unit' => $result->examParameter->unit,
                    'status' => $result->status,
                    'reference_min' => $result->reference_min,
                    'reference_max' => $result->reference_max,
                    'date' => $result->exam->collection_date->format('d/m/Y'),
                ];
            });
    }

    public function abnormalResults()
    {
        $examIds = Exam::where('user_id', auth()->id())->pluck('id');

        // Busca TODOS os resultados do usuário
        $abnormalResults = ExamResult::with(['exam.laboratory', 'examParameter'])
            ->whereIn('exam_id', $examIds)
            ->get()
            ->groupBy('exam_parameter_id')
            ->map(function ($results) {
                // Para cada parâmetro, pega o resultado do ÚLTIMO EXAME (data mais recente)
                return $results->sortByDesc(function ($result) {
                    return $result->exam->collection_date;
                })->first();
            })
            // Filtra: só mostra se o último exame estiver anormal
            ->filter(function ($result) {
                return in_array($result->status, ['low', 'high', 'critical']);
            })
            ->map(function ($result) {
                return [
                    'id' => $result->id,
                    'exam_id' => $result->exam_id,
                    'parameter_code' => $result->examParameter->code,
                    'parameter_name' => $result->examParameter->name,
                    'value' => $result->numeric_value ?? $result->text_value,
                    'unit' => $result->examParameter->unit,
                    'status' => $result->status,
                    'reference_min' => $result->reference_min,
                    'reference_max' => $result->reference_max,
                    'exam_date' => $result->exam->collection_date->format('d/m/Y'),
                    'laboratory_name' => $result->exam->laboratory->name,
                ];
            })
            ->values()
            ->sortByDesc('exam_date')
            ->values();

        return Inertia::render('abnormal-results', [
            'abnormalResults' => $abnormalResults,
        ]);
    }

    public function allParameters()
    {
        $examIds = Exam::where('user_id', auth()->id())->pluck('id');

        // Busca TODOS os resultados do usuário
        $allParameters = ExamResult::with(['exam.laboratory', 'examParameter'])
            ->whereIn('exam_id', $examIds)
            ->get()
            // Agrupa por código do parâmetro em vez de ID (evita duplicatas)
            ->groupBy(function ($result) {
                return $result->examParameter->code;
            })
            ->map(function ($results) {
                // Para cada parâmetro, pega o resultado do ÚLTIMO EXAME (data mais recente)
                $latestResult = $results->sortByDesc(function ($result) {
                    return $result->exam->collection_date;
                })->first();

                return [
                    'id' => $latestResult->id,
                    'exam_id' => $latestResult->exam_id,
                    'parameter_code' => $latestResult->examParameter->code,
                    'parameter_name' => $latestResult->examParameter->name,
                    'value' => $latestResult->numeric_value ?? $latestResult->text_value,
                    'unit' => $latestResult->examParameter->unit,
                    'status' => $latestResult->status,
                    'reference_min' => $latestResult->reference_min,
                    'reference_max' => $latestResult->reference_max,
                    'reference_type' => $latestResult->reference_type,
                    'reference_categories' => $latestResult->reference_categories,
                    'reference_description' => $latestResult->reference_description,
                    'exam_date' => $latestResult->exam->collection_date->format('d/m/Y'),
                    'laboratory_name' => $latestResult->exam->laboratory->name,
                    'total_exams' => $results->pluck('exam_id')->unique()->count(),
                ];
            })
            // Ordena alfabeticamente (normaliza acentuação para ordenação correta)
            ->sort(function ($a, $b) {
                // Remove acentos e converte para minúsculo para comparação
                $nameA = iconv('UTF-8', 'ASCII//TRANSLIT', $a['parameter_name']);
                $nameB = iconv('UTF-8', 'ASCII//TRANSLIT', $b['parameter_name']);
                return strcasecmp($nameA, $nameB);
            })
            ->values();

        return Inertia::render('all-parameters', [
            'allParameters' => $allParameters,
        ]);
    }
}
