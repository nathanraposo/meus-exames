<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\User;
use App\Models\ExamType;
use App\Models\ExamParameter;
use App\Models\ExamResult;
use App\Models\ReferenceValue;
use App\Models\Laboratory;
use App\Models\StandardReferenceRange;
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

            $exam = $this->createExam($user, $laboratory, $parsedData, $filePath, $pdfText);

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

    /**
     * Reprocessa um exame usando dados salvos (sem chamar API)
     */
    public function reprocessExamFromSavedData(Exam $exam): void
    {
        if (!$exam->ai_response) {
            throw new \Exception('Exame não possui dados salvos (ai_response vazio)');
        }

        $parsedData = $exam->ai_response;
        $user = $exam->user;

        Log::info('Reprocessing exam from saved data', [
            'exam_id' => $exam->id,
            'user_id' => $user->id,
        ]);

        $this->createResults($exam, $user, $parsedData);

        $exam->touch(); // Atualiza updated_at

        Log::info('Exam reprocessed successfully', [
            'exam_id' => $exam->id,
            'results_count' => $exam->results()->count(),
        ]);
    }

    /**
     * Regenera o título do exame com um novo laboratório
     */
    public function regenerateExamTitle(Exam $exam, Laboratory $laboratory): string
    {
        // Coleta todos os tipos de exames únicos do exame
        $examTypes = $exam->results()
            ->with('examParameter.examType')
            ->get()
            ->pluck('examParameter.examType')
            ->filter()
            ->unique('id')
            ->pluck('name')
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
        $formattedDate = $exam->collection_date->format('d/m/Y');

        // Monta o título: "Tipo(s) - Laboratório - Data"
        return "{$examsPart} - {$laboratory->name} - {$formattedDate}";
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

    protected function createExam(User $user, Laboratory $laboratory, array $data, string $filePath, ?string $pdfText = null): Exam
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
                'pdf_text' => $pdfText,
                'ai_response' => $data,
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

                // Select best reference range from AI data or database fallback
                $selectedReference = $this->selectBestReference(
                    $paramData,
                    $user,
                    $exam->laboratory_id
                );

                $value = $paramData['value'];

                // Para referências categóricas, encontrar a categoria onde o valor se encaixa
                // e preencher reference_min/max com os limites dessa categoria específica
                if ($selectedReference['reference_type'] === 'categorical' &&
                    $selectedReference['reference_categories'] &&
                    is_numeric($value)) {

                    $applicableCategory = $this->findApplicableCategory(
                        $value,
                        $selectedReference['reference_categories']
                    );

                    if ($applicableCategory) {
                        $selectedReference['reference_min'] = $applicableCategory['min'];
                        $selectedReference['reference_max'] = $applicableCategory['max'];
                    }
                }

                // Determine status based on reference type
                $status = $this->determineStatus(
                    $value,
                    $selectedReference['reference_min'],
                    $selectedReference['reference_max'],
                    $selectedReference['reference_type'],
                    $selectedReference['reference_categories']
                );

                // Normalize categories (convert empty strings to null)
                $normalizedCategories = $this->normalizeCategories($selectedReference['reference_categories']);

                ExamResult::create([
                    'exam_id' => $exam->id,
                    'exam_parameter_id' => $parameter->id,
                    'numeric_value' => is_numeric($value) ? $value : null,
                    'text_value' => !is_numeric($value) ? $value : null,
                    'boolean_value' => null,
                    'reference_min' => $selectedReference['reference_min'],
                    'reference_max' => $selectedReference['reference_max'],
                    'reference_gender' => $selectedReference['reference_gender'],
                    'reference_age_min' => $selectedReference['reference_age_min'],
                    'reference_age_max' => $selectedReference['reference_age_max'],
                    'reference_condition' => $selectedReference['reference_condition'],
                    'reference_description' => $selectedReference['reference_description'],
                    'reference_categories' => $normalizedCategories,
                    'reference_type' => $selectedReference['reference_type'],
                    'status' => $status,
                    'observation' => null,
                ]);
            }
        }
    }

    /**
     * Select the best reference range from AI data or database fallback
     */
    protected function selectBestReference(array $paramData, User $user, int $laboratoryId): array
    {
        $userGender = $user->gender; // 'male' or 'female'
        $userAge = $user->age; // calculated from birth_date

        // Check if AI extracted reference ranges
        if (isset($paramData['reference_ranges']) && is_array($paramData['reference_ranges']) && count($paramData['reference_ranges']) > 0) {
            Log::info('Using AI-extracted reference ranges', [
                'parameter_code' => $paramData['parameter_code'],
                'ranges_count' => count($paramData['reference_ranges']),
                'raw_ranges' => json_encode($paramData['reference_ranges']),
            ]);

            return $this->selectFromAiRanges($paramData['reference_ranges'], $userGender, $userAge);
        }

        // Fallback to database
        Log::info('Falling back to database reference ranges', [
            'parameter_code' => $paramData['parameter_code'],
            'user_gender' => $userGender,
            'user_age' => $userAge,
        ]);

        return $this->selectFromDatabaseRanges($paramData['parameter_code'], $userGender, $userAge, $laboratoryId);
    }

    /**
     * Select best reference from AI-extracted ranges
     */
    protected function selectFromAiRanges(array $ranges, ?string $userGender, ?int $userAge): array
    {
        // Score each range and pick the best match
        $scoredRanges = collect($ranges)->map(function ($range) use ($userGender, $userAge) {
            $score = 0;

            // Gender match scoring
            $rangeGender = $range['gender'] ?? 'both';
            if ($rangeGender === 'both') {
                $score += 1; // Lowest priority
            } elseif ($rangeGender === $userGender) {
                $score += 10; // Exact match
            } else {
                return null; // Wrong gender, skip this range
            }

            // Age match scoring
            $ageMin = $range['age_min'] ?? null;
            $ageMax = $range['age_max'] ?? null;

            if ($ageMin === null && $ageMax === null) {
                $score += 1; // Applies to all ages (lowest priority)
            } elseif ($userAge !== null) {
                // Check if user age is within range
                $withinRange = true;
                if ($ageMin !== null && $userAge < $ageMin) {
                    $withinRange = false;
                }
                if ($ageMax !== null && $userAge > $ageMax) {
                    $withinRange = false;
                }

                if ($withinRange) {
                    $score += 10; // Exact age match
                } else {
                    return null; // Age doesn't match, skip
                }
            }

            return ['range' => $range, 'score' => $score];
        })->filter()->sortByDesc('score');

        $bestMatch = $scoredRanges->first();

        if ($bestMatch) {
            $range = $bestMatch['range'];
            $result = [
                'reference_min' => $range['reference_min'] ?? null,
                'reference_max' => $range['reference_max'] ?? null,
                'reference_gender' => $range['gender'] ?? 'both',
                'reference_age_min' => $range['age_min'] ?? null,
                'reference_age_max' => $range['age_max'] ?? null,
                'reference_condition' => $range['condition'] ?? null,
                'reference_description' => $range['age_description'] ?? null,
                'reference_categories' => $range['reference_categories'] ?? null,
                'reference_type' => $range['reference_type'] ?? 'numeric',
            ];

            Log::info('Selected reference from AI', [
                'score' => $bestMatch['score'],
                'result' => $result,
            ]);

            return $result;
        }

        // No match found, return empty reference
        Log::warning('No matching AI reference found', [
            'user_gender' => $userGender,
            'user_age' => $userAge,
            'ranges_checked' => count($ranges),
        ]);

        return $this->emptyReference();
    }

    /**
     * Select best reference from database
     */
    protected function selectFromDatabaseRanges(string $parameterCode, ?string $userGender, ?int $userAge, int $laboratoryId): array
    {
        $reference = StandardReferenceRange::forParameter($parameterCode)
            ->forGender($userGender)
            ->forAge($userAge)
            ->forLaboratory($laboratoryId)
            ->first();

        if ($reference) {
            return [
                'reference_min' => $reference->reference_min,
                'reference_max' => $reference->reference_max,
                'reference_gender' => $reference->gender,
                'reference_age_min' => $reference->age_min,
                'reference_age_max' => $reference->age_max,
                'reference_condition' => $reference->condition,
                'reference_description' => $reference->description,
                'reference_categories' => $reference->reference_categories, // Already an array due to cast
                'reference_type' => $reference->reference_type,
            ];
        }

        // No reference found in database either
        Log::warning('No reference range found', [
            'parameter_code' => $parameterCode,
            'user_gender' => $userGender,
            'user_age' => $userAge,
        ]);

        return $this->emptyReference();
    }

    /**
     * Return empty reference structure
     */
    protected function emptyReference(): array
    {
        return [
            'reference_min' => null,
            'reference_max' => null,
            'reference_gender' => null,
            'reference_age_min' => null,
            'reference_age_max' => null,
            'reference_condition' => null,
            'reference_description' => null,
            'reference_categories' => null,
            'reference_type' => 'numeric',
        ];
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

    protected function determineStatus($value, $min, $max, string $referenceType = 'numeric', $categories = null): string
    {
        if (!is_numeric($value)) {
            return 'normal';
        }

        // Handle categorical references
        if ($referenceType === 'categorical' && $categories !== null) {
            return $this->determineCategoricalStatus($value, $categories);
        }

        // Handle numeric references
        if ($min === null || $max === null) {
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

    /**
     * Find which category the value falls into
     */
    protected function findApplicableCategory($value, $categories): ?array
    {
        // Decode if it's a JSON string
        if (is_string($categories)) {
            $categories = json_decode($categories, true);
        }

        if (!is_array($categories) || empty($categories)) {
            return null;
        }

        foreach ($categories as $category) {
            $min = $category['min'] ?? null;
            $max = $category['max'] ?? null;

            // Normalize empty strings to null
            if ($min === '' || $min === null) {
                $min = null;
            } else {
                $min = is_numeric($min) ? (float) $min : null;
            }

            if ($max === '' || $max === null) {
                $max = null;
            } else {
                $max = is_numeric($max) ? (float) $max : null;
            }

            // Check if value falls in this category
            $inRange = true;
            if ($min !== null && $value < $min) {
                $inRange = false;
            }
            if ($max !== null && $value > $max) {
                $inRange = false;
            }

            if ($inRange) {
                // Return normalized category
                return [
                    'name' => $category['name'] ?? '',
                    'min' => $min,
                    'max' => $max,
                ];
            }
        }

        return null;
    }

    /**
     * Normalize categories: convert empty strings to null
     */
    protected function normalizeCategories($categories): ?array
    {
        if ($categories === null || !is_array($categories)) {
            return null;
        }

        return array_map(function ($category) {
            $min = $category['min'] ?? null;
            $max = $category['max'] ?? null;

            // Convert empty strings to null
            if ($min === '' || !is_numeric($min)) {
                $min = null;
            } else {
                $min = (float) $min;
            }

            if ($max === '' || !is_numeric($max)) {
                $max = null;
            } else {
                $max = (float) $max;
            }

            return [
                'name' => $category['name'] ?? '',
                'min' => $min,
                'max' => $max,
            ];
        }, $categories);
    }

    /**
     * Determine status for categorical references
     */
    protected function determineCategoricalStatus($value, $categories): string
    {
        // Handle if it's still a JSON string (from old data)
        if (is_string($categories)) {
            $categories = json_decode($categories, true);
        }

        if (!is_array($categories) || empty($categories)) {
            return 'normal';
        }

        // Map category names to status
        // Categories like "Desejável", "Ótimo", "Normal", "Bom" -> normal
        // Categories like "Alto", "Elevado", "Limítrofe" -> high
        // Categories like "Baixo", "Inadequado" -> low

        foreach ($categories as $category) {
            $name = mb_strtolower($category['name'] ?? '');
            $min = $category['min'] ?? null;
            $max = $category['max'] ?? null;

            // Normalize empty strings to null
            if ($min === '' || !is_numeric($min)) {
                $min = null;
            } else {
                $min = (float) $min;
            }

            if ($max === '' || !is_numeric($max)) {
                $max = null;
            } else {
                $max = (float) $max;
            }

            // Check if value falls in this category
            $inRange = true;
            if ($min !== null && $value < $min) {
                $inRange = false;
            }
            if ($max !== null && $value > $max) {
                $inRange = false;
            }

            if ($inRange) {
                // Determine status based on category name
                if (in_array($name, ['desejável', 'ótimo', 'normal', 'bom', 'adequado', 'ideal', 'adequado população geral'])) {
                    return 'normal';
                }
                if (in_array($name, ['alto', 'elevado', 'limítrofe', 'aumentado', 'muito alto', 'ideal (grupos de risco)'])) {
                    return 'high';
                }
                if (in_array($name, ['baixo', 'diminuído', 'inadequado', 'muito baixo', 'deficiente'])) {
                    return 'low';
                }
                if (in_array($name, ['crítico', 'risco', 'perigoso', 'risco de intoxicação'])) {
                    return 'critical';
                }

                // Default to normal if name doesn't match known patterns
                return 'normal';
            }
        }

        // Value doesn't match any category
        return 'normal';
    }
}
