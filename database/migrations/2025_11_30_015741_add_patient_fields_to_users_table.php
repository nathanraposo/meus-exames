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
        Schema::table('users', function (Blueprint $table) {
            $table->string('cpf', 14)->unique()->nullable()->after('email');
            $table->date('birth_date')->nullable()->after('cpf');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('birth_date');
            $table->string('phone', 20)->nullable()->after('gender');
            $table->text('address')->nullable()->after('phone');
            $table->string('city', 100)->nullable()->after('address');
            $table->string('state', 2)->nullable()->after('city');
            $table->string('zip_code', 10)->nullable()->after('state');
            $table->string('blood_type', 3)->nullable()->after('zip_code');
            $table->text('medical_conditions')->nullable()->after('blood_type');
            $table->text('allergies')->nullable()->after('medical_conditions');
            $table->text('medications')->nullable()->after('allergies');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'cpf',
                'birth_date',
                'gender',
                'phone',
                'address',
                'city',
                'state',
                'zip_code',
                'blood_type',
                'medical_conditions',
                'allergies',
                'medications',
            ]);
        });
    }
};
