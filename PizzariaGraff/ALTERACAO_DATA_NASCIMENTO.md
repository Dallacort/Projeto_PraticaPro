# Alteração do Campo data_nascimento de INT para DATE

## Objetivo
Converter o campo `data_nascimento` da tabela `funcionario` de `int` (ano) para `date` (data completa) em todo o sistema.

## Alterações Realizadas

### 1. Banco de Dados
**Arquivo:** `scripts/alteracao_data_nascimento_funcionario.sql`
- Criou nova coluna temporária `data_nascimento_temp` do tipo DATE
- Migrou dados existentes (anos) para datas (1º de janeiro do ano informado)
- Removeu coluna antiga e renomeou a nova

### 2. Backend - Model
**Arquivo:** `src/main/java/com/example/PizzariaGraff/model/Funcionario.java`
- ✅ Alterado `private Integer dataNascimento` → `private LocalDate dataNascimento`
- ✅ Corrigido getters/setters para trabalhar com `LocalDate`
- ✅ Mantido métodos legados de compatibilidade (`getDataNascimentoAno()`)

### 3. Backend - DTO
**Arquivo:** `src/main/java/com/example/PizzariaGraff/dto/FuncionarioDTO.java`
- ✅ Alterado `private Integer dataNascimento` → `private LocalDate dataNascimento`
- ✅ Corrigido getters/setters
- ✅ Atualizado Schema annotation

### 4. Backend - Repository
**Arquivo:** `src/main/java/com/example/PizzariaGraff/repository/FuncionarioRepository.java`
- ✅ INSERT: `stmt.setDate(21, funcionario.getDataNascimento() != null ? Date.valueOf(funcionario.getDataNascimento()) : null)`
- ✅ UPDATE: `stmt.setDate(21, funcionario.getDataNascimento() != null ? Date.valueOf(funcionario.getDataNascimento()) : null)`
- ✅ Mapeamento ResultSet: `Date dataNascimento = rs.getDate("data_nascimento")` com conversão para `LocalDate`

### 5. Frontend - Types
**Arquivo:** `frontend/src/types/index.ts`
- ✅ Interface Funcionario: `dataNascimento?: string` (formato de data)

### 6. Frontend - Service
**Arquivo:** `frontend/src/services/funcionarioService.ts`
- ✅ Adaptador envia `dataNascimento` como string de data (não Number)

### 7. Frontend - Form
**Arquivo:** `frontend/src/pages/funcionario/FuncionarioForm.tsx`
- ✅ Campo input com `type="date"` 
- ✅ Payload não converte mais para Number
- ✅ Mapeamento de dados existentes corrigido

## Como Executar

### 1. Execute o script SQL
```sql
-- Execute o arquivo: scripts/alteracao_data_nascimento_funcionario.sql
-- no seu banco de dados MariaDB/MySQL
```

### 2. Reinicie a aplicação
```bash
cd PizzariaGraff
mvn clean compile
mvn spring-boot:run
```

### 3. Teste no Frontend
- Acesse o formulário de funcionários
- O campo "Data Nascimento" agora é um seletor de data
- Os dados existentes foram migrados automaticamente

## Resultado Final
- ✅ Campo `data_nascimento` agora é do tipo `DATE` no banco
- ✅ Backend trabalha com `LocalDate` 
- ✅ Frontend usa input de data nativo
- ✅ Compatibilidade mantida com dados existentes
- ✅ Migração automática de anos para datas (1º de janeiro)

## Testado
- ✅ Criação de novos funcionários
- ✅ Edição de funcionários existentes
- ✅ Migração de dados históricos 