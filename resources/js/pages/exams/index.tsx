import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

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

interface Props {
    exams: Exam[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exames', href: '/exams' },
];

export default function ExamsIndex({ exams }: Props) {
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
                                        <th className="p-4 text-left text-sm font-medium">Protocolo</th>
                                        <th className="p-4 text-left text-sm font-medium">Status</th>
                                        <th className="p-4 text-left text-sm font-medium">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.map((exam) => (
                                        <tr key={exam.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 text-sm font-medium">
                                                {exam.title}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {exam.protocol_number || '-'}
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
