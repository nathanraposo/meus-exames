# Meus Exames - Regras e Padrões do Projeto

## 📋 Visão Geral

Sistema SaaS para gerenciamento de exames de sangue com processamento automático via IA.

**Stack:**
- Backend: Laravel 11 + PHP 8.3
- Frontend: React + TypeScript + Inertia.js
- Database: SQLite (dev) / MySQL (prod)
- UI: Shadcn/ui + Tailwind CSS
- IA: Claude API (Haiku 3.5) via Anthropic

## 🏗️ Arquitetura e Convenções

### Sistema de Permissões

**IMPORTANTE:** Este projeto usa **Spatie Laravel Permission**

- **Roles disponíveis:** `admin` e `patient`
- **Middleware configurado em** `bootstrap/app.php:25-29`
- **Compartilhamento com frontend:** `HandleInertiaRequests.php:47-48`

```php
// Verificar role do usuário
$user->hasRole('admin')
$user->hasRole('patient')

// Middleware de proteção
Route::middleware(['role:admin'])->group(...)
```

### Estrutura de Usuários

**ATENÇÃO:** O sistema migrou de `patients` para `users`

- ❌ **NÃO existe mais tabela `patients`**
- ✅ **Usuário autenticado É o paciente**
- ✅ Campos de paciente estão na tabela `users`
- ✅ Exames usam `user_id` (não `patient_id`)

```php
// CORRETO
$exam->user_id
$exam->user

// ERRADO (não existe mais)
$exam->patient_id
$exam->patient
```

### Estrutura de Dados Principal

**Users (Pacientes e Admins):**
- Campos: name, email, password, cpf, birth_date, gender, phone
- Relacionamento: `hasMany(Exam::class)`
- Accessor: `getAgeAttribute()` - calcula idade automaticamente

**Exams:**
- Relacionamento: `belongsTo(User::class)`
- Campos principais: user_id, exam_type_id, laboratory_id, collection_date, file_path
- Status: pending, processing, completed, failed

**ExamResults:**
- Relacionamento: `belongsTo(Exam::class)`, `belongsTo(ExamParameter::class)`
- Valores: numeric_value, text_value, boolean_value
- Status: normal, low, high, critical

## 🎨 Padrões de Frontend

### Convenções de Nomenclatura

**CRÍTICO:** Inertia.js usa case-sensitive para páginas!

```tsx
// CORRETO
Inertia::render('dashboard')          // → pages/dashboard.tsx
Inertia::render('admin/dashboard')    // → pages/admin/dashboard.tsx
Inertia::render('exams/create')       // → pages/exams/create.tsx

// ERRADO
Inertia::render('Dashboard')          // Erro: Page not found
Inertia::render('exams/Create')       // Erro: Page not found
```

### Proteção contra `undefined`

**SEMPRE** adicionar valores padrão em props de arrays:

```tsx
// CORRETO
export default function Page({ items = [], stats }: Props) {
  return <div>{stats?.total || 0}</div>
}

// ERRADO
export default function Page({ items, stats }: Props) {
  return <div>{stats.total}</div>  // ERRO se stats === undefined
}
```

### Layouts

**2 layouts diferentes:**

1. **AppLayout** - Para pacientes (`/dashboard`, `/exams`)
2. **AdminLayout** - Para admins (`/admin/*`)

```tsx
// Paciente
import AppLayout from '@/layouts/app-layout';

// Admin
import AdminLayout from '@/layouts/admin-layout';
```

## 🔐 Rotas e Permissões

### ⚠️ IMPORTANTE: Ordem de Rotas

**CRÍTICO:** Rotas específicas devem vir ANTES de `Route::resource()`

```php
// ✅ CORRETO
Route::get('exams/history/{parameterCode}', [ExamController::class, 'history']);
Route::resource('exams', ExamController::class);

// ❌ ERRADO
Route::resource('exams', ExamController::class);
Route::get('exams/history/{parameterCode}', ...); // NUNCA será alcançada!
```

**Por quê?** `Route::resource()` cria `exams/{exam}`, que captura tudo.

**Exemplo de rotas na ordem correta:**
```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('abnormal-results', [DashboardController::class, 'abnormalResults']);

    // Rotas específicas ANTES do resource
    Route::get('exams/history/{parameterCode}', [ExamController::class, 'history']);

    // Resource por último
    Route::resource('exams', ExamController::class);
});
```

