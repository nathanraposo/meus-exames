<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Criar roles
        $adminRole = Role::create(['name' => 'admin']);
        $patientRole = Role::create(['name' => 'patient']);

        // Atribuir role patient ao usuário de teste e adicionar dados de paciente
        $testUser = User::where('email', 'test@example.com')->first();
        if ($testUser) {
            $testUser->update([
                'birth_date' => '1990-01-15',
                'gender' => 'male',
                'cpf' => '123.456.789-00',
                'phone' => '(11) 98765-4321',
            ]);
            $testUser->assignRole('patient');
        }

        // Criar um usuário admin
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => 'password',
                'email_verified_at' => now(),
                'birth_date' => '1985-05-20',
                'gender' => 'male',
            ]
        );
        $adminUser->assignRole('admin');
    }
}
