<?php

namespace App\Console\Commands;

use App\Models\Exam;
use App\Services\ExamProcessingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ReprocessExam extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exams:reprocess {exam_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reprocessa um exame usando os dados salvos (sem chamar API da Claude)';

    protected ExamProcessingService $examProcessor;

    public function __construct(ExamProcessingService $examProcessor)
    {
        parent::__construct();
        $this->examProcessor = $examProcessor;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $examId = $this->argument('exam_id');

        $exam = Exam::with('user')->find($examId);

        if (!$exam) {
            $this->error("Exame #{$examId} não encontrado.");
            return 1;
        }

        if (!$exam->ai_response) {
            $this->error("Exame #{$examId} não possui dados salvos (ai_response vazio).");
            $this->info("Este exame precisa ser processado novamente com upload do PDF.");
            return 1;
        }

        $this->info("Reprocessando exame #{$examId}...");
        $this->info("Título: {$exam->title}");
        $this->info("Usuário: {$exam->user->name}");

        DB::beginTransaction();

        try {
            // Deleta resultados antigos
            $deletedCount = $exam->results()->count();
            $exam->results()->delete();
            $this->info("Deletados {$deletedCount} resultados anteriores.");

            // Reprocessa usando dados salvos
            $this->examProcessor->reprocessExamFromSavedData($exam);

            DB::commit();

            $newResultsCount = $exam->results()->count();
            $this->info("Criados {$newResultsCount} novos resultados.");
            $this->info("✓ Exame reprocessado com sucesso!");

            return 0;
        } catch (\Exception $e) {
            DB::rollBack();

            $this->error("Erro ao reprocessar exame: {$e->getMessage()}");
            $this->error($e->getTraceAsString());

            return 1;
        }
    }
}
