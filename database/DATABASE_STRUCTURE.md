# Estrutura do Banco de Dados - Sistema de Gerenciamento de Exames de Sangue

## Diagrama de Relacionamento de Entidades (ER)

```
┌─────────────────────┐
│     USERS           │
│─────────────────────│
│ id                  │
│ name                │
│ email               │
│ password            │
│ ...                 │
└──────────┬──────────┘
           │
           │ 1:N (opcional)
           │
┌──────────▼──────────┐         ┌─────────────────────┐
│     PATIENTS        │         │   LABORATORIES      │
│─────────────────────│         │─────────────────────│
│ id                  │         │ id                  │
│ user_id (FK)        │         │ name                │
│ name                │         │ cnpj                │
│ cpf                 │         │ email               │
│ birth_date          │         │ phone               │
│ gender              │         │ address             │
│ email               │         │ city                │
│ phone               │         │ state               │
│ address             │         │ zip_code            │
│ blood_type          │         │ website             │
│ medical_conditions  │         │ active              │
│ allergies           │         │ created_at          │
│ medications         │         │ updated_at          │
│ created_at          │         │ deleted_at          │
│ updated_at          │         └──────────┬──────────┘
│ deleted_at          │                    │
└──────────┬──────────┘                    │
           │                               │
           │ 1:N                           │ 1:N
           │                               │
           │         ┌─────────────────────┼──────────────┐
           │         │                     │              │
           │         │                     │              │ 1:N
┌──────────▼─────────▼─────┐      ┌────────▼──────────┐  │
│       EXAMS              │      │   EXAM_TYPES      │  │
│──────────────────────────│      │───────────────────│  │
│ id                       │      │ id                │  │
│ patient_id (FK)          │      │ name              │  │
│ exam_type_id (FK)        │◄─────┤ code              │  │
│ laboratory_id (FK)       │ N:1  │ description       │  │
│ protocol_number          │      │ category          │  │
│ collection_date          │      │ preparation_time  │  │
│ collection_time          │      │ preparation_ins   │  │
│ result_date              │      │ requires_fasting  │  │
│ result_time              │      │ active            │  │
│ status                   │      │ created_at        │  │
│ notes                    │      │ updated_at        │  │
│ file_path                │      │ deleted_at        │  │
│ requesting_doctor        │      └────────┬──────────┘  │
│ crm_doctor               │               │             │
│ created_at               │               │ 1:N         │
│ updated_at               │               │             │
│ deleted_at               │               │             │
└──────────┬───────────────┘               │             │
           │                               │             │
           │ 1:N                           │             │
           │                   ┌───────────▼─────────────▼───┐
┌──────────▼───────────────┐   │   EXAM_PARAMETERS           │
│    EXAM_RESULTS          │   │─────────────────────────────│
│──────────────────────────│   │ id                          │
│ id                       │   │ exam_type_id (FK)           │
│ exam_id (FK)             │   │ name                        │
│ exam_parameter_id (FK)   │◄──┤ code                        │
│ numeric_value            │N:1│ description                 │
│ text_value               │   │ unit                        │
│ boolean_value            │   │ data_type                   │
│ reference_min            │   │ decimal_places              │
│ reference_max            │   │ display_order               │
│ status                   │   │ active                      │
│ observation              │   │ created_at                  │
│ created_at               │   │ updated_at                  │
│ updated_at               │   │ deleted_at                  │
└──────────────────────────┘   └──────────┬──────────────────┘
                                          │
                                          │ 1:N
                                          │
                               ┌──────────▼──────────────────┐
                               │   REFERENCE_VALUES          │
                               │─────────────────────────────│
                               │ id                          │
                               │ exam_parameter_id (FK)      │
                               │ laboratory_id (FK) nullable │
                               │ gender                      │
                               │ age_min                     │
                               │ age_max                     │
                               │ min_value                   │
                               │ max_value                   │
                               │ optimal_min                 │
                               │ optimal_max                 │
                               │ text_reference              │
                               │ condition_description       │
                               │ is_default                  │
                               │ created_at                  │
                               │ updated_at                  │
                               │ deleted_at                  │
                               └─────────────────────────────┘
```

## Descrição das Tabelas

### 1. LABORATORIES (Laboratórios)
Armazena informações sobre os laboratórios que realizam os exames.

**Campos principais:**
- `name`: Nome do laboratório
- `cnpj`: CNPJ do laboratório (único)
- `email`, `phone`: Contato
- `address`, `city`, `state`, `zip_code`: Endereço completo
- `website`: Site do laboratório
- `active`: Status do laboratório

### 2. PATIENTS (Pacientes)
Armazena dados dos pacientes que realizam exames.

**Campos principais:**
- `user_id`: Relacionamento opcional com a tabela de usuários
- `name`: Nome completo
- `cpf`: CPF do paciente (único)
- `birth_date`: Data de nascimento
- `gender`: Sexo (male, female, other)
- `blood_type`: Tipo sanguíneo
- `medical_conditions`: Condições médicas relevantes
- `allergies`: Alergias
- `medications`: Medicamentos em uso

### 3. EXAM_TYPES (Tipos de Exames)
Define os diferentes tipos de exames disponíveis (hemograma, glicemia, etc).

**Campos principais:**
- `name`: Nome do exame (ex: "Hemograma Completo")
- `code`: Código único do exame
- `description`: Descrição detalhada
- `category`: Categoria do exame
- `preparation_time_hours`: Tempo de preparação necessário
- `preparation_instructions`: Instruções de preparo
- `requires_fasting`: Se requer jejum

### 4. EXAM_PARAMETERS (Parâmetros de Exames)
Define os parâmetros medidos em cada tipo de exame.

