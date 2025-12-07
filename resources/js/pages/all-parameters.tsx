import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import axios from '@/lib/axios';
import ParameterHistoryChart from '@/components/charts/parameter-history-chart';

interface ReferenceCategory {
    name: string;
    min: number | null | string;
    max: number | null | string;
}

interface Parameter {
    id: number;
    exam_id: number;
    parameter_code: string;
    parameter_name: string;
    value: number | string;
    unit: string;
    status: string;
    reference_min: number | null;
    reference_max: number | null;
    reference_type: string | null;
    reference_categories: ReferenceCategory[] | null;
    reference_description: string | null;
    exam_date: string;
    laboratory_name: string;
    total_exams: number;
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
    allParameters: Parameter[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Todos os Parâmetros', href: '/all-parameters' },
];

export default function AllParameters({ allParameters }: Props) {
    const [expandedParameter, setExpandedParameter] = useState<string | null>(null);
    const [historyData, setHistoryData] = useState<Record<string, HistoryDataPoint[]>>({});
    const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [laboratoryFilter, setLaboratoryFilter] = useState<string>('all');

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

    const getReferenceDisplay = (param: Parameter) => {
        // Categórica
        if (param.reference_type === 'categorical' && param.reference_categories) {
            return (
                <div className="space-y-1">
                    {param.reference_categories.map((cat, index) => (
                        <div key={index} className="text-xs">
                            <span className="font-medium">{cat.name}:</span>{' '}
                            {cat.min !== null && cat.max !== null
                                ? `${cat.min} - ${cat.max}`
                                : cat.min !== null
                                  ? `≥ ${cat.min}`
                                  : cat.max !== null
                                    ? `< ${cat.max}`
                                    : '-'}
                        </div>
                    ))}
                    {param.reference_description && (
                        <div className="text-xs italic text-muted-foreground">
                            {param.reference_description}
                        </div>
                    )}
                </div>
            );
        }

        // Numérica
        if (param.reference_min !== null || param.reference_max !== null) {
            const refText =
                param.reference_min !== null && param.reference_max !== null
                    ? `${Number(param.reference_min).toFixed(2)} - ${Number(param.reference_max).toFixed(2)}`
                    : param.reference_min !== null
                      ? `≥ ${Number(param.reference_min).toFixed(2)}`
                      : `< ${Number(param.reference_max).toFixed(2)}`;

            return (
                <div className="space-y-1">
                    <div className="text-sm">{refText}</div>
                    {param.reference_description && (
                        <div className="text-xs italic text-muted-foreground">
                            {param.reference_description}
                        </div>
                    )}
                </div>
            );
        }

        return <span className="text-muted-foreground">-</span>;
    };

    const toggleHistory = async (parameterCode: string) => {
        if (expandedParameter === parameterCode) {
            setExpandedParameter(null);
            return;
        }

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
            setExpandedParameter(parameterCode);
        }
    };

    // Obtém lista única de laboratórios
    const uniqueLaboratories = Array.from(new Set(allParameters.map(p => p.laboratory_name)));

    // Filtra os parâmetros
    const filteredParameters = allParameters.filter(param => {
        const matchesSearch = param.parameter_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || param.status === statusFilter;
        const matchesLaboratory = laboratoryFilter === 'all' || param.laboratory_name === laboratoryFilter;

        return matchesSearch && matchesStatus && matchesLaboratory;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Todos os Parâmetros" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Todos os Parâmetros</h1>
                        <p className="text-sm text-muted-foreground">
                            Visualize todos os parâmetros dos seus exames
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="rounded-md border px-4 py-2 hover:bg-accent"
                    >
                        ← Voltar
                    </Link>
                </div>

                {/* Filtros */}
                <div className="mb-6 rounded-lg border bg-card p-4">
                    <h2 className="mb-4 text-sm font-semibold">Filtros</h2>
                    <div className="grid gap-4 md:grid-cols-3">
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
                        <div>
                            <label className="mb-2 block text-sm font-medium">Laboratório</label>
                            <select
                                value={laboratoryFilter}
                                onChange={(e) => setLaboratoryFilter(e.target.value)}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">Todos</option>
                                {uniqueLaboratories.map(lab => (
                                    <option key={lab} value={lab}>{lab}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contador de resultados */}
                <div className="mb-4 text-sm text-muted-foreground">
                    Exibindo {filteredParameters.length} de {allParameters.length} parâmetros
                </div>

                {filteredParameters.length === 0 ? (
                    <div className="rounded-lg border bg-card p-12 text-center">
                        <p className="mb-4 text-lg text-muted-foreground">
                            Nenhum parâmetro encontrado com os filtros aplicados.
                        </p>
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
                                        <th className="p-4 text-left text-sm font-medium">Total Exames</th>
                                        <th className="p-4 text-left text-sm font-medium">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredParameters.map((param) => (
                                        <>
                                            <tr key={param.id} className="border-b hover:bg-muted/50">
                                                <td className="p-4 text-sm font-medium">
                                                    {param.parameter_name}
                                                </td>
                                                <td className="p-4 text-sm font-bold">
                                                    {!isNaN(Number(param.value)) ? Number(param.value).toFixed(2) : param.value} {param.unit}
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {getReferenceDisplay(param)}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">
                                                            {getStatusIcon(param.status)}
                                                        </span>
                                                        {getStatusBadge(param.status)}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm">
                                                    {param.exam_date}
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {param.laboratory_name}
                                                </td>
                                                <td className="p-4 text-sm text-center">
                                                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                                        {param.total_exams}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => toggleHistory(param.parameter_code)}
                                                            disabled={loadingHistory[param.parameter_code]}
                                                            className="flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
                                                        >
                                                            {loadingHistory[param.parameter_code] ? (
                                                                <>
                                                                    <span className="animate-spin">⏳</span>
                                                                    Carregando...
                                                                </>
                                                            ) : expandedParameter === param.parameter_code ? (
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
                                                            href={`/exams/${param.exam_id}`}
                                                            className="text-primary hover:underline"
                                                        >
                                                            Ver Exame
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedParameter === param.parameter_code && historyData[param.parameter_code] && (
                                                <tr key={`${param.id}-history`}>
                                                    <td colSpan={8} className="bg-muted/30 p-4">
                                                        <ParameterHistoryChart
                                                            data={historyData[param.parameter_code]}
                                                            parameterName={param.parameter_name}
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
