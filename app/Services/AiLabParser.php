<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiLabParser
{
    protected string $apiKey;
    protected string $model = 'claude-3-5-haiku-20241022';

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key');
    }

    public function parseExamText(string $pdfText): array
    {
        $prompt = $this->buildPrompt($pdfText);

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->timeout(120)->post('https://api.anthropic.com/v1/messages', [
                'model' => $this->model,
                'max_tokens' => 8192, // Aumentado para processar PDFs maiores
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
            ]);

            if (!$response->successful()) {
                Log::error('Claude API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('Erro ao processar exame com IA: ' . $response->body());
            }

            $result = $response->json();
            $content = $result['content'][0]['text'] ?? '';

            return $this->parseResponse($content);
        } catch (\Exception $e) {
            Log::error('AI Parser error', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    protected function buildPrompt(string $pdfText): string
    {
        return <<<PROMPT
Você é um especialista em extrair dados de exames de sangue de PDFs de laboratórios.

TEXTO DO PDF (PODE CONTER MÚLTIPLAS PÁGINAS):
{$pdfText}

ATENÇÃO: Este PDF pode ter VÁRIAS PÁGINAS. Você DEVE processar TODO o conteúdo, não apenas a primeira página!
Procure por marcadores como "=== PÁGINA X ===" para identificar diferentes páginas.

TAREFA:
Extraia TODOS os dados do exame de sangue de TODAS AS PÁGINAS e retorne em formato JSON válido com a seguinte estrutura:

{
  "laboratory_name": "Nome do Laboratório (extraído do cabeçalho do PDF)",
  "collection_date": "YYYY-MM-DD",
  "protocol_number": "número do protocolo/pedido",
  "requesting_doctor": "nome do médico",
  "crm_doctor": "CRM do médico",
  "results": [
    {
      "exam_type_code": "HEMOGRAMA ou LIPIDICO ou FUNC_RENAL ou TIREOIDE ou TESTOSTERONA",
      "parameters": [
        {
          "parameter_code": "HB ou HDL ou CREAT etc",
          "parameter_name": "Hemoglobina ou Colesterol HDL etc",
          "value": 14.5,
          "unit": "g/dL",
          "reference_min": 12.0,
          "reference_max": 16.0,
          "status": "normal ou low ou high"
        }
      ]
    }
  ]
}

CÓDIGOS DE EXAMES CONHECIDOS (use preferencialmente):
- HEMOGRAMA: Hemograma completo
- LIPIDICO: Perfil lipídico completo
- FUNC_RENAL: Função renal (Creatinina, Ureia)
- TIREOIDE: Função tireoidiana (TSH, T4 Livre)
- TESTOSTERONA: Testosterona (Total, Livre, Biodisponível)
- POTÁSSIO
- FERRITINA

CÓDIGOS DE PARÂMETROS CONHECIDOS (use preferencialmente):
- Hemograma: HB, HT, HEM, LEUC, PLQ
- Lipídico: COL_TOTAL, HDL, LDL, VLDL, COL_NAO_HDL, TRIG
- Função Renal: CREAT, UREIA
- Tireoide: TSH, T4L
- Testosterona: TEST_TOTAL, TEST_LIVRE, TEST_BIODIS

SISTEMA INTELIGENTE DE RECONHECIMENTO:
- Se encontrar um exame NÃO listado acima, crie um código único baseado no nome
  Exemplo: "Glicemia" → exam_type_code: "GLICEMIA"
  Exemplo: "Hemoglobina Glicada" → exam_type_code: "HB_GLICADA"
- Se encontrar um parâmetro NÃO listado, crie um código único
  Exemplo: "Vitamina D" → parameter_code: "VIT_D"
  Exemplo: "Ácido Úrico" → parameter_code: "AC_URICO"
- SEMPRE normalize códigos: MAIÚSCULAS, use _ ao invés de espaços
- SEMPRE inclua TODOS os parâmetros encontrados no PDF, mesmo que não estejam na lista

EXTRAÇÃO DO NOME DO LABORATÓRIO (MUITO IMPORTANTE):
- O nome do laboratório geralmente aparece no CABEÇALHO, TOPO ou RODAPÉ do PDF
- Procure nas primeiras linhas do documento e também no final
- Busque por palavras-chave: "Laboratório", "Lab", "LAB", nome da clínica/hospital
- LABORATÓRIOS CONHECIDOS (dê prioridade para esses nomes exatos):
  * "LabMax" ou "Lab Max" ou "LABMAX"
  * "Bioprev" ou "BIOPREV" ou "BIO PREV"
  * "Laboratório São Miguel" ou "Lab São Miguel" ou "SÃO MIGUEL"
  * "Laboratório Pronto Análise" ou "Pronto Análise" ou "PRONTO ANALISE"
- Outros laboratórios comuns: "Fleury", "Delboni", "Santa Casa", "Laboratório Central", "Biofox", "Hermes Pardini"
- NORMALIZE o nome:
  * Se encontrar variações (ex: "LABMAX", "Lab Max"), use a forma normalizada "LabMax"
  * Se encontrar "BIOPREV" ou "BIO PREV", use "Bioprev"
  * Mantenha capitalização correta
- Se não encontrar explicitamente, procure em logos, assinaturas, cabeçalhos, rodapés, endereços
- ATENÇÃO: Se NÃO conseguir identificar com certeza, use EXATAMENTE "Laboratório Desconhecido"

IMPORTANTE:
- Retorne APENAS o JSON, sem texto adicional
- O campo laboratory_name é OBRIGATÓRIO - sempre extraia ou use "Laboratório Desconhecido"
- Se não encontrar um valor, use null
- Converta datas para formato YYYY-MM-DD
- Valores numéricos devem ser numbers, não strings
- NUNCA ignore parâmetros - extraia TUDO que encontrar
- Seja inteligente: crie códigos para exames/parâmetros desconhecidos
- PROCESSE TODAS AS PÁGINAS - não pare na primeira página!
- Resultados podem estar espalhados em várias páginas - colete todos

PROMPT;
    }

    protected function parseResponse(string $content): array
    {
        $content = trim($content);

        if (str_starts_with($content, '```json')) {
            $content = preg_replace('/^```json\s*/', '', $content);
            $content = preg_replace('/\s*```$/', '', $content);
        } elseif (str_starts_with($content, '```')) {
            $content = preg_replace('/^```\s*/', '', $content);
            $content = preg_replace('/\s*```$/', '', $content);
        }

        $content = trim($content);

        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Resposta da IA não está em formato JSON válido: ' . json_last_error_msg());
        }

        return $data;
    }

    public function estimateCost(string $text): float
    {
        $inputTokens = strlen($text) / 4;
        $outputTokens = 1000;

        $inputCost = ($inputTokens / 1_000_000) * 0.80;
        $outputCost = ($outputTokens / 1_000_000) * 4.00;

        return $inputCost + $outputCost;
    }
}