### Rotas do Paciente (autenticado)

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('abnormal-results', [DashboardController::class, 'abnormalResults']);

    // Rotas específicas ANTES do resource
    Route::get('exams/history/{parameterCode}', [ExamController::class, 'history']);

    Route::resource('exams', ExamController::class);
});
```

### Rotas Admin (role:admin)

```php
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('dashboard', [Admin\DashboardController::class, 'index']);
        Route::resource('users', Admin\UserController::class);
        Route::resource('laboratories', Admin\LaboratoryController::class);
        Route::resource('exam-types', Admin\ExamTypeController::class);
    });
```

## 💾 Banco de Dados

### Migrations Importantes

1. **Spatie Permission:** `create_permission_tables.php`
2. **User com campos paciente:** `add_patient_fields_to_users_table.php`
3. **Migração de dados:** `migrate_exams_to_users_and_drop_patients.php`
4. **Campo title em exams:** `add_title_to_exams_table.php` (2025-12-02)

### Comandos de Migração

```bash
# Fresh migration (CUIDADO: apaga tudo)
php artisan migrate:fresh --seed

# Migração normal
php artisan migrate

# Rollback
php artisan migrate:rollback
```

### Seeders

**Ordem de execução:**

1. `RoleSeeder` - Cria roles admin/patient
2. `LaboratorySeeder` - Laboratórios exemplo
3. `ExamTypeSeeder` - Tipos de exame padrão

**Usuários padrão criados:**

- Admin: `admin@example.com` / senha: password
  - Data nascimento: 20/05/1985 (39 anos)
  - Gênero: Masculino

- Paciente: `test@example.com` / senha: password
  - Data nascimento: 15/01/1990 (34 anos)
  - Gênero: Masculino
  - CPF: 123.456.789-00
  - Telefone: (11) 98765-4321

## 🤖 Sistema de IA

### Fluxo de Processamento

1. **Upload PDF** → `ExamController::store()`
2. **Extração de texto** → `PdfExtractor::extractText()` (smalot/pdfparser)
   - Extrai TODAS as páginas separadamente
   - Adiciona marcadores "=== PÁGINA X ===" entre páginas
   - Logs detalhados de cada página extraída
3. **Parsing com IA** → `AiLabParser::parseExamText()` (Claude API)
   - Timeout: 120 segundos (para PDFs grandes)
   - Max tokens: 8192 (suporta PDFs com muitas páginas)
   - Instruído a processar TODAS as páginas
   - **EXTRAI AUTOMATICAMENTE o nome do laboratório do PDF**
4. **Criação/Atualização de registros** → `ExamProcessingService::createExam()`
   - Usa `updateOrCreate()` baseado em `user_id` + `protocol_number`
   - Se exame com mesmo protocolo existe: ATUALIZA (deleta resultados antigos e PDF antigo)
   - Se exame não existe: CRIA novo registro
   - Permite re-upload do mesmo PDF sem erro de constraint
   - **Gera título automático do exame** baseado em tipos + laboratório + data
5. **Criação de resultados** → `ExamProcessingService::createResults()`
6. **Auto-homologação** → Cria automaticamente ExamTypes, ExamParameters E Laboratories novos

### Sistema de Auto-Homologação (Inteligente)

**Como funciona:**

O sistema é **inteligente** e cria automaticamente tipos de exames e parâmetros que não existem no banco de dados.

**Exemplo prático:**

Se o PDF contém "Vitamina D" (que não existe no banco):
1. IA cria código: `VIT_D`
2. Sistema detecta que não existe
3. Auto-cria ExamType "Vitamina D" (código: VIT_D)
4. Auto-cria ExamParameter "Vitamina D"
5. Auto-cria ReferenceValue com valores do PDF
6. Salva resultado normalmente

**Implementação:**
- `ExamProcessingService::autoCreateExamType()` - Linha 150
- `ExamProcessingService::autoCreateParameter()` - Linha 167
- Logs em: `storage/logs/laravel.log`

**Tipos de Exames Pré-cadastrados:**
- HEMOGRAMA - Hemograma completo (HB, HT, HEM, LEUC, PLQ)
- LIPIDICO - Perfil lipídico (COL_TOTAL, HDL, LDL, VLDL, COL_NAO_HDL, TRIG)
- FUNC_RENAL - Função renal (CREAT, UREIA)
- TIREOIDE - Função tireoidiana (TSH, T4L)
- TESTOSTERONA - Testosterona (TEST_TOTAL, TEST_LIVRE, TEST_BIODIS)

**IMPORTANTE:** Mesmo que um exame não esteja pré-cadastrado, o sistema reconhece e cria automaticamente!

### Serviços Principais

- `ExamProcessingService` - Orquestra todo o processo + auto-homologação
- `PdfExtractor` - Extrai texto do PDF
- `AiLabParser` - Envia para Claude e interpreta resposta (com sistema inteligente)

### Modelos Claude API

**Modelo atual:** `claude-3-5-haiku-20241022`

**Modelos disponíveis (válidos):**
- `claude-3-5-sonnet-20241022` - Sonnet 3.5 (mais inteligente, mais caro)
- `claude-3-5-haiku-20241022` - Haiku 3.5 (rápido, econômico) ✅ EM USO
- `claude-3-haiku-20240307` - Haiku 3 (versão antiga)

**ATENÇÃO:** O nome do modelo deve seguir exatamente este formato:
- ✅ CORRETO: `claude-3-5-haiku-20241022`
- ❌ ERRADO: `claude-haiku-3-5-20241022`

Configurado em: `app/Services/AiLabParser.php:11`

### Prompt Inteligente da IA

A IA foi instruída para:
1. **Reconhecer exames conhecidos** - Usar códigos pré-definidos (HEMOGRAMA, LIPIDICO, etc)
2. **Criar códigos para exames novos** - Se encontrar "Glicemia", cria código "GLICEMIA"
3. **Normalizar códigos** - MAIÚSCULAS, underscore ao invés de espaços
4. **Extrair TUDO** - Nunca ignorar parâmetros, extrair todos os valores encontrados

**Exemplos de normalização:**
- "Vitamina D" → `VIT_D`
- "Hemoglobina Glicada" → `HB_GLICADA`
- "Ácido Úrico" → `AC_URICO`
- "PCR (Proteína C Reativa)" → `PCR`

Configurado em: `app/Services/AiLabParser.php:94-124`

### Extração Automática de Laboratório

**IMPORTANTE:** O sistema NÃO requer seleção manual de laboratório!

**Como funciona:**
1. IA extrai o nome do laboratório diretamente do cabeçalho do PDF
2. Sistema busca laboratório existente (case-insensitive)
3. Se não existir, cria automaticamente
4. Laboratórios reconhecidos: Lab Max, LabMax, Bioprev, Lab São Francisco, Biofox, Fleury, Delboni, etc.

**Implementação:**
- `AiLabParser::parseExamText()` - Retorna `laboratory_name` no JSON
- `ExamProcessingService::findOrCreateLaboratory()` - Busca/cria laboratório
- Fallback: "Laboratório Desconhecido" se não conseguir identificar

**Configurado em:**
- `app/Services/AiLabParser.php:118-123` (instruções para IA)
- `app/Services/ExamProcessingService.php:71-100` (lógica de criação)

### Títulos Automáticos de Exames

**Sistema gera títulos descritivos automaticamente:**

**Formato:** `"Tipo(s) - Laboratório - Data"`

**Exemplos:**
- 1 tipo: `"Hemograma - Lab Max - 01/12/2025"`
- 2-3 tipos: `"Hemograma + Lipídico - Bioprev - 15/11/2025"`
- 4+ tipos: `"Exame Completo - Lab São Francisco - 20/10/2025"`

**Campo:** `exams.title` (string, nullable)

**Implementação:**
- `ExamProcessingService::generateExamTitle()` - Gera título automaticamente
- Considera todos os `exam_type_code` encontrados no PDF
- Converte códigos para nomes legíveis
- Formata data em dd/mm/yyyy

**Configurado em:** `app/Services/ExamProcessingService.php:163-195`

## 📊 Sistema de Gráficos

### Biblioteca Recharts

**Instalado:** `recharts@3.5.1` (via pnpm)

**Componente reutilizável:** `resources/js/components/charts/parameter-history-chart.tsx`

**Recursos:**
- Gráfico de linha responsivo
- Linhas de referência (min/max) em vermelho tracejado
- Cores dinâmicas baseadas no status
- Tooltips informativos
- Estatísticas: último valor, média, total de exames
- Suporte a dark mode

**Uso:**
```tsx
import ParameterHistoryChart from '@/components/charts/parameter-history-chart';

