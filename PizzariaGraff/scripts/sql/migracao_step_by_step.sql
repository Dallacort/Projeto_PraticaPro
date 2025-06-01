-- =============================================================================
-- MIGRAÇÃO PASSO A PASSO - PIZZARIAGRAFF
-- =============================================================================
-- Execute cada seção separadamente para controlar melhor o processo

-- =============================================================================
-- PASSO 1: BACKUP E VERIFICAÇÃO
-- =============================================================================

-- Verificar dados existentes
SELECT 'DADOS EXISTENTES:' as info;
SELECT COUNT(*) as produtos FROM produto;
SELECT COUNT(*) as fornecedores FROM fornecedores; 
SELECT COUNT(*) as marcas FROM marca;
SELECT COUNT(*) as unidades FROM unidade_medida;

-- Criar tabelas de backup (execute só se quiser backup)
-- CREATE TABLE produto_backup AS SELECT * FROM produto;
-- CREATE TABLE fornecedores_backup AS SELECT * FROM fornecedores;

-- =============================================================================
-- PASSO 2: ATUALIZAR TABELA PRODUTO (Execute linha por linha se necessário)
-- =============================================================================

-- Remover foreign key existente temporariamente
ALTER TABLE produto_fornecedor DROP FOREIGN KEY produto_fornecedor_ibfk_1;

-- Adicionar novos campos na tabela produto
ALTER TABLE produto ADD COLUMN produto_new varchar(255) AFTER id;
ALTER TABLE produto ADD COLUMN codigo_barras varchar(255) AFTER produto_new;
ALTER TABLE produto ADD COLUMN referencia varchar(10) AFTER codigo_barras;
ALTER TABLE produto ADD COLUMN marca_id bigint(20) AFTER referencia;
ALTER TABLE produto ADD COLUMN unidade_medida_id bigint(20) AFTER marca_id;
ALTER TABLE produto ADD COLUMN valor_compra decimal(10,2) AFTER unidade_medida_id;
ALTER TABLE produto ADD COLUMN valor_venda decimal(10,2) AFTER valor_compra;
ALTER TABLE produto ADD COLUMN quantidade int(11) DEFAULT 0 AFTER valor_venda;
ALTER TABLE produto ADD COLUMN quantidade_minima int(11) DEFAULT 1 AFTER quantidade;
ALTER TABLE produto ADD COLUMN percentual_lucro decimal(10,2) AFTER quantidade_minima;
ALTER TABLE produto ADD COLUMN observacoes varchar(255) AFTER descricao;
ALTER TABLE produto ADD COLUMN situacao date AFTER observacoes;

-- Migrar dados existentes
UPDATE produto SET 
    produto_new = nome,
    codigo_barras = COALESCE(codigo, CONCAT('BAR', LPAD(id, 10, '0'))),
    referencia = COALESCE(codigo, CONCAT('REF', LPAD(id, 7, '0'))),
    valor_venda = preco,
    valor_compra = ROUND(preco * 0.7, 2),
    percentual_lucro = 30.00,
    observacoes = COALESCE(descricao, 'Produto migrado'),
    situacao = CURRENT_DATE,
    marca_id = 1,
    unidade_medida_id = 1;

-- Verificar se a migração funcionou
SELECT id, produto_new, codigo_barras, valor_venda, valor_compra FROM produto LIMIT 5;

-- =============================================================================
-- PASSO 3: LIMPAR CAMPOS ANTIGOS DA TABELA PRODUTO
-- =============================================================================

-- Remover campos antigos (cuidado aqui!)
ALTER TABLE produto DROP COLUMN nome;
ALTER TABLE produto DROP COLUMN codigo; 
ALTER TABLE produto DROP COLUMN preco;
ALTER TABLE produto DROP COLUMN ativo;
ALTER TABLE produto DROP COLUMN data_cadastro;
ALTER TABLE produto DROP COLUMN ultima_modificacao;

-- Renomear campo novo
ALTER TABLE produto CHANGE COLUMN produto_new produto varchar(255) NOT NULL;

-- Adicionar constraints NOT NULL
ALTER TABLE produto MODIFY COLUMN codigo_barras varchar(255) NOT NULL;
ALTER TABLE produto MODIFY COLUMN referencia varchar(10) NOT NULL;
ALTER TABLE produto MODIFY COLUMN situacao date NOT NULL;

-- Adicionar campos de data
ALTER TABLE produto ADD COLUMN data_criacao timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE produto ADD COLUMN data_alteracao timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- =============================================================================
-- PASSO 4: RENOMEAR E ATUALIZAR TABELA FORNECEDORES
-- =============================================================================

