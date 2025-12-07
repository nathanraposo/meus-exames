import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
}

interface Laboratory {
    id: number;
    name: string;
}

interface ExamType {
    id: number;
    name: string;
}

interface Exam {
    id: number;
    title: string;
    collection_date: string;
    status: string;
    protocol_number: string | null;
    user: User;
    laboratory: Laboratory;
    exam_type: ExamType;
}

interface Filters {
    laboratory_id?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    exams: Exam[];
    laboratories: Laboratory[];
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exames', href: '/exams' },
];

export default function ExamsIndex({ exams, laboratories, filters }: Props) {
    const [laboratoryId, setLaboratoryId] = useState(filters.laboratory_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const applyFilters = () => {
        router.get('/exams', {
            laboratory_id: laboratoryId || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLaboratoryId('');
        setDateFrom('');
        setDateTo('');
        router.get('/exams', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    const getStatusBadge = (status: string) => {
        const colors = {
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };

        const labels = {
            completed: 'Concluído',
            processing: 'Processando',
            pending: 'Pendente',
            cancelled: 'Cancelado',
        };

        return (
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors[status as keyof typeof colors] || colors.pending}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const getExamName = (title: string) => {
        // Remove " - Laboratório - Data" do título, mantendo apenas o nome do exame
        const parts = title.split(' - ');
        return parts[0] || title;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exames" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Meus Exames</h1>
                    <Link
                        href="/exams/create"
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        + Novo Exame
                    </Link>
                </div>

                {/* Filtros */}
                <div className="mb-6 rounded-lg border bg-card p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Laboratório</label>
                            <select
                                value={laboratoryId}
                                onChange={(e) => setLaboratoryId(e.target.value)}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Todos os laboratórios</option>
                                {laboratories.map((lab) => (
                                    <option key={lab.id} value={lab.id}>
                                        {lab.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Data de</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Data até</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={applyFilters}
                                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                            >
                                Filtrar
                            </button>
                            <button
                                onClick={clearFilters}
                                className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card">
                    {exams.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="mb-4 text-muted-foreground">
                                Nenhum exame encontrado.
                            </p>
                            <Link
                                href="/exams/create"
                                className="text-primary hover:underline"
                            >
                                Fazer upload do primeiro exame
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="p-4 text-left text-sm font-medium">Exame</th>
                                        <th className="p-4 text-left text-sm font-medium">Laboratório</th>
                                        <th className="p-4 text-left text-sm font-medium">Data</th>
                                        <th className="p-4 text-left text-sm font-medium">Status</th>
                                        <th className="p-4 text-left text-sm font-medium">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.map((exam) => (
                                        <tr key={exam.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 text-sm">
                                                <p className="font-medium">{getExamName(exam.title)}</p>
                                            </td>
                                            <td className="p-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <p>{exam.laboratory.name}</p>
                                                    {exam.laboratory.name === 'Laboratório Desconhecido' && (
                                                        <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                            ⚠️ Desconhecido
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm">
                                                {formatDate(exam.collection_date)}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {getStatusBadge(exam.status)}
                                            </td>
                                            <td className="p-4 text-sm">
                                                <Link
                                                    href={`/exams/${exam.id}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    Ver detalhes
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
