<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Laboratory;

class LaboratorySeeder extends Seeder
{
    public function run(): void
    {
        $laboratories = [
            [
                'name' => 'LabMax',
                'cnpj' => null,
                'email' => 'contato@labmax.com.br',
                'phone' => '(44) 1234-5678',
                'address' => 'Rua Exemplo, 123',
                'city' => 'Umuarama',
                'state' => 'PR',
                'zip_code' => '87500-000',
                'website' => 'https://labmax.com.br',
                'active' => true,
            ],
            [
                'name' => 'Laboratório Central SUS',
                'cnpj' => null,
                'email' => 'central@sus.gov.br',
                'phone' => '(44) 9876-5432',
                'address' => 'Av. Principal, 456',
                'city' => 'Umuarama',
                'state' => 'PR',
                'zip_code' => '87500-100',
                'website' => null,
                'active' => true,
            ],
            [
                'name' => 'Lab Santa Casa',
                'cnpj' => null,
                'email' => 'lab@santacasa.org.br',
                'phone' => '(44) 5555-1234',
                'address' => 'Rua Hospital, 789',
                'city' => 'Umuarama',
                'state' => 'PR',
                'zip_code' => '87500-200',
                'website' => 'https://santacasa.org.br',
                'active' => true,
            ],
            [
                'name' => 'Outro Laboratório',
                'cnpj' => null,
                'email' => null,
                'phone' => null,
                'address' => null,
                'city' => null,
                'state' => null,
                'zip_code' => null,
                'website' => null,
                'active' => true,
            ],
        ];

        foreach ($laboratories as $laboratory) {
            Laboratory::create($laboratory);
        }
    }
}
