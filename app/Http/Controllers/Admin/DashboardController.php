<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\User;
use App\Models\Laboratory;
use App\Models\ExamType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users' => User::role('patient')->count(),
            'total_exams' => Exam::count(),
            'total_laboratories' => Laboratory::count(),
            'total_exam_types' => ExamType::count(),
            'exams_this_month' => Exam::whereMonth('collection_date', now()->month)->count(),
            'new_users_this_month' => User::role('patient')->whereMonth('created_at', now()->month)->count(),
        ];

        $recentExams = Exam::with(['user', 'laboratory', 'examType'])
            ->latest('collection_date')
            ->take(10)
            ->get();

        $recentUsers = User::role('patient')
            ->latest('created_at')
            ->take(10)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentExams' => $recentExams,
            'recentUsers' => $recentUsers,
        ]);
    }
}
