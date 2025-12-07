<?php

use App\Models\ExamParameter;
use App\Models\ExamType;
use App\Models\ReferenceValue;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void
    {
        $this->createHemograma();
        $this->createPerfilLipidico();
        $this->createFuncaoRenal();
        $this->createFuncaoTireoidiana();
        $this->createTestosterona();
    }

    public function down(): void
    {
        ExamType::whereIn('code', [
            'HEMOGRAMA',
            'LIPIDICO',
            'FUNC_RENAL',
            'TIREOIDE',
            'TESTOSTERONA',
        ])->delete();
    }

    private function createHemograma()
    {
        $examType = ExamType::firstOrCreate(
            ['code' => 'HEMOGRAMA'],
            [
                'name' => 'Hemograma Completo',
                'description' => 'Exame que avalia componentes do sangue como hemácias, leucócitos e plaquetas',
                'category' => 'Hematologia',
                'preparation_time_hours' => 0,
                'preparation_instructions' => 'Não requer preparo especial',
                'requires_fasting' => false,
                'active' => true,
            ]
        );

        $parameters = [
            ['name' => 'Hemoglobina', 'code' => 'HB', 'unit' => 'g/dL', 'ref_min' => 12.0, 'ref_max' => 16.0],
            ['name' => 'Hematócrito', 'code' => 'HT', 'unit' => '%', 'ref_min' => 36.0, 'ref_max' => 47.0],
            ['name' => 'Hemácias', 'code' => 'HEM', 'unit' => 'milhões/mm³', 'ref_min' => 4.0, 'ref_max' => 5.4],
            ['name' => 'Leucócitos', 'code' => 'LEUC', 'unit' => '/mm³', 'ref_min' => 4000, 'ref_max' => 11000],
            ['name' => 'Plaquetas', 'code' => 'PLQ', 'unit' => '/mm³', 'ref_min' => 150000, 'ref_max' => 450000],
        ];

        $this->createParameters($examType, $parameters);
    }

    private function createPerfilLipidico()
    {
        $examType = ExamType::firstOrCreate(
            ['code' => 'LIPIDICO'],
            [
                'name' => 'Perfil Lipídico',
                'description' => 'Avaliação dos níveis de colesterol e triglicerídeos',
                'category' => 'Bioquímica',
                'preparation_time_hours' => 12,
                'preparation_instructions' => 'Jejum de 12 horas',
                'requires_fasting' => true,
                'active' => true,
            ]
        );

        $parameters = [
            ['name' => 'Colesterol Total', 'code' => 'COL_TOTAL', 'unit' => 'mg/dL', 'ref_min' => 0, 'ref_max' => 190],
            ['name' => 'Colesterol HDL', 'code' => 'HDL', 'unit' => 'mg/dL', 'ref_min' => 40, 'ref_max' => 999],
            ['name' => 'Colesterol LDL', 'code' => 'LDL', 'unit' => 'mg/dL', 'ref_min' => 0, 'ref_max' => 130],
            ['name' => 'Colesterol VLDL', 'code' => 'VLDL', 'unit' => 'mg/dL', 'ref_min' => 0, 'ref_max' => 40],
            ['name' => 'Colesterol Não-HDL', 'code' => 'COL_NAO_HDL', 'unit' => 'mg/dL', 'ref_min' => 0, 'ref_max' => 160],
            ['name' => 'Triglicerídeos', 'code' => 'TRIG', 'unit' => 'mg/dL', 'ref_min' => 0, 'ref_max' => 150],
        ];

        $this->createParameters($examType, $parameters);
    }

    private function createFuncaoRenal()
    {
        $examType = ExamType::firstOrCreate(
            ['code' => 'FUNC_RENAL'],
            [
                'name' => 'Função Renal',
                'description' => 'Avaliação da função dos rins',
                'category' => 'Bioquímica',
                'preparation_time_hours' => 8,
                'preparation_instructions' => 'Jejum de 8 horas',
                'requires_fasting' => true,
                'active' => true,
            ]
        );

        $parameters = [
            ['name' => 'Creatinina', 'code' => 'CREAT', 'unit' => 'mg/dL', 'ref_min' => 0.7, 'ref_max' => 1.2],
            ['name' => 'Ureia', 'code' => 'UREIA', 'unit' => 'mg/dL', 'ref_min' => 10, 'ref_max' => 50],
        ];

        $this->createParameters($examType, $parameters);
    }

    private function createFuncaoTireoidiana()
    {
        $examType = ExamType::firstOrCreate(
            ['code' => 'TIREOIDE'],
            [
                'name' => 'Função Tireoidiana',
                'description' => 'Avaliação da função da tireoide',
                'category' => 'Endocrinologia',
                'preparation_time_hours' => 0,
                'preparation_instructions' => 'Não requer preparo especial',
                'requires_fasting' => false,
                'active' => true,
            ]
        );

        $parameters = [
            ['name' => 'TSH', 'code' => 'TSH', 'unit' => 'μUI/mL', 'ref_min' => 0.4, 'ref_max' => 4.0],
            ['name' => 'T4 Livre', 'code' => 'T4L', 'unit' => 'ng/dL', 'ref_min' => 0.8, 'ref_max' => 1.9],
        ];

        $this->createParameters($examType, $parameters);
    }

    private function createTestosterona()
    {
        $examType = ExamType::firstOrCreate(
            ['code' => 'TESTOSTERONA'],
            [
                'name' => 'Testosterona',
                'description' => 'Dosagem de testosterona total',
                'category' => 'Endocrinologia',
                'preparation_time_hours' => 0,
                'preparation_instructions' => 'Coleta preferencialmente pela manhã',
                'requires_fasting' => false,
                'active' => true,
            ]
        );

        $parameters = [
            ['name' => 'Testosterona Total', 'code' => 'TEST_TOTAL', 'unit' => 'ng/dL', 'ref_min' => 300, 'ref_max' => 1000],
            ['name' => 'Testosterona Livre', 'code' => 'TEST_LIVRE', 'unit' => 'pg/mL', 'ref_min' => 5.0, 'ref_max' => 21.0],
            ['name' => 'Testosterona Biodisponível', 'code' => 'TEST_BIODIS', 'unit' => 'ng/dL', 'ref_min' => 83, 'ref_max' => 257],
        ];

        $this->createParameters($examType, $parameters);
    }

    private function createParameters($examType, $parameters)
    {
        foreach ($parameters as $index => $param) {
            $parameter = ExamParameter::firstOrCreate(
                [
                    'exam_type_id' => $examType->id,
                    'code' => $param['code'],
                ],
                [
                    'name' => $param['name'],
                    'unit' => $param['unit'],
                    'data_type' => 'numeric',
                    'decimal_places' => 2,
                    'display_order' => $index + 1,
                    'active' => true,
                ]
            );

            ReferenceValue::firstOrCreate(
                [
                    'exam_parameter_id' => $parameter->id,
                    'laboratory_id' => null,
                    'gender' => 'all',
                    'age_min' => null,
                    'age_max' => null,
                ],
                [
                    'min_value' => $param['ref_min'],
                    'max_value' => $param['ref_max'],
                    'is_default' => true,
                ]
            );
        }
    }
};
