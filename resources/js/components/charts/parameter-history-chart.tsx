import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

interface ReferenceCategory {
    name: string;
    min: number | null | string;
    max: number | null | string;
}

interface HistoryDataPoint {
    date: string;
    value: number;
    unit: string;
    status: string;
    reference_min: number | null;
    reference_max: number | null;
    reference_type: string;
    reference_categories: ReferenceCategory[] | null;
    reference_description: string | null;
}

interface ParameterHistoryChartProps {
    data: HistoryDataPoint[];
    parameterName: string;
}

export default function ParameterHistoryChart({ data, parameterName }: ParameterHistoryChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Nenhum histórico disponível para este parâmetro.
                    </p>
                </div>
            </div>
        );
    }

    // Formata dados para o gráfico
    const chartData = data.map((point) => ({
        date: new Date(point.date).toLocaleDateString('pt-BR'),
        value: point.value,
        fullDate: new Date(point.date).toLocaleDateString('pt-BR'),
    }));

    // Pega valores de referência do exame mais recente (ou primeiro que tenha categorias)
    const pointWithCategories = data.find(d => d.reference_type === 'categorical' && d.reference_categories) || data[data.length - 1] || data[0];
    const referenceType = pointWithCategories?.reference_type || 'numeric';
    const referenceCategories = pointWithCategories?.reference_categories;
    const referenceDescription = pointWithCategories?.reference_description;
    const referenceMin = data.find(d => d.reference_min !== null)?.reference_min;
    const referenceMax = data.find(d => d.reference_max !== null)?.reference_max;
    const refMinFormatted = referenceMin !== null && referenceMin !== undefined ? Number(referenceMin).toFixed(2) : '?';
    const refMaxFormatted = referenceMax !== null && referenceMax !== undefined ? Number(referenceMax).toFixed(2) : '?';
    const unit = data[0]?.unit || '';

    // Determina cor da linha baseado no status predominante
    const getLineColor = () => {
        const statuses = data.map(d => d.status);
        if (statuses.includes('high') || statuses.includes('critical')) return '#f97316'; // orange
        if (statuses.includes('low')) return '#eab308'; // yellow
        return '#22c55e'; // green
    };

    // Componente customizado para renderizar label nos pontos
    const renderCustomLabel = (props: any) => {
        const { x, y, value } = props;
        return (
            <text
                x={x}
                y={y - 10}
                fill="currentColor"
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                className="fill-foreground"
            >
                {Number(value).toFixed(2)}
            </text>
        );
    };

    return (
        <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-4 text-sm font-semibold">
                    Histórico de {parameterName}
                </h3>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 25, right: 50, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tick={{ fill: 'currentColor' }}
                            padding={{ left: 30, right: 30 }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'currentColor' }}
                            label={{ value: unit, angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '0.5rem',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                            formatter={(value: number) => [`${Number(value).toFixed(2)} ${unit}`, 'Valor']}
                        />
                        <Legend />

                        {/* Linha de referência mínima */}
                        {referenceMin !== null && referenceMin !== undefined && (
                            <ReferenceLine
                                y={referenceMin}
                                stroke="#ef4444"
                                strokeDasharray="3 3"
                                label={{ value: 'Mín', position: 'right', fill: '#ef4444' }}
                            />
                        )}

                        {/* Linha de referência máxima */}
                        {referenceMax !== null && referenceMax !== undefined && (
                            <ReferenceLine
                                y={referenceMax}
                                stroke="#ef4444"
                                strokeDasharray="3 3"
                                label={{ value: 'Máx', position: 'right', fill: '#ef4444' }}
                            />
                        )}

                        {/* Linha principal de dados */}
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={getLineColor()}
                            strokeWidth={2}
                            dot={{ fill: getLineColor(), r: 5 }}
                            activeDot={{ r: 7 }}
                            name={parameterName}
                            label={renderCustomLabel}
                        />
                    </LineChart>
                </ResponsiveContainer>

                {/* Legenda de referência */}
                {referenceType === 'categorical' && referenceCategories ? (
                    <div className="mt-4 space-y-3">
                        <div className="rounded-lg border bg-muted/30 p-3">
                            <p className="mb-2 text-center text-xs font-semibold">Faixas de Referência:</p>
                            <div className="grid gap-2">
                                {referenceCategories.map((cat, index) => {
                                    const minValue = cat.min !== null && cat.min !== '' && cat.min !== undefined ? Number(cat.min) : null;
                                    const maxValue = cat.max !== null && cat.max !== '' && cat.max !== undefined ? Number(cat.max) : null;

                                    return (
                                        <div key={index} className="text-center text-xs">
                                            <span className="font-medium">{cat.name}:</span>{' '}
                                            {minValue !== null && maxValue !== null
                                                ? `${minValue} - ${maxValue} ${unit}`
                                                : minValue !== null
                                                  ? `≥ ${minValue} ${unit}`
                                                  : maxValue !== null
                                                    ? `< ${maxValue} ${unit}`
                                                    : '-'}
                                        </div>
                                    );
                                })}
                            </div>
                            {referenceDescription && (
                                <p className="mt-2 text-center text-xs italic text-muted-foreground">
                                    {referenceDescription}
                                </p>
                            )}
                        </div>
                        {(referenceMin !== null || referenceMax !== null) && (
                            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-12 border-t-2 border-dashed border-red-500"></div>
                                    <span>
                                        Intervalo de referência: {refMinFormatted} - {refMaxFormatted} {unit}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (referenceMin !== null || referenceMax !== null) ? (
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-12 border-t-2 border-dashed border-red-500"></div>
                                <span>
                                    Intervalo de referência: {refMinFormatted} - {refMaxFormatted} {unit}
                                </span>
                            </div>
                        </div>
                        {referenceDescription && (
                            <p className="text-center text-xs italic text-muted-foreground">
                                {referenceDescription}
                            </p>
                        )}
                    </div>
                ) : null}

                {/* Legenda de cores */}
                <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
                        <span className="text-muted-foreground">Normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                        <span className="text-muted-foreground">Baixo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#f97316' }}></div>
                        <span className="text-muted-foreground">Alto/Crítico</span>
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Último valor</p>
                        <p className="text-lg font-semibold">
                            {Number(data[data.length - 1]?.value).toFixed(2)} {unit}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Total de exames</p>
                        <p className="text-lg font-semibold">{data.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
