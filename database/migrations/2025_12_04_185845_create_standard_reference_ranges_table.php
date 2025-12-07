<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('standard_reference_ranges', function (Blueprint $table) {
            $table->id();
            $table->string('parameter_code'); // 'HB', 'GLICOSE', 'CREAT', etc
            $table->string('parameter_name'); // 'Hemoglobina', 'Glicose', etc
            $table->string('gender')->default('both'); // 'male', 'female', 'both'
            $table->integer('age_min')->nullable(); // Idade mínima (ex: 18)
            $table->integer('age_max')->nullable(); // Idade máxima (ex: 90, null = sem limite)
            $table->decimal('reference_min', 10, 2)->nullable(); // Valor mínimo de referência
            $table->decimal('reference_max', 10, 2)->nullable(); // Valor máximo de referência
            $table->string('unit'); // 'mg/dL', 'g/dL', etc
            $table->string('reference_type')->default('numeric'); // 'numeric' ou 'categorical'
            $table->json('reference_categories')->nullable(); // Para faixas categóricas
            $table->string('condition')->nullable(); // 'jejum', 'sem_jejum', etc
            $table->text('description')->nullable(); // Descrição adicional
            $table->string('source')->nullable(); // 'SBPC', 'OMS', 'LabMax', etc
            $table->unsignedBigInteger('laboratory_id')->nullable(); // null = padrão global, ID = lab específico
            $table->foreign('laboratory_id')->references('id')->on('laboratories')->onDelete('cascade');
            $table->boolean('active')->default(true);
            $table->timestamps();

            // Índices para otimizar buscas
            $table->index(['parameter_code', 'gender', 'age_min', 'age_max']);
            $table->index(['laboratory_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('standard_reference_ranges');
    }
};
