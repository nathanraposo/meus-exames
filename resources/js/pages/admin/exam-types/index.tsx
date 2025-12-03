import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface ExamType {
    id: number;
    name: string;
    code: string;
    description: string | null;
    active: boolean;
    exams_count: number;
}

interface ExamTypesIndexProps {
    examTypes: {
        data: ExamType[];
        links: any;
        meta: any;
    };
}

export default function ExamTypesIndex({ examTypes }: ExamTypesIndexProps) {
    const handleDelete = (typeId: number) => {
        if (confirm('Tem certeza que deseja excluir este tipo de exame?')) {
            router.delete(`/admin/exam-types/${typeId}`);
        }
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Tipos de Exame' },
            ]}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Tipos de Exame</h1>
                        <p className="text-muted-foreground">
                            Gerencie os tipos de exame disponíveis
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/exam-types/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Tipo de Exame
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Exames</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {examTypes.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            Nenhum tipo de exame encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    examTypes.data.map((type) => (
                                        <TableRow key={type.id}>
                                            <TableCell className="font-medium">
                                                {type.name}
                                            </TableCell>
                                            <TableCell>
                                                <code className="rounded bg-muted px-2 py-1 text-sm">
                                                    {type.code}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                {type.description
                                                    ? type.description.substring(0, 50) +
                                                      (type.description.length > 50 ? '...' : '')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>{type.exams_count}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={type.active ? 'default' : 'secondary'}
                                                >
                                                    {type.active ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/admin/exam-types/${type.id}/edit`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => handleDelete(type.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
