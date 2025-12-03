import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exames', href: '/exams' },
    { title: 'Novo Exame', href: '/exams/create' },
];

export default function CreateExam() {
    const { data, setData, post, processing, errors } = useForm({
        pdf_file: null as File | null,
    });

    const [isDragging, setIsDragging] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.pdf_file) {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }

        post('/exams');
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files[0] && files[0].type === 'application/pdf') {
            setData('pdf_file', files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('pdf_file', file);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo Exame" />
            <div className="mx-auto max-w-2xl p-6">
                <div className="rounded-lg border bg-card p-6">
                    <h1 className="mb-6 text-2xl font-bold">Upload de Exame</h1>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Arquivo PDF do Exame
                            </label>

                            {/* Drag and Drop Area */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative rounded-lg border-2 border-dashed transition-colors ${
                                    isDragging
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted-foreground/25 hover:border-primary/50'
                                } ${errors.pdf_file ? 'border-red-500' : ''}`}
                            >
                                <input
                                    id="pdf_file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                />

                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    {data.pdf_file ? (
                                        <>
                                            <svg
                                                className="mb-3 h-12 w-12 text-green-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <p className="mb-1 text-sm font-medium text-foreground">
                                                {data.pdf_file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {(data.pdf_file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Clique ou arraste outro arquivo para substituir
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="mb-3 h-12 w-12 text-muted-foreground"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                />
                                            </svg>
                                            <p className="mb-2 text-sm font-medium text-foreground">
                                                {isDragging ? 'Solte o arquivo aqui' : 'Clique ou arraste o PDF aqui'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Máximo 10MB
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {errors.pdf_file && (
                                <p className="mt-1 text-sm text-red-600">{errors.pdf_file}</p>
                            )}
                            <p className="mt-1 text-sm text-muted-foreground">
                                O sistema vai processar automaticamente com IA.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                                {processing ? 'Processando...' : 'Upload e Processar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.visit('/exams')}
                                className="rounded-md border px-4 py-2 hover:bg-accent"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>

                    {processing && (
                        <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                ⏳ Processando PDF com IA... Isso pode levar alguns segundos.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                    <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                        🤖 Sistema Inteligente - Como funciona?
                    </h3>
                    <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                        <li>1. Faça upload do PDF do exame</li>
                        <li>2. O sistema extrai automaticamente o texto do PDF</li>
                        <li>3. A IA identifica o nome do laboratório direto do PDF</li>
                        <li>4. A IA processa e identifica todos os resultados</li>
                        <li>5. O laboratório é criado automaticamente se não existir</li>
                        <li>6. Os dados são salvos e comparados com valores de referência</li>
                        <li>7. Você verá os resultados organizados e com gráficos</li>
                    </ul>
                    <p className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                        ✨ Não é necessário selecionar o laboratório manualmente!
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