-- Renomear tabela
RENAME TABLE fornecedores TO fornecedor;

-- Adicionar novos campos
ALTER TABLE fornecedor ADD COLUMN fornecedor_new varchar(255) AFTER id;
ALTER TABLE fornecedor ADD COLUMN apelido varchar(255) AFTER fornecedor_new;
ALTER TABLE fornecedor ADD COLUMN cpf_cnpj varchar(20) AFTER apelido;
ALTER TABLE fornecedor ADD COLUMN rg_inscricao_estadual varchar(50) AFTER cpf_cnpj;
ALTER TABLE fornecedor ADD COLUMN tipo int(11) DEFAULT 1 AFTER rg_inscricao_estadual;
ALTER TABLE fornecedor ADD COLUMN condicao_pagamento_id bigint(20) AFTER tipo;
ALTER TABLE fornecedor ADD COLUMN limite_credito decimal(10,2) DEFAULT 10000.00 AFTER condicao_pagamento_id;
ALTER TABLE fornecedor ADD COLUMN situacao date AFTER limite_credito;

-- Migrar dados dos fornecedores
UPDATE fornecedor SET 
    fornecedor_new = razao_social,
    apelido = COALESCE(nome_fantasia, razao_social),
    cpf_cnpj = cnpj,
    situacao = CURRENT_DATE;

-- Verificar migração
SELECT id, fornecedor_new, apelido, cpf_cnpj FROM fornecedor LIMIT 3;

-- Remover campos antigos
ALTER TABLE fornecedor DROP COLUMN razao_social;
ALTER TABLE fornecedor DROP COLUMN nome_fantasia; 
ALTER TABLE fornecedor DROP COLUMN cnpj;
ALTER TABLE fornecedor DROP COLUMN ativo;
ALTER TABLE fornecedor DROP COLUMN data_cadastro;
ALTER TABLE fornecedor DROP COLUMN ultima_modificacao;

-- Renomear campo novo
ALTER TABLE fornecedor CHANGE COLUMN fornecedor_new fornecedor varchar(255) NOT NULL;

-- Adicionar constraints
ALTER TABLE fornecedor MODIFY COLUMN apelido varchar(255) NOT NULL;
ALTER TABLE fornecedor MODIFY COLUMN cpf_cnpj varchar(20) NOT NULL;
ALTER TABLE fornecedor MODIFY COLUMN situacao date NOT NULL;

-- Adicionar campos de data
ALTER TABLE fornecedor ADD COLUMN data_criacao timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE fornecedor ADD COLUMN data_alteracao timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- =============================================================================
-- PASSO 5: ADICIONAR FOREIGN KEYS
-- =============================================================================

-- Criar dados padrão se não existirem
INSERT IGNORE INTO marca (id, marca, situacao) VALUES (1, 'Sem Marca', CURRENT_DATE);
INSERT IGNORE INTO unidade_medida (id, unidade_medida, situacao) VALUES (1, 'Unidade', CURRENT_DATE);

-- Adicionar foreign keys na tabela produto
ALTER TABLE produto ADD CONSTRAINT fk_produto_marca FOREIGN KEY (marca_id) REFERENCES marca(id);
ALTER TABLE produto ADD CONSTRAINT fk_produto_unidade_medida FOREIGN KEY (unidade_medida_id) REFERENCES unidade_medida(id);

-- Recriar foreign keys na tabela produto_fornecedor
ALTER TABLE produto_fornecedor ADD CONSTRAINT fk_produto_fornecedor_produto FOREIGN KEY (produto_id) REFERENCES produto(id);
ALTER TABLE produto_fornecedor DROP FOREIGN KEY produto_fornecedor_ibfk_2;
ALTER TABLE produto_fornecedor ADD CONSTRAINT fk_produto_fornecedor_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id);

-- =============================================================================
-- PASSO 6: VERIFICAÇÃO FINAL
-- =============================================================================

SELECT 'VERIFICAÇÃO FINAL:' as status;

-- Verificar estrutura das tabelas
DESCRIBE produto;
DESCRIBE fornecedor;

-- Verificar dados migrados
SELECT COUNT(*) as produtos_finais FROM produto;
SELECT COUNT(*) as fornecedores_finais FROM fornecedor;

-- Testar uma consulta complexa
SELECT 
    p.id,
    p.produto,
    p.codigo_barras,
    p.valor_venda,
    m.marca,
    u.unidade_medida
FROM produto p
LEFT JOIN marca m ON p.marca_id = m.id  
LEFT JOIN unidade_medida u ON p.unidade_medida_id = u.id
LIMIT 3;

SELECT 'MIGRAÇÃO CONCLUÍDA COM SUCESSO!' as resultado; 