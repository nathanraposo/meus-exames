<?php

namespace App\Services;

use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\Log;

class PdfExtractor
{
    protected Parser $parser;

    public function __construct()
    {
        $this->parser = new Parser();
    }

    public function extractText(string $filePath): string
    {
        try {
            $pdf = $this->parser->parseFile($filePath);

            // Extrair todas as páginas separadamente
            $pages = $pdf->getPages();
            $totalPages = count($pages);

            Log::info('PDF extraction started', [
                'file' => basename($filePath),
                'total_pages' => $totalPages,
            ]);

            $allText = [];

            foreach ($pages as $pageNumber => $page) {
                try {
                    $pageText = $page->getText();
                    if (!empty(trim($pageText))) {
                        $allText[] = "=== PÁGINA " . ($pageNumber + 1) . " ===\n" . $pageText;
                        Log::info("Page extracted", [
                            'page' => $pageNumber + 1,
                            'chars' => strlen($pageText),
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::warning("Failed to extract page", [
                        'page' => $pageNumber + 1,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $fullText = implode("\n\n", $allText);

            Log::info('PDF extraction completed', [
                'total_chars' => strlen($fullText),
                'pages_extracted' => count($allText),
            ]);

            return $this->cleanText($fullText);
        } catch (\Exception $e) {
            Log::error('PDF extraction failed', ['error' => $e->getMessage()]);
            throw new \Exception("Erro ao extrair texto do PDF: " . $e->getMessage());
        }
    }

    protected function cleanText(string $text): string
    {
        // Remove espaços múltiplos mas preserva quebras de linha
        $text = preg_replace('/[ \t]+/', ' ', $text);
        // Remove linhas em branco excessivas (mais de 2)
        $text = preg_replace('/\n{3,}/', "\n\n", $text);
        $text = trim($text);

        return $text;
    }

    public function extractMetadata(string $filePath): array
    {
        try {
            $pdf = $this->parser->parseFile($filePath);
            $details = $pdf->getDetails();
            $pages = $pdf->getPages();

            return [
                'pages' => count($pages),
                'title' => $details['Title'] ?? null,
                'author' => $details['Author'] ?? null,
                'creation_date' => $details['CreationDate'] ?? null,
            ];
        } catch (\Exception $e) {
            return [];
        }
    }
}
