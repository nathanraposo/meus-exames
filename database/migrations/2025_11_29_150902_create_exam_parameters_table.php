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
        Schema::create('exam_parameters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_type_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code', 50);
            $table->text('description')->nullable();
            $table->string('unit')->nullable();
            $table->enum('data_type', ['numeric', 'text', 'boolean'])->default('numeric');
            $table->integer('decimal_places')->default(2);
            $table->integer('display_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['exam_type_id', 'code']);
            $table->index('display_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_parameters');
    }
};
