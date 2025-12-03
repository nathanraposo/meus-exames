# Meus Exames - Sistema de Gerenciamento de Exames de Sangue

Sistema para unificar exames de sangue de múltiplos laboratórios, com parsing automático via IA (Claude) e histórico com gráficos de evolução.

## 🎯 Problema Resolvido

- **SUS = Múltiplos Laboratórios**: Cada exame em um laboratório diferente, sem histórico unificado
- **PDFs = Trabalho manual**: Digitação de valores, difícil de comparar
- **Sem histórico visual**: Impossível ver tendências (colesterol, hemoglobina, etc)

## ✨ Solução

1. **Upload de PDF** → Sistema extrai automaticamente
2. **IA processa** → Claude identifica todos os valores
3. **Histórico centralizado** → Todos exames em um só lugar
4. **Gráficos de evolução** → Veja tendências ao longo do tempo
5. **Alertas** → Valores fora da referência destacados

## 🏗️ Stack Técnica

- **Backend**: Laravel 11 + PHP 8.3
- **Frontend**: React + Inertia.js + TypeScript
- **Database**: SQLite (dev) / MySQL (prod)
- **IA**: Claude API (Haiku 3.5) - ~R$ 0,005/exame
- **PDF**: smalot/pdfparser

## 📊 Banco de Dados

7 tabelas implementadas com relacionamentos completos:

- `laboratories` - Laboratórios cadastrados
- `patients` - Pacientes vinculados a usuários
- `exam_types` - Tipos de exames (Hemograma, Colesterol, etc)
- `exam_parameters` - Parâmetros de cada tipo
- `exams` - Exames realizados
- `exam_results` - Resultados de cada parâmetro
- `reference_values` - Valores de referência (por sexo/idade/lab)

Veja diagrama completo em: [`database/DATABASE_STRUCTURE.md`](database/DATABASE_STRUCTURE.md)

## 🚀 Quick Start

### 1. Instalar dependências

```bash
composer install
npm install
```

### 2. Configurar ambiente

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Configurar API Key da Anthropic

Edite `.env` e adicione na linha 67:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### 4. Configurar banco e popular

```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
```

### 5. Rodar aplicação

```bash
# Terminal 1
npm run dev

# Terminal 2
php artisan serve
```

Acesse: http://localhost:8000

## 📁 Estrutura do Projeto

```
app/
├── Models/              # 7 models com relacionamentos
├── Http/Controllers/    # 3 controllers (Patient, Exam, Dashboard)
├── Policies/           # Autorização (Patient, Exam)
└── Services/           # Lógica de negócio
    ├── PdfExtractor.php          # Extrai texto de PDFs
    ├── AiLabParser.php           # Parser com Claude API
    └── ExamProcessingService.php # Orquestra upload → parsing → save

database/
├── migrations/         # 7 migrations
└── seeders/           # LaboratorySeeder, ExamTypeSeeder

resources/js/
├── pages/
│   ├── dashboard.tsx
│   ├── exams/
│   │   ├── index.tsx   # Listagem
│   │   ├── create.tsx  # Upload
│   │   └── show.tsx    # Detalhes (TO DO)
│   └── patients/       # CRUD (TO DO)
└── components/         # Componentes reutilizáveis
```

## 🧪 Exames Suportados

Seeders já incluem:

1. **Hemograma Completo**: Hemoglobina, Hematócrito, Hemácias, Leucócitos, Plaquetas
2. **Perfil Lipídico**: Colesterol (Total, HDL, LDL, VLDL), Triglicerídeos
3. **Função Renal**: Creatinina, Ureia
4. **Função Tireoidiana**: TSH, T4 Livre
5. **Testosterona**: Testosterona Total

## 💡 Fluxo de Uso

1. **Login** (Laravel Fortify)
2. **Criar paciente** (nome, data nascimento, sexo, etc)
3. **Upload de PDF**
   - Selecionar paciente
   - Selecionar laboratório (LabMax, SUS, Santa Casa, etc)
   - Upload do arquivo
4. **Sistema processa** (~10-30 segundos)
   - Extrai texto
   - Envia para Claude
   - Salva resultados
   - Compara com valores de referência
5. **Visualizar resultados**
   - Tabela com todos parâmetros
   - Status colorido (normal/baixo/alto)
   - Gráficos de evolução

## 🔧 Comandos Úteis

```bash
# Popular banco com dados de teste
php artisan db:seed

# Ver rotas disponíveis
php artisan route:list

# Testar via Tinker
php artisan tinker

# Limpar cache
php artisan optimize:clear
```

## 💰 Custo de IA

**Claude Haiku 3.5:**
- ~2000 tokens input (PDF 7 páginas)
- ~1000 tokens output (JSON)
- **Custo: ~R$ 0,005 por exame**

Exemplo: 20 exames/mês = ~R$ 0,10/mês

## 📋 Status da Implementação

### ✅ Completo

- [x] Database (7 tabelas)
- [x] Models com relacionamentos
- [x] Seeders (4 labs, 5 tipos de exames)
- [x] Services (PdfExtractor, AiLabParser, ExamProcessing)
- [x] Controllers (Patient, Exam, Dashboard)
- [x] Policies de autorização
- [x] Rotas configuradas
- [x] Páginas React básicas (upload, listagem)

### ⏳ To Do (para MVP completo)

- [ ] Página de detalhes do exame (`exams/show.tsx`)
- [ ] CRUD de pacientes (`patients/*.tsx`)
- [ ] Dashboard com estatísticas (`dashboard.tsx`)
- [ ] Componente de gráfico (`ParameterChart.tsx`)
- [ ] Testes unitários
- [ ] Parser regex para LabMax (opcional)

## 🐛 Troubleshooting

**Erro: "ANTHROPIC_API_KEY not set"**
→ Configure a chave no `.env`

**Erro ao fazer upload**
→ Execute: `php artisan storage:link`
→ Verifique permissões em `storage/app/public`

**Timeout no parsing**
→ Aumentar timeout em `config/database.php`
→ PDFs muito grandes podem demorar

**Valores não identificados**
→ IA pode não reconhecer formatos desconhecidos
→ Veja logs em `storage/logs/laravel.log`

## 📚 Documentação Adicional

- [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) - Resumo completo do que foi implementado
- [`SETUP.md`](SETUP.md) - Guia de setup rápido
- [`database/DATABASE_STRUCTURE.md`](database/DATABASE_STRUCTURE.md) - Diagrama ER e queries

## 🎯 Roadmap

**Fase 1 (MVP)** - Uso pessoal
- ✅ Backend completo
- ⏳ Frontend básico
- ⏳ Gráficos de evolução

**Fase 2** - Validação
- [ ] Compartilhar com 5-10 amigos do SUS
- [ ] Coletar feedback
- [ ] Parser regex LabMax (economia de IA)

**Fase 3** - SaaS (futuro)
- [ ] Multi-tenancy
- [ ] Sistema de assinatura
- [ ] Suporte a mais laboratórios
- [ ] Exportar PDF com histórico
- [ ] Compartilhar com médico

## 📄 Licença

Uso pessoal. Transformar em SaaS futuramente.

---

**Desenvolvido para resolver o problema real de gerenciar exames do SUS em múltiplos laboratórios.**