**Campos principais:**
- `exam_type_id`: Tipo de exame ao qual pertence
- `name`: Nome do parâmetro (ex: "Hemoglobina", "Leucócitos")
- `code`: Código do parâmetro
- `unit`: Unidade de medida (mg/dL, g/dL, etc)
- `data_type`: Tipo de dado (numeric, text, boolean)
- `decimal_places`: Casas decimais para valores numéricos
- `display_order`: Ordem de exibição

### 5. EXAMS (Exames)
Representa cada exame realizado por um paciente.

**Campos principais:**
- `patient_id`: Paciente que realizou o exame
- `exam_type_id`: Tipo de exame realizado
- `laboratory_id`: Laboratório que realizou
- `protocol_number`: Número de protocolo do laboratório
- `collection_date`, `collection_time`: Data/hora da coleta
- `result_date`, `result_time`: Data/hora do resultado
- `status`: Status do exame (pending, collected, processing, completed, cancelled)
- `file_path`: Caminho do arquivo PDF do resultado
- `requesting_doctor`: Médico solicitante
- `crm_doctor`: CRM do médico

### 6. EXAM_RESULTS (Resultados de Exames)
Armazena os valores obtidos para cada parâmetro de cada exame.

**Campos principais:**
- `exam_id`: Exame ao qual pertence
- `exam_parameter_id`: Parâmetro medido
- `numeric_value`: Valor numérico (se aplicável)
- `text_value`: Valor textual (se aplicável)
- `boolean_value`: Valor booleano (se aplicável)
- `reference_min`, `reference_max`: Valores de referência aplicados
- `status`: Status do resultado (normal, low, high, critical)
- `observation`: Observações sobre o resultado

### 7. REFERENCE_VALUES (Valores de Referência)
Define os valores de referência para cada parâmetro, podendo variar por sexo, idade e laboratório.

**Campos principais:**
- `exam_parameter_id`: Parâmetro ao qual se refere
- `laboratory_id`: Laboratório específico (opcional)
- `gender`: Sexo (male, female, other, all)
- `age_min`, `age_max`: Faixa etária
- `min_value`, `max_value`: Valores mínimo e máximo
- `optimal_min`, `optimal_max`: Valores ideais
- `text_reference`: Referência textual (para parâmetros não-numéricos)
- `is_default`: Se é o valor padrão

## Relacionamentos

1. **USERS → PATIENTS**: Um usuário pode ter um ou mais registros de paciente (1:N opcional)
2. **PATIENTS → EXAMS**: Um paciente pode ter múltiplos exames (1:N)
3. **LABORATORIES → EXAMS**: Um laboratório pode realizar múltiplos exames (1:N)
4. **LABORATORIES → REFERENCE_VALUES**: Um laboratório pode ter valores de referência específicos (1:N)
5. **EXAM_TYPES → EXAMS**: Um tipo de exame pode ter múltiplas realizações (1:N)
6. **EXAM_TYPES → EXAM_PARAMETERS**: Um tipo de exame tem múltiplos parâmetros (1:N)
7. **EXAMS → EXAM_RESULTS**: Um exame tem múltiplos resultados (1:N)
8. **EXAM_PARAMETERS → EXAM_RESULTS**: Um parâmetro pode ter múltiplos resultados (1:N)
9. **EXAM_PARAMETERS → REFERENCE_VALUES**: Um parâmetro pode ter múltiplos valores de referência (1:N)

## Recursos Especiais

### Soft Deletes
As seguintes tabelas implementam soft deletes (não deletam permanentemente):
- laboratories
- patients
- exam_types
- exam_parameters
- exams
- reference_values

### Índices
Índices foram criados para otimizar as consultas mais comuns:
- Busca por CPF de pacientes
- Busca por número de protocolo de exames
- Busca por data de coleta e paciente
- Busca por parâmetros de exame
- Busca por status de resultados

### Suporte a Histórico
O sistema permite rastreamento completo do histórico através de:
- Timestamps (created_at, updated_at) em todas as tabelas
- Soft deletes para recuperação de dados
- Relacionamento de múltiplos exames por paciente
- Armazenamento de valores de referência históricos

### Múltiplos Laboratórios
O sistema suporta múltiplos laboratórios através de:
- Tabela dedicada de laboratórios
- Relacionamento de exames com laboratórios específicos
- Valores de referência específicos por laboratório (opcional)

## Exemplo de Uso

### Registrar um novo exame:
1. Criar/selecionar o paciente na tabela `patients`
2. Selecionar o laboratório na tabela `laboratories`
3. Selecionar o tipo de exame na tabela `exam_types`
4. Criar o registro na tabela `exams`
5. Para cada parâmetro do tipo de exame, criar um registro em `exam_results`
6. Comparar os resultados com os valores de referência apropriados da tabela `reference_values`

### Consultar histórico:
```sql
SELECT e.*, et.name as exam_type_name, l.name as laboratory_name
FROM exams e
JOIN exam_types et ON e.exam_type_id = et.id
JOIN laboratories l ON e.laboratory_id = l.id
WHERE e.patient_id = ?
ORDER BY e.collection_date DESC, e.collection_time DESC;
```

### Comparar resultados ao longo do tempo:
```sql
SELECT
    e.collection_date,
    ep.name as parameter_name,
    er.numeric_value,
    er.status
FROM exam_results er
JOIN exams e ON er.exam_id = e.id
JOIN exam_parameters ep ON er.exam_parameter_id = ep.id
WHERE e.patient_id = ?
  AND ep.code = ?
ORDER BY e.collection_date DESC;
```
