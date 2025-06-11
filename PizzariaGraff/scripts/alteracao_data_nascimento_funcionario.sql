-- Script para alterar o campo data_nascimento de int para date na tabela funcionario
-- Executar no banco de dados MariaDB/MySQL

USE pizzariagraff;

-- Passo 1: Adicionar nova coluna temporária do tipo date
ALTER TABLE funcionario 
ADD COLUMN data_nascimento_temp DATE NULL;

-- Passo 2: Migrar dados existentes (assumindo que o int representa o ano de nascimento)
-- Converte o ano para uma data (1º de janeiro do ano informado)
UPDATE funcionario 
SET data_nascimento_temp = CASE 
    WHEN data_nascimento IS NOT NULL AND data_nascimento > 1900 AND data_nascimento <= YEAR(CURDATE())
    THEN DATE(CONCAT(data_nascimento, '-01-01'))
    ELSE NULL
END;

-- Passo 3: Remover a coluna antiga
ALTER TABLE funcionario 
DROP COLUMN data_nascimento;

-- Passo 4: Renomear a nova coluna
ALTER TABLE funcionario 
CHANGE COLUMN data_nascimento_temp data_nascimento DATE NULL;

-- Verificar os dados migrados
SELECT id, funcionario, data_nascimento 
FROM funcionario 
WHERE data_nascimento IS NOT NULL 
LIMIT 10;

-- Script executado com sucesso!
-- O campo data_nascimento agora é do tipo DATE 