import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

interface Laboratory {
    id: number;
    name: string;
    cnpj: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
    active: boolean;
    exams_count: number;
}

interface LaboratoriesIndexProps {
    laboratories: {
        data: Laboratory[];
        links: any;
        meta: any;
    };
}

export default function LaboratoriesIndex({ laboratories }: LaboratoriesIndexProps) {
    const handleDelete = (labId: number) => {
        if (confirm('Tem certeza que deseja excluir este laboratório?')) {
            router.delete(`/admin/laboratories/${labId}`);
        }
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Laboratórios' },
            ]}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Laboratórios</h1>
                        <p className="text-muted-foreground">
                            Gerencie os laboratórios cadastrados
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/laboratories/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Laboratório
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>CNPJ</TableHead>
                                    <TableHead>Cidade/Estado</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Exames</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {laboratories.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            Nenhum laboratório encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    laboratories.data.map((lab) => (
                                        <TableRow key={lab.id}>
                                            <TableCell className="font-medium">
                                                {lab.name}
                                            </TableCell>
                                            <TableCell>{lab.cnpj || '-'}</TableCell>
                                            <TableCell>
                                                {lab.city && lab.state
                                                    ? `${lab.city}/${lab.state}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>{lab.phone || '-'}</TableCell>
                                            <TableCell>{lab.exams_count}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={lab.active ? 'default' : 'secondary'}
                                                >
                                                    {lab.active ? 'Ativo' : 'Inativo'}
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
                                                            href={`/admin/laboratories/${lab.id}/edit`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => handleDelete(lab.id)}
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
