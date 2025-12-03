<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Adicionar coluna user_id temporária na tabela exams
        Schema::table('exams', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // 2. Migrar dados: copiar user_id de patients para exams
        DB::statement('
            UPDATE exams
            SET user_id = (
                SELECT user_id
                FROM patients
                WHERE patients.id = exams.patient_id
            )
        ');

        // 3. Remover índices, foreign key e coluna patient_id
        Schema::table('exams', function (Blueprint $table) {
            $table->dropIndex(['patient_id', 'collection_date']);
            $table->dropForeign(['patient_id']);
            $table->dropColumn('patient_id');
        });

        // 4. Tornar user_id NOT NULL e adicionar índice
        Schema::table('exams', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->index(['user_id', 'collection_date']);
        });

        // 5. Dropar tabela patients
        Schema::dropIfExists('patients');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recriar tabela patients
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('cpf', 14)->unique()->nullable();
            $table->date('birth_date');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 2)->nullable();
            $table->string('zip_code', 10)->nullable();
            $table->string('blood_type', 3)->nullable();
            $table->text('medical_conditions')->nullable();
            $table->text('allergies')->nullable();
            $table->text('medications')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Adicionar patient_id de volta em exams
        Schema::table('exams', function (Blueprint $table) {
            $table->foreignId('patient_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // Remover user_id de exams
        Schema::table('exams', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
