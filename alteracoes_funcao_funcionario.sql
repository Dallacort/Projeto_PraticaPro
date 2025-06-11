-- Script para alterar a tabela funcao_funcionario
-- Execute estes comandos no seu banco de dados PostgreSQL

-- 1. Adicionar campo funcaoFuncionario (nome da função)
ALTER TABLE funcao_funcionario ADD COLUMN funcao_funcionario VARCHAR(255);

-- 2. Adicionar campo requerCNH (boolean)
ALTER TABLE funcao_funcionario ADD COLUMN requer_cnh BOOLEAN DEFAULT FALSE;

-- 3. Adicionar campo cargaHoraria (numeric)
ALTER TABLE funcao_funcionario ADD COLUMN carga_horaria NUMERIC(10,2);

-- 4. Adicionar campo observacao (varchar)
ALTER TABLE funcao_funcionario ADD COLUMN observacao VARCHAR(255);

-- 5. Adicionar campo situacao (date)
ALTER TABLE funcao_funcionario ADD COLUMN situacao DATE;

-- 6. Renomear campo dataCadastro para data_criacao (se necessário)
-- ALTER TABLE funcao_funcionario RENAME COLUMN data_cadastro TO data_criacao;

-- 7. Renomear campo ultimaModificacao para data_alteracao (se necessário)  
-- ALTER TABLE funcao_funcionario RENAME COLUMN ultima_modificacao TO data_alteracao;

-- 8. Atualizar registros existentes com valores padrão
UPDATE funcao_funcionario SET 
    funcao_funcionario = COALESCE(descricao, 'Função não definida'),
    requer_cnh = FALSE,
    carga_horaria = 40.00,
    situacao = CURRENT_DATE
WHERE funcao_funcionario IS NULL;

-- 9. Opcional: Tornar alguns campos obrigatórios
-- ALTER TABLE funcao_funcionario ALTER COLUMN funcao_funcionario SET NOT NULL;
-- ALTER TABLE funcao_funcionario ALTER COLUMN carga_horaria SET NOT NULL;

COMMIT; 