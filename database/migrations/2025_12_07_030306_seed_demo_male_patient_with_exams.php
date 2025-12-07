<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\User;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\ExamType;
use App\Models\Laboratory;
use App\Models\ExamParameter;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $userData = [
            'name' => 'João Silva Demo',
            'email' => 'demo@meusexames.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'cpf' => '111.222.333-44',
            'birth_date' => '1990-01-15',
            'gender' => 'male',
            'phone' => '(11) 98765-4321',
        ];

        $demoUser = User::firstOrCreate(
            ['email' => $userData['email']],
            $userData
        );

        if (class_exists(Role::class)) {
            $patientRole = Role::where('name', 'patient')->first();
            if ($patientRole && !$demoUser->hasRole('patient')) {
                $demoUser->assignRole('patient');
            }
        }

        $examsData = require __DIR__ . '/data/demo_male_exams_data.php';

        foreach ($examsData as $examData) {
            $examType = ExamType::where('code', $examData['exam_type_code'])->first();
            $laboratory = Laboratory::where('name', $examData['laboratory_name'])->first();

            if (!$examType || !$laboratory) {
                continue;
            }

            $exam = Exam::create([
                'user_id' => $demoUser->id,
                'exam_type_id' => $examType->id,
                'title' => $examData['title'],
                'laboratory_id' => $laboratory->id,
                'collection_date' => $examData['collection_date'],
                'collection_time' => $examData['collection_time'],
                'result_date' => $examData['result_date'],
                'result_time' => $examData['result_time'],
                'status' => $examData['status'],
                'notes' => $examData['notes'],
                'requesting_doctor' => $examData['requesting_doctor'],
                'crm_doctor' => $examData['crm_doctor'],
            ]);

            foreach ($examData['results'] as $resultData) {
                $examParameter = ExamParameter::where('code', $resultData['parameter_code'])
                    ->where('exam_type_id', $examType->id)
                    ->first();

                if (!$examParameter) {
                    continue;
                }

                ExamResult::create([
                    'exam_id' => $exam->id,
                    'exam_parameter_id' => $examParameter->id,
                    'numeric_value' => $resultData['numeric_value'],
                    'text_value' => $resultData['text_value'],
                    'boolean_value' => $resultData['boolean_value'],
                    'reference_min' => $resultData['reference_min'],
                    'reference_max' => $resultData['reference_max'],
                    'reference_gender' => $resultData['reference_gender'],
                    'reference_age_min' => $resultData['reference_age_min'],
                    'reference_age_max' => $resultData['reference_age_max'],
                    'reference_condition' => $resultData['reference_condition'],
                    'reference_description' => $resultData['reference_description'],
                    'reference_categories' => $resultData['reference_categories'],
                    'reference_type' => $resultData['reference_type'],
                    'status' => $resultData['status'],
                    'observation' => $resultData['observation'],
                ]);
            }
        }
    }

    public function down(): void
    {
        $demoUser = User::where('email', 'demo@meusexames.com')->first();
        if ($demoUser) {
            $demoUser->delete();
        }
    }
};
