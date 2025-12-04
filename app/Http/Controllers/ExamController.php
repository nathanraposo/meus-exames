<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Laboratory;
use App\Services\ExamProcessingService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamController extends Controller
{
    use AuthorizesRequests;

    protected ExamProcessingService $examProcessor;

    public function __construct(ExamProcessingService $examProcessor)
    {
        $this->examProcessor = $examProcessor;
    }

    public function index()
    {
        $exams = Exam::with(['user', 'laboratory', 'examType'])
            ->where('user_id', auth()->id())
            ->latest('collection_date')
            ->get();

        return Inertia::render('exams/index', [
            'exams' => $exams,
        ]);
    }

    public function create()
    {
        return Inertia::render('exams/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pdf_file' => 'required|file|mimes:pdf|max:10240',
        ]);

        try {
            $exam = $this->examProcessor->processExam(
                $request->file('pdf_file'),
                auth()->id()
            );

            return redirect()->route('exams.show', $exam)
                ->with('success', 'Exame processado com sucesso! Laboratório identificado automaticamente.');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['pdf_file' => 'Erro ao processar PDF: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function show(Exam $exam)
    {
        $this->authorize('view', $exam);

        $exam->load([
            'user',
            'laboratory',
            'examType',
            'results.examParameter',
        ]);

        $laboratories = Laboratory::where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('exams/show', [
            'exam' => $exam,
            'laboratories' => $laboratories,
        ]);
    }

    public function updateLaboratory(Request $request, Exam $exam)
    {
        $this->authorize('update', $exam);

        $validated = $request->validate([
            'laboratory_id' => 'required|exists:laboratories,id',
        ]);

        $exam->update([
            'laboratory_id' => $validated['laboratory_id'],
        ]);

        return back()->with('success', 'Laboratório atualizado com sucesso!');
    }

    public function destroy(Exam $exam)
    {
        $this->authorize('delete', $exam);

        $exam->delete();

        return redirect()->route('exams.index')
            ->with('success', 'Exame removido com sucesso!');
    }

    public function history($parameterCode)
    {
        $history = Exam::where('user_id', auth()->id())
            ->with(['results' => function ($q) use ($parameterCode) {
                $q->whereHas('examParameter', function ($q) use ($parameterCode) {
                    $q->where('code', $parameterCode);
                })->with('examParameter');
            }])
            ->whereHas('results.examParameter', function ($q) use ($parameterCode) {
                $q->where('code', $parameterCode);
            })
            ->orderBy('collection_date')
            ->get()
            ->map(function ($exam) {
                $result = $exam->results->first();
                return [
                    'date' => $exam->collection_date->format('Y-m-d'),
                    'value' => $result->numeric_value,
                    'unit' => $result->examParameter->unit,
                    'status' => $result->status,
                    'reference_min' => $result->reference_min,
                    'reference_max' => $result->reference_max,
                ];
            });

        return response()->json($history);
    }
}
