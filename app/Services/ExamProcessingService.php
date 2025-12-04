<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\User;
use App\Models\ExamType;
use App\Models\ExamParameter;
use App\Models\ExamResult;
use App\Models\ReferenceValue;
use App\Models\Laboratory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ExamProcessingService
{
    protected PdfExtractor $pdfExtractor;
    protected AiLabParser $aiParser;

    public function __construct(PdfExtractor $pdfExtractor, AiLabParser $aiParser)
    {
        $this->pdfExtractor = $pdfExtractor;
        $this->aiParser = $aiParser;
    }

    public function processExam(
        $pdfFile,
        int $userId
    ): Exam {
        DB::beginTransaction();

        try {
            $filePath = $pdfFile->store('exams', 'public');
            $fullPath = Storage::disk('public')->path($filePath);

            // Extrai texto do PDF
            $pdfText = $this->pdfExtractor->extractText($fullPath);

            // Parser com IA extrai dados incluindo nome do laboratório
            $parsedData = $this->aiParser->parseExamText($pdfText);

            // Busca ou cria laboratório automaticamente
            $laboratory = $this->findOrCreateLaboratory($parsedData['laboratory_name'] ?? 'Laboratório Desconhecido');

            $user = User::findOrFail($userId);

            $exam = $this->createExam($user, $laboratory, $parsedData, $filePath);

            $this->createResults($exam, $user, $parsedData);

            DB::commit();

            return $exam->load(['results.examParameter', 'examType', 'laboratory']);
        } catch (\Exception $e) {
            DB::rollBack();

            if (isset($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            Log::error('Error processing exam', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    protected function findOrCreateLaboratory(string $laboratoryName): Laboratory
    {
        // Normaliza o nome para buscar (remove espaços extras)
        $normalizedName = $this->normalizeLaboratoryName(trim($laboratoryName));

        // Busca laboratório existente (case-insensitive)
        $laboratory = Laboratory::whereRaw('LOWER(name) = ?', [strtolower($normalizedName)])
            ->first();

        if ($laboratory) {
            Log::info('Laboratório encontrado', [
                'name' => $laboratory->name,
                'id' => $laboratory->id,
            ]);
            return $laboratory;
        }

        // Cria novo laboratório se não encontrar
        $laboratory = Laboratory::create([
            'name' => $normalizedName,
            'active' => true,
        ]);

        Log::info('Laboratório criado automaticamente', [
            'name' => $laboratory->name,
            'id' => $laboratory->id,
        ]);

        return $laboratory;
    }

    protected function normalizeLaboratoryName(string $name): string
    {
        // Mapa de variações conhecidas para nomes padronizados
        $knownLabs = [
            'labmax' => 'LabMax',
            'lab max' => 'LabMax',
            'bioprev' => 'Bioprev',
            'bio prev' => 'Bioprev',
            'laboratório são miguel' => 'Laboratório São Miguel',
            'lab são miguel' => 'Laboratório São Miguel',
            'são miguel' => 'Laboratório São Miguel',
            'laboratório pronto análise' => 'Laboratório Pronto Análise',
            'pronto análise' => 'Laboratório Pronto Análise',
            'pronto analise' => 'Laboratório Pronto Análise',
            'laboratório desconhecido' => 'Laboratório Desconhecido',
        ];

        $nameLower = mb_strtolower($name);

        // Se encontrar uma variação conhecida, retorna o nome normalizado
        if (isset($knownLabs[$nameLower])) {
            return $knownLabs[$nameLower];
        }

        // Se não encontrar, retorna o nome original
        return $name;
    }

    protected function createExam(User $user, Laboratory $laboratory, array $data, string $filePath): Exam
    {
        $examTypeCode = $data['results'][0]['exam_type_code'] ?? 'HEMOGRAMA';
        $examType = ExamType::where('code', $examTypeCode)->first();

        if (!$examType) {
            $examType = ExamType::where('code', 'HEMOGRAMA')->firstOrFail();
        }

        $protocolNumber = $data['protocol_number'] ?? null;

        // Gera título automático baseado nos tipos de exames + laboratório + data
        $title = $this->generateExamTitle($data, $laboratory);

        // Se existe protocolo, busca exame existente para limpar resultados antigos
        if ($protocolNumber) {
            $existingExam = Exam::where('user_id', $user->id)
                ->where('protocol_number', $protocolNumber)
                ->first();

            if ($existingExam) {
                Log::info('Updating existing exam', [
                    'protocol_number' => $protocolNumber,
                    'exam_id' => $existingExam->id,
                ]);

                // Deleta resultados antigos antes de atualizar
                $existingExam->results()->delete();

                // Deleta arquivo PDF antigo
                if ($existingExam->file_path && Storage::disk('public')->exists($existingExam->file_path)) {
                    Storage::disk('public')->delete($existingExam->file_path);
                }
            }
        }

        // Usa updateOrCreate para criar novo ou atualizar existente
        $exam = Exam::updateOrCreate(
            [
                'user_id' => $user->id,
                'protocol_number' => $protocolNumber,
            ],
            [
                'exam_type_id' => $examType->id,
                'laboratory_id' => $laboratory->id,
                'title' => $title,
                'collection_date' => $data['collection_date'] ?? now()->format('Y-m-d'),
                'collection_time' => null,
                'result_date' => $data['collection_date'] ?? now()->format('Y-m-d'),
                'result_time' => null,
                'status' => 'completed',
                'notes' => null,
                'file_path' => $filePath,
                'requesting_doctor' => $data['requesting_doctor'] ?? null,
                'crm_doctor' => $data['crm_doctor'] ?? null,
            ]
        );

        return $exam;
    }

    protected function generateExamTitle(array $data, Laboratory $laboratory): string
    {
        // Coleta todos os tipos de exames únicos
        $examTypes = collect($data['results'] ?? [])
            ->pluck('exam_type_code')
            ->unique()
            ->map(function ($code) {
                // Converte código para nome legível
                $examType = ExamType::where('code', $code)->first();
                return $examType ? $examType->name : ucwords(str_replace('_', ' ', strtolower($code)));
            })
            ->values();

        $examTypeCount = $examTypes->count();

        // Monta a parte dos tipos de exames
        if ($examTypeCount === 0) {
            $examsPart = 'Exame';
        } elseif ($examTypeCount === 1) {
            $examsPart = $examTypes->first();
        } elseif ($examTypeCount <= 3) {
            $examsPart = $examTypes->join(' + ');
        } else {
            $examsPart = 'Exame Completo';
        }

        // Data de coleta formatada
        $collectionDate = $data['collection_date'] ?? now()->format('Y-m-d');
        $formattedDate = \Carbon\Carbon::parse($collectionDate)->format('d/m/Y');

        // Monta o título: "Tipo(s) - Laboratório - Data"
        return "{$examsPart} - {$laboratory->name} - {$formattedDate}";
    }

    protected function createResults(Exam $exam, User $user, array $data): void
    {
        foreach ($data['results'] ?? [] as $examTypeData) {
            $examTypeCode = $examTypeData['exam_type_code'];

            // Auto-criar ExamType se não existir
            $examType = ExamType::where('code', $examTypeCode)->first();

            if (!$examType) {
                Log::info('Auto-creating ExamType', ['code' => $examTypeCode]);
                $examType = $this->autoCreateExamType($examTypeCode);
            }

            foreach ($examTypeData['parameters'] ?? [] as $paramData) {
                $parameterCode = $paramData['parameter_code'];

                // Auto-criar ExamParameter se não existir
                $parameter = ExamParameter::where('exam_type_id', $examType->id)
                    ->where('code', $parameterCode)
                    ->first();

                if (!$parameter) {
                    Log::info('Auto-creating ExamParameter', [
                        'exam_type' => $examTypeCode,
                        'parameter_code' => $parameterCode,
                        'parameter_name' => $paramData['parameter_name'] ?? $parameterCode,
                    ]);
                    $parameter = $this->autoCreateParameter($examType, $paramData);
                }

                $referenceValue = ReferenceValue::where('exam_parameter_id', $parameter->id)
                    ->forPatient($user)
                    ->default()
                    ->first();

                $refMin = $paramData['reference_min'] ?? $referenceValue?->min_value;
                $refMax = $paramData['reference_max'] ?? $referenceValue?->max_value;
                $value = $paramData['value'];

                $status = $this->determineStatus($value, $refMin, $refMax);

                ExamResult::create([
                    'exam_id' => $exam->id,
                    'exam_parameter_id' => $parameter->id,
                    'numeric_value' => is_numeric($value) ? $value : null,
                    'text_value' => !is_numeric($value) ? $value : null,
                    'boolean_value' => null,
                    'reference_min' => $refMin,
                    'reference_max' => $refMax,
                    'status' => $status,
                    'observation' => null,
                ]);
            }
        }
    }

    protected function autoCreateExamType(string $code): ExamType
    {
        // Gera nome legível a partir do código
        $name = ucwords(str_replace('_', ' ', strtolower($code)));

        return ExamType::create([
            'name' => $name,
            'code' => $code,
            'description' => 'Criado automaticamente pelo sistema',
            'category' => 'Outros',
            'preparation_time_hours' => 0,
            'preparation_instructions' => null,
            'requires_fasting' => false,
            'active' => true,
        ]);
    }

    protected function autoCreateParameter(ExamType $examType, array $paramData): ExamParameter
    {
        $code = $paramData['parameter_code'];
        $name = $paramData['parameter_name'] ?? ucwords(str_replace('_', ' ', strtolower($code)));
        $unit = $paramData['unit'] ?? '';

        // Determina display_order como último + 1
        $maxOrder = ExamParameter::where('exam_type_id', $examType->id)
            ->max('display_order') ?? 0;

        $parameter = ExamParameter::create([
            'exam_type_id' => $examType->id,
            'name' => $name,
            'code' => $code,
            'unit' => $unit,
            'data_type' => 'numeric',
            'decimal_places' => 2,
            'display_order' => $maxOrder + 1,
            'active' => true,
        ]);

        // Cria valor de referência padrão se fornecido
        if (isset($paramData['reference_min']) || isset($paramData['reference_max'])) {
            ReferenceValue::create([
                'exam_parameter_id' => $parameter->id,
                'laboratory_id' => null,
                'gender' => 'all',
                'age_min' => null,
                'age_max' => null,
                'min_value' => $paramData['reference_min'] ?? null,
                'max_value' => $paramData['reference_max'] ?? null,
                'is_default' => true,
            ]);
        }

        return $parameter;
    }

    protected function determineStatus($value, $min, $max): string
    {
        if (!is_numeric($value) || $min === null || $max === null) {
            return 'normal';
        }

        if ($value < $min) {
            return 'low';
        }

        if ($value > $max) {
            return 'high';
        }

        return 'normal';
    }
}
