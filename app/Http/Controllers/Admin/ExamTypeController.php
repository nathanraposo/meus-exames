<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamTypeController extends Controller
{
    public function index()
    {
        $examTypes = ExamType::withCount('exams')
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/exam-types/index', [
            'examTypes' => $examTypes,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/exam-types/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:exam_types,code',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        ExamType::create($validated);

        return redirect()->route('admin.exam-types.index')
            ->with('success', 'Tipo de exame criado com sucesso!');
    }

    public function show(ExamType $examType)
    {
        $examType->load(['parameters', 'exams.user']);

        return Inertia::render('admin/exam-types/show', [
            'examType' => $examType,
        ]);
    }

    public function edit(ExamType $examType)
    {
        return Inertia::render('admin/exam-types/edit', [
            'examType' => $examType,
        ]);
    }

    public function update(Request $request, ExamType $examType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:exam_types,code,' . $examType->id,
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $examType->update($validated);

        return redirect()->route('admin.exam-types.index')
            ->with('success', 'Tipo de exame atualizado com sucesso!');
    }

    public function destroy(ExamType $examType)
    {
        if ($examType->exams()->count() > 0) {
            return back()->withErrors(['error' => 'Não é possível excluir tipo de exame com exames vinculados.']);
        }

        $examType->delete();

        return redirect()->route('admin.exam-types.index')
            ->with('success', 'Tipo de exame removido com sucesso!');
    }
}
