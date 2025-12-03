<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Laboratory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaboratoryController extends Controller
{
    public function index()
    {
        $laboratories = Laboratory::withCount('exams')
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/laboratories/index', [
            'laboratories' => $laboratories,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/laboratories/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cnpj' => 'nullable|string|max:18|unique:laboratories,cnpj',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'active' => 'boolean',
        ]);

        Laboratory::create($validated);

        return redirect()->route('admin.laboratories.index')
            ->with('success', 'Laboratório criado com sucesso!');
    }

    public function show(Laboratory $laboratory)
    {
        $laboratory->load(['exams.user', 'exams.examType']);

        return Inertia::render('admin/laboratories/show', [
            'laboratory' => $laboratory,
        ]);
    }

    public function edit(Laboratory $laboratory)
    {
        return Inertia::render('admin/laboratories/edit', [
            'laboratory' => $laboratory,
        ]);
    }

    public function update(Request $request, Laboratory $laboratory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cnpj' => 'nullable|string|max:18|unique:laboratories,cnpj,' . $laboratory->id,
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'active' => 'boolean',
        ]);

        $laboratory->update($validated);

        return redirect()->route('admin.laboratories.index')
            ->with('success', 'Laboratório atualizado com sucesso!');
    }

    public function destroy(Laboratory $laboratory)
    {
        if ($laboratory->exams()->count() > 0) {
            return back()->withErrors(['error' => 'Não é possível excluir laboratório com exames vinculados.']);
        }

        $laboratory->delete();

        return redirect()->route('admin.laboratories.index')
            ->with('success', 'Laboratório removido com sucesso!');
    }
}
