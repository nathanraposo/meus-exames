import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function CreateExamType() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/exam-types');
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Tipos de Exame', href: '/admin/exam-types' },
                { label: 'Novo Tipo de Exame' },
            ]}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Novo Tipo de Exame</h1>
                    <p className="text-muted-foreground">Cadastrar um novo tipo de exame</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Tipo de Exame</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ex: Hemograma Completo"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Código *</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        placeholder="Ex: HEMOGRAMA"
                                        required
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-600">{errors.code}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Código único para identificar o tipo de exame (sem espaços)
                                    </p>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Descrição</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        placeholder="Descrição detalhada do tipo de exame..."
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 md:col-span-2">
                                    <Checkbox
                                        id="active"
                                        checked={data.active}
                                        onCheckedChange={(checked) =>
                                            setData('active', checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="active" className="cursor-pointer">
                                        Tipo de exame ativo
                                    </Label>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Salvando...' : 'Salvar'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/admin/exam-types')}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
