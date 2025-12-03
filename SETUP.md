# Setup Rápido - Meus Exames

## 1. Configurar API Key

Edite `.env` e adicione sua chave da Anthropic na linha 67:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

## 2. Popular banco de dados

```bash
php artisan db:seed
```

Isso vai criar:
- 4 laboratórios (LabMax, Central SUS, Santa Casa, Outro)
- 5 tipos de exames com todos os parâmetros
- Valores de referência padrão

## 3. Criar link simbólico para storage

```bash
php artisan storage:link
```

## 4. Testar o sistema

### Via navegador (precisa do frontend):

```bash
npm run dev
php artisan serve
```

Acesse: http://localhost:8000

### Via Tinker (testar backend):

```bash
php artisan tinker
```

```php
// 1. Criar um paciente de teste
$user = User::first();
$patient = Patient::create([
    'user_id' => $user->id,
    'name' => 'Teste Silva',
    'cpf' => '123.456.789-00',
    'birth_date' => '1990-01-01',
    'gender' => 'male',
]);

// 2. Verificar laboratórios disponíveis
Laboratory::all()->pluck('name', 'id');

// 3. Verificar tipos de exames
ExamType::all()->pluck('name', 'id');
```

## 5. Testar upload de PDF (quando tiver frontend)

1. Login no sistema
2. Criar/selecionar paciente
3. Ir em "Novo Exame"
4. Selecionar laboratório
5. Upload do PDF
6. Sistema processa automaticamente
7. Ver resultados

## Estrutura do banco

Veja o diagrama completo em: `database/DATABASE_STRUCTURE.md`

## Troubleshooting

### Erro: "ANTHROPIC_API_KEY not set"
- Configure a chave no `.env`

### Erro: "Storage directory not found"
- Execute: `php artisan storage:link`

### Erro ao fazer upload
- Verifique permissões: `storage/app/public/exams`
- Tamanho máximo: 10MB
- Formato: apenas PDF

### Erro de parsing
- Verifique se a API key está correta
- Veja os logs em `storage/logs/laravel.log`
