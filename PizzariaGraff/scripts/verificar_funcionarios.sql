-- Script para verificar funcionários existentes no banco
USE pizzariagraff;

-- Verificar todos os funcionários
SELECT id, funcionario, data_nascimento, ativo 
FROM funcionario 
ORDER BY id;

-- Verificar especificamente o funcionário ID 10
SELECT * FROM funcionario WHERE id = 10;

-- Verificar a estrutura da tabela
DESCRIBE funcionario; 