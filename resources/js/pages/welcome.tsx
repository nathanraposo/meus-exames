import { Head, Link } from '@inertiajs/react';
import MeusExamesLogo from '@/components/meus-exames-logo';

interface Props {
    canRegister: boolean;
}

export default function Welcome({ canRegister }: Props) {
    return (
        <>
            <Head title="Bem-vindo ao Meus Exames" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Header */}
                <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
                    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <MeusExamesLogo className="h-8 w-8 sm:h-10 sm:w-10" />
                                <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400 sm:text-2xl">
                                    Meus Exames
                                </h1>
                            </div>
                            <div className="flex gap-2 sm:gap-4">
                                <Link
                                    href="/login"
                                    className="rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950 sm:px-6 sm:py-2 sm:text-base"
                                >
                                    Entrar
                                </Link>
                                {canRegister && (
                                    <Link
                                        href="/register"
                                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 sm:px-6 sm:py-2 sm:text-base"
                                    >
                                        Cadastrar
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                    {/* Background decoration */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/20 sm:h-96 sm:w-96"></div>
                        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-green-400/20 blur-3xl dark:bg-green-600/20 sm:h-96 sm:w-96"></div>
                    </div>

                    <div className="mx-auto max-w-7xl">
                        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                            {/* Left side - Text content */}
                            <div className="space-y-5 sm:space-y-8">
                                <div className="inline-block rounded-full bg-blue-100 px-3 py-1.5 dark:bg-blue-900 sm:px-4 sm:py-2">
                                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 sm:text-sm">
                                        ✨ Tecnologia IA para sua saúde
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                                    Gerencie seus{' '}
                                    <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                                        exames médicos
                                    </span>{' '}
                                    com inteligência artificial
                                </h2>

                                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg lg:text-xl">
                                    Faça upload dos seus exames em PDF e deixe nossa IA extrair automaticamente todos os resultados.
                                    Acompanhe seu histórico, visualize gráficos e identifique tendências de saúde de forma simples e intuitiva.
                                </p>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                                    {canRegister && (
                                        <Link
                                            href="/register"
                                            className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-center text-base font-semibold text-white shadow-lg shadow-blue-500/50 transition-all hover:scale-105 hover:shadow-xl dark:from-blue-500 dark:to-blue-600 sm:px-8 sm:py-4 sm:text-lg"
                                        >
                                            Começar Gratuitamente
                                        </Link>
                                    )}
                                    <Link
                                        href="/login"
                                        className="rounded-lg border-2 border-gray-300 px-6 py-3 text-center text-base font-semibold text-gray-700 transition-all hover:border-blue-600 hover:text-blue-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-400 sm:px-8 sm:py-4 sm:text-lg"
                                    >
                                        Fazer Login
                                    </Link>
                                </div>

                                <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center sm:gap-8 sm:pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            <div className="h-7 w-7 rounded-full bg-blue-500 ring-2 ring-white dark:ring-gray-900 sm:h-8 sm:w-8"></div>
                                            <div className="h-7 w-7 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900 sm:h-8 sm:w-8"></div>
                                            <div className="h-7 w-7 rounded-full bg-purple-500 ring-2 ring-white dark:ring-gray-900 sm:h-8 sm:w-8"></div>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                                            <span className="font-semibold text-gray-900 dark:text-white">100+</span> usuários satisfeitos
                                        </p>
                                    </div>
                                    <div className="text-base text-yellow-500 sm:text-lg">★★★★★</div>
                                </div>
                            </div>

                            {/* Right side - Visual/Illustration */}
                            <div className="relative hidden sm:block">
                                <div className="relative rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 p-1 shadow-2xl">
                                    <div className="rounded-xl bg-white p-4 dark:bg-gray-900 sm:p-6 lg:p-8">
                                        <div className="space-y-4 sm:space-y-6">
                                            {/* Mock exam card */}
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
                                                <div className="mb-4 flex items-center gap-3">
                                                    <MeusExamesLogo className="h-12 w-12" />
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white">Hemograma Completo</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Biofox - 01/12/2024</p>
                                                    </div>
                                                </div>

                                                {/* Mock chart */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hemoglobina</span>
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                                                            Normal
                                                        </span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                        <div className="h-full w-3/4 bg-gradient-to-r from-green-400 to-green-600"></div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Leucócitos</span>
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                                                            Normal
                                                        </span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                        <div className="h-full w-2/3 bg-gradient-to-r from-green-400 to-green-600"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">IA processando...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating badges */}
                                <div className="absolute -right-4 -top-4 rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800">
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">AI</p>
                                </div>
                                <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800">
                                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">100% Automático</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-white/50 px-4 py-12 backdrop-blur-sm dark:bg-gray-900/50 sm:px-6 sm:py-16 lg:py-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 text-center sm:mb-12 lg:mb-16">
                            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-3xl lg:text-4xl">
                                Por que escolher o Meus Exames?
                            </h2>
                            <p className="text-base text-gray-600 dark:text-gray-400 sm:text-lg">
                                Tecnologia de ponta para simplificar o gerenciamento da sua saúde
                            </p>
                        </div>

                        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="group rounded-2xl border border-blue-200 bg-white p-6 transition-all hover:shadow-xl dark:border-blue-900 dark:bg-gray-800 sm:p-8">
                                <div className="mb-3 inline-block rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900 sm:mb-4 sm:p-3">
                                    <svg className="h-7 w-7 text-blue-600 dark:text-blue-400 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white sm:mb-3 sm:text-xl">Upload Simples</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                    Faça upload dos seus exames em PDF com apenas alguns cliques. Arraste e solte ou selecione do seu computador.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group rounded-2xl border border-green-200 bg-white p-6 transition-all hover:shadow-xl dark:border-green-900 dark:bg-gray-800 sm:p-8">
                                <div className="mb-3 inline-block rounded-xl bg-green-100 p-2.5 dark:bg-green-900 sm:mb-4 sm:p-3">
                                    <svg className="h-7 w-7 text-green-600 dark:text-green-400 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white sm:mb-3 sm:text-xl">IA Inteligente</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                    Nossa inteligência artificial extrai automaticamente todos os dados do seu exame: resultados, laboratório e datas.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group rounded-2xl border border-purple-200 bg-white p-6 transition-all hover:shadow-xl dark:border-purple-900 dark:bg-gray-800 sm:p-8">
                                <div className="mb-3 inline-block rounded-xl bg-purple-100 p-2.5 dark:bg-purple-900 sm:mb-4 sm:p-3">
                                    <svg className="h-7 w-7 text-purple-600 dark:text-purple-400 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white sm:mb-3 sm:text-xl">Gráficos e Histórico</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                    Visualize a evolução dos seus parâmetros ao longo do tempo com gráficos interativos e histórico completo.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="group rounded-2xl border border-orange-200 bg-white p-6 transition-all hover:shadow-xl dark:border-orange-900 dark:bg-gray-800 sm:p-8">
                                <div className="mb-3 inline-block rounded-xl bg-orange-100 p-2.5 dark:bg-orange-900 sm:mb-4 sm:p-3">
                                    <svg className="h-7 w-7 text-orange-600 dark:text-orange-400 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white sm:mb-3 sm:text-xl">Alertas Anormais</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                    Identifique rapidamente resultados fora da referência com alertas visuais e página dedicada de anormalidades.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="group rounded-2xl border border-pink-200 bg-white p-6 transition-all hover:shadow-xl dark:border-pink-900 dark:bg-gray-800 sm:p-8">
                                <div className="mb-3 inline-block rounded-xl bg-pink-100 p-2.5 dark:bg-pink-900 sm:mb-4 sm:p-3">
                                    <svg className="h-7 w-7 text-pink-600 dark:text-pink-400 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white sm:mb-3 sm:text-xl">Busca e Filtros</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                    Encontre rapidamente qualquer parâmetro com filtros por nome, status, laboratório e datas.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="group rounded-2xl border border-indigo-200 bg-white p-6 transition-all hover:shadow-xl dark:border-indigo-900 dark:bg-gray-800 sm:p-8">
                                <div className="mb-3 inline-block rounded-xl bg-indigo-100 p-2.5 dark:bg-indigo-900 sm:mb-4 sm:p-3">
                                    <svg className="h-7 w-7 text-indigo-600 dark:text-indigo-400 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white sm:mb-3 sm:text-xl">Seguro e Privado</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                    Seus dados são protegidos com criptografia e você tem controle total sobre suas informações de saúde.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                    <div className="mx-auto max-w-4xl">
                        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 p-8 text-center shadow-2xl sm:rounded-3xl sm:p-12">
                            <h2 className="mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-3xl lg:text-4xl">
                                Pronto para começar?
                            </h2>
                            <p className="mb-6 text-base text-blue-50 sm:mb-8 sm:text-lg lg:text-xl">
                                Junte-se a centenas de usuários que já gerenciam seus exames de forma inteligente
                            </p>
                            {canRegister && (
                                <Link
                                    href="/register"
                                    className="inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl sm:px-8 sm:py-4 sm:text-lg"
                                >
                                    Criar Conta Gratuita
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
                        <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <MeusExamesLogo className="h-6 w-6 sm:h-8 sm:w-8" />
                                <p className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Meus Exames</p>
                            </div>
                            <p className="text-center text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                                © {new Date().getFullYear()} Meus Exames. Gerenciamento inteligente de exames médicos.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
