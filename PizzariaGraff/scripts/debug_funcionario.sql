-- Script de debug para funcionários
USE pizzariagraff;

-- 1. Verificar estrutura da tabela
DESCRIBE funcionario;

-- 2. Contar total de funcionários
SELECT COUNT(*) as total_funcionarios FROM funcionario;

-- 3. Listar todos os IDs existentes
SELECT id, funcionario, email, data_nascimento, ativo 
FROM funcionario 
ORDER BY id;

-- 4. Verificar se existe o ID 10
SELECT 'ID 10 existe' as resultado WHERE EXISTS (SELECT 1 FROM funcionario WHERE id = 10)
UNION ALL
SELECT 'ID 10 NÃO existe' as resultado WHERE NOT EXISTS (SELECT 1 FROM funcionario WHERE id = 10);

-- 5. Encontrar o maior ID existente
SELECT MAX(id) as maior_id FROM funcionario;

-- 6. Verificar se há dados com data_nascimento NULL após migração
SELECT id, funcionario, data_nascimento 
FROM funcionario 
WHERE data_nascimento IS NULL;

-- 7. Verificar alguns registros com data_nascimento preenchida
SELECT id, funcionario, data_nascimento 
FROM funcionario 
WHERE data_nascimento IS NOT NULL 
LIMIT 5; 