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
        Schema::create('reference_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_parameter_id')->constrained()->onDelete('cascade');
            $table->foreignId('laboratory_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('gender', ['male', 'female', 'other', 'all'])->default('all');
            $table->integer('age_min')->nullable();
            $table->integer('age_max')->nullable();
            $table->decimal('min_value', 15, 4)->nullable();
            $table->decimal('max_value', 15, 4)->nullable();
            $table->decimal('optimal_min', 15, 4)->nullable();
            $table->decimal('optimal_max', 15, 4)->nullable();
            $table->string('text_reference')->nullable();
            $table->text('condition_description')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['exam_parameter_id', 'gender', 'age_min', 'age_max']);
            $table->index('is_default');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reference_values');
    }
};
