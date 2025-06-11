-- Script para inserir funcionários de teste
USE pizzariagraff;

-- Verificar se há alguma cidade para usar como FK
SELECT id, nome FROM cidade LIMIT 5;

-- Inserir funcionários de teste (ajustar cidade_id conforme necessário)
INSERT INTO funcionario (
    funcionario, apelido, telefone, email, endereco, numero, complemento, bairro, cep,
    cidade_id, data_admissao, rg_inscricao_estadual, cnh, sexo, observacao, estado_civil,
    salario, nacionalidade_id, data_nascimento, cpf_cpnj, ativo, data_criacao, data_alteracao
) VALUES 
(
    'João Silva Santos', 'João', '11999999999', 'joao@email.com', 'Rua das Flores', '123', 
    'Apto 45', 'Centro', '01234567', 1, '2024-01-15', '123456789', '12345678901', 1, 
    'Funcionário modelo', 2, 3500, 1, '1990-05-15', '12345678901', true, NOW(), NOW()
),
(
    'Maria Oliveira Costa', 'Maria', '11888888888', 'maria@email.com', 'Av. Paulista', '456',
    '', 'Bela Vista', '01987654', 1, '2024-02-01', '987654321', '', 2,
    'Excelente funcionária', 1, 4200, 1, '1985-12-03', '98765432100', true, NOW(), NOW()
),
(
    'Pedro Almeida', 'Pedro', '11777777777', 'pedro@email.com', 'Rua da Paz', '789',
    'Casa', 'Vila Nova', '02468135', 1, '2024-03-10', '555666777', '55566677788', 1,
    'Funcionário dedicado', 1, 2800, 1, '1992-08-20', '55566677788', true, NOW(), NOW()
);

-- Verificar os dados inseridos
SELECT id, funcionario, email, data_nascimento, ativo FROM funcionario; 