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
        Schema::create('exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('exam_parameter_id')->constrained()->onDelete('restrict');
            $table->decimal('numeric_value', 15, 4)->nullable();
            $table->text('text_value')->nullable();
            $table->boolean('boolean_value')->nullable();
            $table->decimal('reference_min', 15, 4)->nullable();
            $table->decimal('reference_max', 15, 4)->nullable();
            $table->string('reference_gender')->nullable();
            $table->integer('reference_age_min')->nullable();
            $table->integer('reference_age_max')->nullable();
            $table->string('reference_condition')->nullable();
            $table->text('reference_description')->nullable();
            $table->json('reference_categories')->nullable();
            $table->string('reference_type')->default('numeric');
            $table->enum('status', ['normal', 'low', 'high', 'critical'])->nullable();
            $table->text('observation')->nullable();
            $table->timestamps();

            $table->index(['exam_id', 'exam_parameter_id']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_results');
    }
};
