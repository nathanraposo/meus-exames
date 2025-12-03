import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import axios from '@/lib/axios';
import ParameterHistoryChart from '@/components/charts/parameter-history-chart';

interface User {
    id: number;
    name: string;
    birth_date: string;
    gender: string;
}

interface Laboratory {
    id: number;
    name: string;
}

interface ExamType {
    id: number;
    name: string;
}

interface ExamParameter {
    id: number;
    name: string;
    code: string;
    unit: string;
}

interface ExamResult {
    id: number;
    numeric_value: number | null;
    text_value: string | null;
    reference_min: number | null;
    reference_max: number | null;
    status: string;
    observation: string | null;
    exam_parameter: ExamParameter;
}

interface Exam {
    id: number;
    title: string;
    collection_date: string;
    protocol_number: string | null;
    status: string;
    requesting_doctor: string | null;
    crm_doctor: string | null;
    file_path: string | null;
    user: User;
    laboratory: Laboratory;
    exam_type: ExamType;
    results: ExamResult[];
}

interface Props {
    exam: Exam;
}

interface HistoryDataPoint {
    date: string;
    value: number;
    unit: string;
    status: string;
    reference_min: number | null;
    reference_max: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exames', href: '/exams' },
    { title: 'Detalhes', href: '#' },
];

export default function ShowExam({ exam }: Props) {
    const [expandedParameter, setExpandedParameter] = useState<string | null>(null);
    const [historyData, setHistoryData] = useState<Record<string, HistoryDataPoint[]>>({});
    const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const getStatusBadge = (status: string) => {
        const colors = {
            normal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };

        const labels = {
            normal: 'Normal',
            low: 'Baixo',
            high: 'Alto',
            critical: 'Crítico',
        };

        return (
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors[status as keyof typeof colors] || colors.normal}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const getStatusIcon = (status: string) => {
        if (status === 'normal') return '✓';
        if (status === 'low') return '↓';
        if (status === 'high') return '↑';
        if (status === 'critical') return '⚠';
        return '';
    };

    const toggleHistory = async (parameterCode: string) => {
        // Se já está expandido, fecha
        if (expandedParameter === parameterCode) {
            setExpandedParameter(null);
            return;
        }

        // Se não tem dados em cache, busca da API
        if (!historyData[parameterCode]) {
            setLoadingHistory({ ...loadingHistory, [parameterCode]: true });

            try {
                const response = await axios.get<HistoryDataPoint[]>(`/exams/history/${parameterCode}`);
                setHistoryData({ ...historyData, [parameterCode]: response.data });
                setLoadingHistory({ ...loadingHistory, [parameterCode]: false });
                setExpandedParameter(parameterCode);
            } catch (error) {
                console.error('Erro ao buscar histórico:', error);
                setLoadingHistory({ ...loadingHistory, [parameterCode]: false });
            }
        } else {
            // Usa dados em cache
            setExpandedParameter(parameterCode);
        }
    };

    // Filtra os resultados
    const filteredResults = exam.results.filter(result => {
        const matchesSearch = result.exam_parameter.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={exam.title} />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{exam.title}</h1>
                    <Link
                        href="/exams"
                        className="rounded-md border px-4 py-2 hover:bg-accent"
                    >
                        ← Voltar
                    </Link>
                </div>

                <div className="mb-6 rounded-lg border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">Informações do Exame</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Paciente</p>
                            <p className="font-medium">{exam.user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Laboratório</p>
                            <p className="font-medium">{exam.laboratory.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Data da Coleta</p>
                            <p className="font-medium">
                                {new Date(exam.collection_date).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        {exam.protocol_number && (
                            <div>
                                <p className="text-sm text-muted-foreground">Número do Protocolo</p>
                                <p className="font-medium">{exam.protocol_number}</p>
                            </div>
                        )}
                        {exam.requesting_doctor && (
                            <div>
                                <p className="text-sm text-muted-foreground">Médico Solicitante</p>
                                <p className="font-medium">
                                    {exam.requesting_doctor}
                                    {exam.crm_doctor && ` - CRM: ${exam.crm_doctor}`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filtros */}
                <div className="mb-6 rounded-lg border bg-card p-4">
                    <h2 className="mb-4 text-sm font-semibold">Filtros</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Buscar por nome</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Digite o nome do parâmetro..."
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">Todos</option>
                                <option value="normal">Normal</option>
                                <option value="low">Baixo</option>
                                <option value="high">Alto</option>
                                <option value="critical">Crítico</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contador de resultados */}
                <div className="mb-4 text-sm text-muted-foreground">
                    Exibindo {filteredResults.length} de {exam.results.length} resultados
                </div>

                <div className="rounded-lg border bg-card">
                    <div className="border-b p-4">
                        <h2 className="text-lg font-semibold">Resultados</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="p-4 text-left text-sm font-medium">Parâmetro</th>
                                    <th className="p-4 text-left text-sm font-medium">Resultado</th>
                                    <th className="p-4 text-left text-sm font-medium">Unidade</th>
                                    <th className="p-4 text-left text-sm font-medium">Referência</th>
                                    <th className="p-4 text-left text-sm font-medium">Status</th>
                                    <th className="p-4 text-left text-sm font-medium">Histórico</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            {exam.results.length === 0 ? 'Nenhum resultado encontrado' : 'Nenhum resultado corresponde aos filtros aplicados'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredResults.map((result) => (
                                        <>
                                            <tr key={result.id} className="border-b hover:bg-muted/50">
                                                <td className="p-4 text-sm font-medium">
                                                    {result.exam_parameter.name}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    {result.numeric_value !== null
                                                        ? Number(result.numeric_value).toFixed(2)
                                                        : result.text_value}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    {result.exam_parameter.unit}
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {result.reference_min !== null && result.reference_max !== null
                                                        ? `${Number(result.reference_min).toFixed(2)} - ${Number(result.reference_max).toFixed(2)}`
                                                        : '-'}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">
                                                            {getStatusIcon(result.status)}
                                                        </span>
                                                        {getStatusBadge(result.status)}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <button
                                                        onClick={() => toggleHistory(result.exam_parameter.code)}
                                                        disabled={loadingHistory[result.exam_parameter.code]}
                                                        className="flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
                                                    >
                                                        {loadingHistory[result.exam_parameter.code] ? (
                                                            <>
                                                                <span className="animate-spin">⏳</span>
                                                                Carregando...
                                                            </>
                                                        ) : expandedParameter === result.exam_parameter.code ? (
                                                            <>
                                                                ▼ Ocultar
                                                            </>
                                                        ) : (
                                                            <>
                                                                📈 Ver Histórico
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedParameter === result.exam_parameter.code && historyData[result.exam_parameter.code] && (
                                                <tr key={`${result.id}-history`}>
                                                    <td colSpan={6} className="bg-muted/30 p-4">
                                                        <ParameterHistoryChart
                                                            data={historyData[result.exam_parameter.code]}
                                                            parameterName={result.exam_parameter.name}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {exam.file_path && (
                    <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            📄 PDF original disponível:{' '}
                            <a
                                href={`/storage/${exam.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-600"
                            >
                                Visualizar PDF
                            </a>
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