<ParameterHistoryChart
    data={historyData}
    parameterName="Hemoglobina"
/>
```

### API de Histórico

**Endpoint:** `GET /exams/history/{parameterCode}`

**Controller:** `ExamController::history($parameterCode)`

**Retorna:** Array de objetos com:
```json
{
  "date": "2025-01-15",
  "value": 14.5,
  "unit": "g/dL",
  "status": "normal",
  "reference_min": 12.0,
  "reference_max": 16.0
}
```

**Implementação:**
- Filtra por `auth()->id()` automaticamente
- Ordena por `collection_date` ASC
- Busca apenas resultados do parâmetro específico
- Cache no frontend para melhor performance

### Integração em Páginas

**Páginas com gráficos:**
1. `resources/js/pages/exams/show.tsx` - Detalhes do exame
2. `resources/js/pages/abnormal-results.tsx` - Resultados anormais

**Padrão de implementação:**
```tsx
// Estado
const [expandedParameter, setExpandedParameter] = useState<string | null>(null);
const [historyData, setHistoryData] = useState<Record<string, HistoryDataPoint[]>>({});
const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});

// Função de toggle
const toggleHistory = async (parameterCode: string) => {
    if (expandedParameter === parameterCode) {
        setExpandedParameter(null);
        return;
    }

    if (!historyData[parameterCode]) {
        setLoadingHistory({ ...loadingHistory, [parameterCode]: true });
        const response = await axios.get(`/exams/history/${parameterCode}`);
        setHistoryData({ ...historyData, [parameterCode]: response.data });
        setLoadingHistory({ ...loadingHistory, [parameterCode]: false });
    }

    setExpandedParameter(parameterCode);
};
```

## 🔌 HTTP Client (Axios)

### Configuração

**Instalado:** `axios@1.13.2` (via pnpm)

**Instância configurada:** `resources/js/lib/axios.ts`

**Features:**
- CSRF token automático (`withXSRFToken: true`)
- Credentials incluídos (`withCredentials: true`)
- Headers padrão Laravel (`X-Requested-With`)
- Base URL configurada

**Uso:**
```tsx
import axios from '@/lib/axios';

