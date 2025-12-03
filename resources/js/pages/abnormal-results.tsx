import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import axios from '@/lib/axios';
import ParameterHistoryChart from '@/components/charts/parameter-history-chart';

interface AbnormalResult {
    id: number;
    exam_id: number;
    parameter_code: string;
    parameter_name: string;
    value: number | string;
    unit: string;
    status: string;
    reference_min: number | null;
    reference_max: number | null;
    exam_date: string;
    laboratory_name: string;
}

interface HistoryDataPoint {
    date: string;
    value: number;
    unit: string;
    status: string;
    reference_min: number | null;
    reference_max: number | null;
}

interface Props {
    abnormalResults: AbnormalResult[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Resultados Anormais', href: '/abnormal-results' },
];

export default function AbnormalResults({ abnormalResults }: Props) {
    const [expandedParameter, setExpandedParameter] = useState<string | null>(null);
    const [historyData, setHistoryData] = useState<Record<string, HistoryDataPoint[]>>({});
    const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resultados Anormais" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">⚠️ Resultados Fora da Referência</h1>
                        <p className="text-sm text-muted-foreground">
                            Últimos valores anormais de cada parâmetro
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="rounded-md border px-4 py-2 hover:bg-accent"
                    >
                        ← Voltar
                    </Link>
                </div>

                {abnormalResults.length === 0 ? (
                    <div className="rounded-lg border bg-card p-12 text-center">
                        <p className="mb-4 text-lg text-muted-foreground">
                            🎉 Parabéns! Nenhum resultado anormal encontrado.
                        </p>
                        <Link
                            href="/dashboard"
                            className="text-primary hover:underline"
                        >
                            Voltar para Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="rounded-lg border bg-card">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="p-4 text-left text-sm font-medium">Parâmetro</th>
                                        <th className="p-4 text-left text-sm font-medium">Último Valor</th>
                                        <th className="p-4 text-left text-sm font-medium">Referência</th>
                                        <th className="p-4 text-left text-sm font-medium">Status</th>
                                        <th className="p-4 text-left text-sm font-medium">Data</th>
                                        <th className="p-4 text-left text-sm font-medium">Laboratório</th>
                                        <th className="p-4 text-left text-sm font-medium">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abnormalResults.map((result) => (
                                        <>
                                            <tr key={result.id} className="border-b hover:bg-muted/50">
                                                <td className="p-4 text-sm font-medium">
                                                    {result.parameter_name}
                                                </td>
                                                <td className="p-4 text-sm font-bold">
                                                    {typeof result.value === 'number' ? Number(result.value).toFixed(2) : result.value} {result.unit}
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {result.reference_min !== null && result.reference_max !== null
                                                        ? `${Number(result.reference_min).toFixed(2)} - ${Number(result.reference_max).toFixed(2)} ${result.unit}`
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
                                                    {result.exam_date}
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {result.laboratory_name}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => toggleHistory(result.parameter_code)}
                                                            disabled={loadingHistory[result.parameter_code]}
                                                            className="flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
                                                        >
                                                            {loadingHistory[result.parameter_code] ? (
                                                                <>
                                                                    <span className="animate-spin">⏳</span>
                                                                    Carregando...
                                                                </>
                                                            ) : expandedParameter === result.parameter_code ? (
                                                                <>
                                                                    ▼ Ocultar
                                                                </>
                                                            ) : (
                                                                <>
                                                                    📈 Ver Histórico
                                                                </>
                                                            )}
                                                        </button>
                                                        <Link
                                                            href={`/exams/${result.exam_id}`}
                                                            className="text-primary hover:underline"
                                                        >
                                                            Ver Exame
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedParameter === result.parameter_code && historyData[result.parameter_code] && (
                                                <tr key={`${result.id}-history`}>
                                                    <td colSpan={7} className="bg-muted/30 p-4">
                                                        <ParameterHistoryChart
                                                            data={historyData[result.parameter_code]}
                                                            parameterName={result.parameter_name}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
