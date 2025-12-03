import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Building2, FlaskConical, TrendingUp, UserPlus } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface DashboardProps {
    stats: {
        total_users: number;
        total_exams: number;
        total_laboratories: number;
        total_exam_types: number;
        exams_this_month: number;
        new_users_this_month: number;
    };
    recentExams: any[];
    recentUsers: any[];
}

export default function Dashboard({ stats, recentExams = [], recentUsers = [] }: DashboardProps) {
    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Dashboard' },
            ]}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
                    <p className="text-muted-foreground">
                        Visão geral do sistema Meus Exames
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Usuários
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats?.new_users_this_month || 0} este mês
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Exames
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_exams || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats?.exams_this_month || 0} este mês
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Laboratórios
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_laboratories || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Cadastrados no sistema
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Exames Recentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {!recentExams || recentExams.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhum exame registrado ainda
                                    </p>
                                ) : (
                                    recentExams.map((exam) => (
                                        <div
                                            key={exam.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {exam.user.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {exam.exam_type.name} - {exam.laboratory.name}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(exam.collection_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Novos Usuários</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {!recentUsers || recentUsers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhum usuário registrado ainda
                                    </p>
                                ) : (
                                    recentUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
