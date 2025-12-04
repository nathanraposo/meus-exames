<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::get('abnormal-results', [\App\Http\Controllers\DashboardController::class, 'abnormalResults'])->name('abnormal-results');
    Route::get('all-parameters', [\App\Http\Controllers\DashboardController::class, 'allParameters'])->name('all-parameters');

    // Rotas específicas ANTES do resource para evitar conflito
    Route::get('exams/history/{parameterCode}', [\App\Http\Controllers\ExamController::class, 'history'])
        ->name('exams.history');
    Route::patch('exams/{exam}/laboratory', [\App\Http\Controllers\ExamController::class, 'updateLaboratory'])
        ->name('exams.updateLaboratory');

    Route::resource('exams', \App\Http\Controllers\ExamController::class);
});

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
    Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
    Route::resource('laboratories', \App\Http\Controllers\Admin\LaboratoryController::class);
    Route::resource('exam-types', \App\Http\Controllers\Admin\ExamTypeController::class);
});

require __DIR__.'/settings.php';
