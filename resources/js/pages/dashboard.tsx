import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Stats {
    total_exams: number;
    exams_this_month: number;
    abnormal_results: number;
}

interface Exam {
    id: number;
    title: string;
    collection_date: string;
    user: { name: string };
    laboratory: { name: string };
    exam_type: { name: string };
}

interface AbnormalResult {
    patient_name: string;
    parameter_name: string;
    value: number;
    unit: string;
    status: string;
    reference_min: number;
    reference_max: number;
    date: string;
}

interface Props {
    stats?: Stats;
    recentExams?: Exam[];
    abnormalResults?: AbnormalResult[];
}

export default function Dashboard({ stats, recentExams = [], abnormalResults = [] }: Props) {

    const getStatusColor = (status: string) => {
        const colors = {
            low: 'text-yellow-600 dark:text-yellow-400',
            high: 'text-orange-600 dark:text-orange-400',
            critical: 'text-red-600 dark:text-red-400',
        };
        return colors[status as keyof typeof colors] || 'text-gray-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <Link
                        href="/exams/create"
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        + Novo Exame
                    </Link>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-6">
                        <p className="text-sm text-muted-foreground">Total de Exames</p>
                        <p className="mt-2 text-3xl font-bold">{stats?.total_exams || 0}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-6">
                        <p className="text-sm text-muted-foreground">Exames este Mês</p>
                        <p className="mt-2 text-3xl font-bold">{stats?.exams_this_month || 0}</p>
                    </div>
                    <Link
                        href="/abnormal-results"
                        className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Resultados Anormais</p>
                                <p className="mt-2 text-3xl font-bold text-orange-600">{stats?.abnormal_results || 0}</p>
                            </div>
                            <span className="text-2xl">→</span>
                        </div>
                    </Link>
                </div>

                <div className="mb-6 rounded-lg border bg-card">
                    <div className="border-b p-4">
                        <h2 className="font-semibold">Exames Recentes</h2>
                    </div>
                    <div className="p-4">
                        {!recentExams || recentExams.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                Nenhum exame encontrado.{' '}
                                <Link href="/exams/create" className="text-primary hover:underline">
                                    Fazer upload do primeiro exame
                                </Link>
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentExams.map((exam) => (
                                    <div key={exam.id} className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="font-medium">{exam.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {exam.user.name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(exam.collection_date).toLocaleDateString('pt-BR')}
                                            </p>
                                            <Link
                                                href={`/exams/${exam.id}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Ver detalhes
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