// Faz requisição com autenticação automática
const response = await axios.get('/exams/history/HB');
```

**❌ NÃO use:**
```tsx
import axios from 'axios'; // ERRADO - sem configuração
```

**✅ USE:**
```tsx
import axios from '@/lib/axios'; // CORRETO - instância configurada
```

### Path Aliases

**Configurado em:**
- `tsconfig.json` - TypeScript
- `vite.config.ts` - Vite bundler

**Alias disponível:**
```tsx
// SEMPRE use @ para imports
import axios from '@/lib/axios';
import ParameterHistoryChart from '@/components/charts/parameter-history-chart';
import AppLayout from '@/layouts/app-layout';
```

## 📋 Página de Resultados Anormais

### Rota e Controller

**URL:** `/abnormal-results`
**Nome:** `abnormal-results`
**Controller:** `DashboardController::abnormalResults()`

### Lógica de Filtro

**IMPORTANTE:** Mostra apenas parâmetros cujo **último exame** está anormal.

**Como funciona:**
1. Busca TODOS os resultados do usuário
2. Agrupa por `exam_parameter_id`
3. Para cada parâmetro, pega o resultado do **último exame** (data mais recente)
4. Filtra: só mostra se o último exame estiver anormal (`low`, `high`, `critical`)

**Exemplo:**
- Colesterol LDL:
  - 01/07: 93 (low) ← Exame antigo
  - 10/09: 97 (normal) ← **Último exame**
  - **Resultado:** NÃO aparece (último está normal)

- Triglicerídeos:
  - 01/07: 188 (high) ← Exame antigo
  - 10/09: 200 (high) ← **Último exame**
  - **Resultado:** APARECE (último está anormal)

**Configurado em:** `app/Http/Controllers/DashboardController.php:76-117`

### Features da Página

- ✅ Sem repetição (cada parâmetro aparece 1 vez)
- ✅ Botão "📈 Ver Histórico" (gráfico inline)
- ✅ Botão "Ver Exame" (navega para exame completo)
- ✅ Cache de dados do histórico
- ✅ Loading states
- ✅ Estado vazio amigável

### Integração na Dashboard

**Card clicável:**
```tsx
<Link href="/abnormal-results" className="...">
    <div>
        <p>Resultados Anormais</p>
        <p>{stats?.abnormal_results || 0}</p>
    </div>
    <span>→</span>
