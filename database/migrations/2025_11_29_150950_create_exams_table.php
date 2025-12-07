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
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('exam_type_id')->constrained()->onDelete('restrict');
            $table->string('title')->nullable();
            $table->foreignId('laboratory_id')->constrained()->onDelete('restrict');
            $table->string('protocol_number')->unique()->nullable();
            $table->date('collection_date');
            $table->time('collection_time')->nullable();
            $table->date('result_date')->nullable();
            $table->time('result_time')->nullable();
            $table->enum('status', ['pending', 'collected', 'processing', 'completed', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->string('file_path')->nullable();
            $table->longText('pdf_text')->nullable();
            $table->json('ai_response')->nullable();
            $table->string('requesting_doctor')->nullable();
            $table->string('crm_doctor', 20)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('protocol_number');
            $table->index(['user_id', 'collection_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
