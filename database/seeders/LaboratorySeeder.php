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
                'name' => 'Laboratório Desconhecido',
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
                'name' => 'Bioprev',
                'cnpj' => null,
                'email' => 'contato@bioprev.com.br',
                'phone' => null,
                'address' => null,
                'city' => null,
                'state' => null,
                'zip_code' => null,
                'website' => null,
                'active' => true,
            ],
            [
                'name' => 'Laboratório São Miguel',
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
            [
                'name' => 'Laboratório Pronto Análise',
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
            Laboratory::firstOrCreate(
                ['name' => $laboratory['name']],
                $laboratory
            );
        }
    }
}