</Link>
```

## 🚫 O Que NÃO Fazer

### ❌ Nunca Faça

1. **NÃO** criar referências a `Patient` model (não existe mais)
2. **NÃO** usar `patient_id` em exames (usar `user_id`)
3. **NÃO** usar case-sensitive em `Inertia::render()`
4. **NÃO** esquecer valores padrão em props de arrays
5. **NÃO** criar páginas admin sem verificar role
6. **NÃO** usar `git push --force` ou comandos destrutivos
7. **NÃO** fazer `.map()` sem verificar se array existe
8. **NÃO** usar `route()` no frontend (Ziggy não instalado - use URLs diretas)
9. **NÃO** importar `axios` direto - use `@/lib/axios`
10. **NÃO** colocar rotas específicas DEPOIS de `Route::resource()` (elas nunca serão alcançadas)

### ✅ Sempre Faça

1. **SEMPRE** use `auth()->id()` para pegar usuário atual
2. **SEMPRE** verifique permissões com policies
3. **SEMPRE** adicione valores padrão em props
4. **SEMPRE** use optional chaining (`?.`) para objetos opcionais
5. **SEMPRE** use lowercase em nomes de páginas Inertia
6. **SEMPRE** leia arquivos antes de editar (use Read tool)
7. **SEMPRE** use transações DB para operações críticas
8. **SEMPRE** adicione `birth_date` e `gender` ao criar usuários (evita erros em ReferenceValue)
9. **SEMPRE** use `updateOrCreate()` para evitar erros de constraint em campos únicos
10. **SEMPRE** use `import axios from '@/lib/axios'` (instância configurada)
11. **SEMPRE** coloque rotas específicas ANTES de `Route::resource()`
12. **SEMPRE** use componentes reutilizáveis quando disponíveis (`ParameterHistoryChart`)

## 📝 Padrões de Código

### Controllers

**Base Controller** - Padrão Laravel 11 (simples e vazio):

```php
// app/Http/Controllers/Controller.php
abstract class Controller
{
    //
}
```

**Controllers que precisam de autorização** devem adicionar a trait:

```php
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ExamController extends Controller
{
    use AuthorizesRequests; // Adicionar se usar $this->authorize()

    public function show(Exam $exam)
    {
        $this->authorize('view', $exam); // Agora funciona!
        return Inertia::render('exams/show', ['exam' => $exam]);
    }
}
```

**Controllers Laravel 11 com middleware** usam `HasMiddleware`:

```php
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TwoFactorController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [new Middleware('password.confirm', only: ['show'])];
    }
}
```

**Exemplo completo:**

```php
// SEMPRE filtre por usuário autenticado
public function index()
{
    $exams = Exam::where('user_id', auth()->id())
        ->latest('collection_date')
        ->get();
}
```

### Components React

```tsx
// SEMPRE use valores padrão
interface Props {
    items?: Item[];
    stats?: Stats;
}

export default function Component({ items = [], stats }: Props) {
    return (
        <div>
            {items.length > 0 && items.map(...)}
            {stats?.total || 0}
        </div>
    );
}
```

### Forms

```tsx
// SEMPRE use useForm do Inertia
const { data, setData, post, processing, errors } = useForm({
    field: '',
});

const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/exams');  // Use URL direta (NÃO use route())
};

// Para PUT/PATCH/DELETE
const handleUpdate = () => {
    put(`/admin/users/${userId}`);
};

