export default function MeusExamesLogo({ className = "h-12 w-12" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Documento/Papel */}
            <rect
                x="14"
                y="8"
                width="36"
                height="48"
                rx="3"
                fill="white"
                stroke="#3B82F6"
                strokeWidth="2.5"
            />

            {/* Gráfico de linha ascendente (representando resultados) */}
            <path
                d="M 20 38 L 26 32 L 32 34 L 38 26 L 44 28"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Pontos no gráfico */}
            <circle cx="20" cy="38" r="2" fill="#10B981" />
            <circle cx="26" cy="32" r="2" fill="#10B981" />
            <circle cx="32" cy="34" r="2" fill="#10B981" />
            <circle cx="38" cy="26" r="2" fill="#10B981" />
            <circle cx="44" cy="28" r="2" fill="#10B981" />

            {/* Cruz médica no topo */}
            <g transform="translate(28, 14)">
                <rect x="3" y="0" width="2" height="8" rx="1" fill="#EF4444" />
                <rect x="0" y="3" width="8" height="2" rx="1" fill="#EF4444" />
            </g>

            {/* Linhas de texto (representando dados) */}
            <line x1="20" y1="45" x2="44" y2="45" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="50" x2="36" y2="50" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
