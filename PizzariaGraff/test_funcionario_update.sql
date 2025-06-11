-- Teste direto no banco para verificar o problema

-- 1. Verificar se funcionário ID 12 existe
SELECT id, funcionario, email FROM funcionario WHERE id = 12;

-- 2. Verificar se cidade ID 7 existe
SELECT id, nome FROM cidade WHERE id = 7;

-- 3. Verificar se nacionalidade ID 1 existe
SELECT id, nacionalidade FROM pais WHERE id = 1;

-- 4. Verificar se função ID 9 existe
SELECT id, descricao FROM funcao_funcionario WHERE id = 9;

-- 5. Testar UPDATE manual (igual ao do repository)
UPDATE funcionario SET 
    funcionario = 'Ana Paula Tannouri de Oliveira - TESTE DEBUG', 
    apelido = 'Ana Paula', 
    telefone = '45991552218',
    email = 'ana.tannouri.updated@gmail.com', 
    endereco = 'Rua Índia Atualizada', 
    numero = '152', 
    complemento = 'Casa A', 
    bairro = 'Campos do Iguaçu', 
    cep = '85857521', 
    cidade_id = 7, 
    data_admissao = '2024-01-15', 
    data_demissao = NULL, 
    rg_inscricao_estadual = '110089326', 
    cnh = '98765432109', 
    data_validade_cnh = '2027-12-31', 
    sexo = 2, 
    observacao = 'Funcionária atualizada com nova data de nascimento', 
    estado_civil = 2, 
    salario = 5500, 
    nacionalidade_id = 1, 
    data_nascimento = '1985-08-22', 
    funcao_funcionario_id = 9, 
    cpf_cpnj = '98765432109', 
    ativo = true, 
    data_alteracao = NOW() 
WHERE id = 12;

-- 6. Verificar se o update funcionou
SELECT ROW_COUNT() as 'Linhas Afetadas';

-- 7. Verificar dados após update
SELECT id, funcionario, email, ativo, data_alteracao FROM funcionario WHERE id = 12; 