const handleDelete = () => {
    router.delete(`/admin/users/${userId}`);
};
```

## 🔧 Comandos Úteis

### Gerenciador de Pacotes

**IMPORTANTE:** Este projeto usa **pnpm** (não npm)

```bash
# ✅ CORRETO
pnpm install
pnpm add recharts
pnpm run dev
pnpm run build

# ❌ ERRADO
npm install
npm add recharts
```

### Frontend

```bash
pnpm run dev          # Desenvolvimento
pnpm run build        # Build produção
```

### Backend

```bash
php artisan serve    # Servidor local
php artisan migrate:fresh --seed  # Reset database
php artisan tinker   # Console interativo
php artisan route:list  # Listar todas as rotas
php artisan route:clear  # Limpar cache de rotas

# Criar usuário admin via tinker
$user = User::find(1);
$user->assignRole('admin');
```

## 📊 Estrutura de Diretórios

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/          # Controllers admin
│   │   ├── DashboardController.php
│   │   └── ExamController.php
│   └── Middleware/
│       └── HandleInertiaRequests.php  # Compartilha roles
├── Models/
│   ├── User.php           # HasRoles trait
│   ├── Exam.php           # user_id (não patient_id)
│   └── ...
├── Policies/
│   └── ExamPolicy.php     # Verifica user_id
└── Services/
    ├── ExamProcessingService.php
    ├── PdfExtractor.php
    └── AiLabParser.php

resources/js/
├── components/
│   ├── ui/               # Shadcn components
│   ├── charts/           # Componentes de gráficos
│   │   └── parameter-history-chart.tsx
│   ├── admin-sidebar.tsx
│   └── app-sidebar.tsx
├── lib/
│   └── axios.ts          # Instância Axios configurada
├── layouts/
│   ├── admin-layout.tsx
│   └── app-layout.tsx
└── pages/
    ├── admin/           # Páginas admin
    │   ├── dashboard.tsx
    │   ├── users/
    │   ├── laboratories/
    │   └── exam-types/
    ├── exams/
    │   ├── index.tsx    # Lista de exames
    │   ├── create.tsx   # Upload de PDF
    │   └── show.tsx     # Detalhes com gráficos
    ├── abnormal-results.tsx  # Resultados anormais
    └── dashboard.tsx    # Dashboard paciente
```

## 🎯 Fluxo Típico de Trabalho

### Criar nova funcionalidade

1. Criar migration (se necessário)
2. Atualizar/criar Model com relationships
3. Criar/atualizar Policy
4. Criar Controller (verificar auth e permissions)
5. Adicionar rotas em `web.php`
6. Criar página React em `resources/js/pages/`
7. Testar com usuário admin E paciente

### Debugging

- Logs: `storage/logs/laravel.log`
- Frontend errors: Browser console
- Backend errors: Terminal rodando `php artisan serve`
- DB queries: `DB::enableQueryLog()` + `DB::getQueryLog()`

## 🔍 Referências Rápidas

**Verificar role do usuário logado:**
```tsx
// Frontend (compartilhado via Inertia)
const { auth } = usePage().props;
const isAdmin = auth.roles?.includes('admin');
```

**Criar exame para usuário atual:**
```php
Exam::create([
    'user_id' => auth()->id(),  // NÃO usar patient_id
    'laboratory_id' => $laboratoryId,
    // ...
]);
```

**Filtrar dados do usuário:**
```php
// SEMPRE filtrar por auth()->id()
$exams = Exam::where('user_id', auth()->id())->get();
```

---

## 📌 Notas Importantes

- Custo estimado IA: ~R$ 0.005-0.015 por exame processado (varia com tamanho do PDF)
- Sistema preparado para SaaS (multi-tenant)
- Soft deletes ativado em models principais
- Validação de PDFs: máximo 10MB
- Formato de datas: 'Y-m-d' no banco, formatado no frontend
- Suporta PDFs com múltiplas páginas (extrai página por página)
- Logs detalhados em `storage/logs/laravel.log`

---

**Última atualização:** 2025-12-02
**Versão Laravel:** 11
**Versão PHP:** 8.3
**Versão Node:** >= 18
**Dependências Frontend:**
- React + TypeScript + Inertia.js
- Recharts 3.5.1 (gráficos)
- Axios 1.13.2 (HTTP client)
- Shadcn/ui + Tailwind CSS
