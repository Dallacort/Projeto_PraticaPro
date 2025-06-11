-- Script para alterar a tabela funcionario
-- Execute estes comandos no seu banco de dados MariaDB

-- 1. Remover a coluna situacao (não é mais necessária)
ALTER TABLE funcionario DROP COLUMN situacao;

-- 2. Renomear nacionalidade para nacionalidade_id (preparar para FK)
ALTER TABLE funcionario CHANGE COLUMN nacionalidade nacionalidade_id BIGINT(20);

-- 3. Adicionar a constraint de foreign key para a tabela pais
ALTER TABLE funcionario 
ADD CONSTRAINT fk_funcionario_nacionalidade 
FOREIGN KEY (nacionalidade_id) REFERENCES pais(id);

-- 4. Adicionar índice para melhor performance
CREATE INDEX idx_funcionario_nacionalidade ON funcionario(nacionalidade_id);

-- 5. Atualizar registros existentes com nacionalidade padrão (Brasil = 1, ajuste conforme seus dados)
UPDATE funcionario SET nacionalidade_id = 1 WHERE nacionalidade_id IS NULL;

-- 6. Adicionar campo ativo se não existir (para padronização)
ALTER TABLE funcionario ADD COLUMN ativo BOOLEAN DEFAULT TRUE;

COMMIT; 