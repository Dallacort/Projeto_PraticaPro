-- =============================================================================
-- SCRIPT DE MIGRAÇÃO - ESTRUTURA DE PRODUTOS PIZZARIAGRAFF
-- =============================================================================
-- Este script atualiza as tabelas existentes para corresponder ao novo modelo
-- IMPORTANTE: Execute este script com cuidado em produção (faça backup antes)
-- =============================================================================

-- Verificar se existem dados importantes nas tabelas antes da migração
SELECT 'VERIFICANDO DADOS EXISTENTES...' as status;

SELECT COUNT(*) as produtos_existentes FROM produto;
SELECT COUNT(*) as fornecedores_existentes FROM fornecedores;
SELECT COUNT(*) as marcas_existentes FROM marca;
SELECT COUNT(*) as unidades_existentes FROM unidade_medida;
SELECT COUNT(*) as produto_fornecedor_existentes FROM produto_fornecedor;

-- =============================================================================
-- 1. ATUALIZAR TABELA PRODUTO
-- =============================================================================

-- Remover constraints existentes da tabela produto se houver
ALTER TABLE produto_fornecedor DROP FOREIGN KEY IF EXISTS produto_fornecedor_ibfk_1;

-- Fazer backup da estrutura antiga (renomear campos)
ALTER TABLE produto 
ADD COLUMN produto_old varchar(100) DEFAULT NULL,
ADD COLUMN codigo_old varchar(30) DEFAULT NULL;

-- Copiar dados existentes para campos de backup
UPDATE produto SET 
    produto_old = nome,
    codigo_old = codigo;

-- Adicionar novos campos necessários
ALTER TABLE produto 
ADD COLUMN produto varchar(255) DEFAULT NULL AFTER id,
ADD COLUMN unidade_medida_id bigint(20) DEFAULT NULL AFTER produto,
ADD COLUMN codigo_barras varchar(255) DEFAULT NULL AFTER unidade_medida_id,
ADD COLUMN referencia varchar(10) DEFAULT NULL AFTER codigo_barras,
ADD COLUMN marca_id bigint(20) DEFAULT NULL AFTER referencia,
ADD COLUMN quantidade_minima int(11) DEFAULT NULL AFTER marca_id,
ADD COLUMN valor_compra decimal(10,2) DEFAULT NULL AFTER quantidade_minima,
ADD COLUMN valor_venda decimal(10,2) DEFAULT NULL AFTER valor_compra,
ADD COLUMN quantidade int(11) DEFAULT NULL AFTER valor_venda,
ADD COLUMN percentual_lucro decimal(10,2) DEFAULT NULL AFTER quantidade,
ADD COLUMN observacoes varchar(255) DEFAULT NULL AFTER descricao,
ADD COLUMN situacao date DEFAULT NULL AFTER observacoes,
ADD COLUMN data_criacao timestamp DEFAULT CURRENT_TIMESTAMP AFTER situacao,
ADD COLUMN data_alteracao timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER data_criacao;

-- Migrar dados existentes para novos campos
UPDATE produto SET 
    produto = produto_old,
    codigo_barras = COALESCE(codigo_old, CONCAT('BAR', LPAD(id, 10, '0'))),
    referencia = COALESCE(codigo_old, CONCAT('REF', LPAD(id, 7, '0'))),
    valor_venda = preco,
    valor_compra = ROUND(preco * 0.7, 2), -- Estimativa de 30% de margem
    percentual_lucro = 30.00,
    descricao = COALESCE(descricao, produto_old),
    observacoes = COALESCE(descricao, 'Migrado automaticamente'),
    situacao = CURRENT_DATE,
    quantidade = 0,
    quantidade_minima = 1,
    marca_id = 1, -- Será ajustado depois
    unidade_medida_id = 1, -- Será ajustado depois
    data_criacao = COALESCE(data_cadastro, CURRENT_TIMESTAMP),
    data_alteracao = COALESCE(ultima_modificacao, CURRENT_TIMESTAMP);

-- Remover campos antigos
ALTER TABLE produto 
DROP COLUMN nome,
DROP COLUMN codigo,
DROP COLUMN preco,
DROP COLUMN ativo,
DROP COLUMN data_cadastro,
DROP COLUMN ultima_modificacao,
DROP COLUMN produto_old,
DROP COLUMN codigo_old;

-- Adicionar constraints NOT NULL após migração
ALTER TABLE produto 
MODIFY COLUMN produto varchar(255) NOT NULL,
MODIFY COLUMN codigo_barras varchar(255) NOT NULL,
MODIFY COLUMN referencia varchar(10) NOT NULL,
MODIFY COLUMN descricao varchar(255) NOT NULL,
MODIFY COLUMN observacoes varchar(255) NOT NULL,
MODIFY COLUMN situacao date NOT NULL;

-- =============================================================================
-- 2. CRIAR NOVA TABELA FORNECEDOR (renomear fornecedores para fornecedor)
-- =============================================================================

-- Verificar se já existe a tabela fornecedor
DROP TABLE IF EXISTS fornecedor;

-- Renomear tabela fornecedores para fornecedor
RENAME TABLE fornecedores TO fornecedor;

-- Atualizar estrutura da tabela fornecedor
ALTER TABLE fornecedor 
ADD COLUMN fornecedor_new varchar(255) DEFAULT NULL,
ADD COLUMN apelido_new varchar(255) DEFAULT NULL,
ADD COLUMN cpf_cnpj_new varchar(20) DEFAULT NULL,
ADD COLUMN rg_inscricao_estadual varchar(50) DEFAULT NULL,
ADD COLUMN tipo int(11) DEFAULT 1,
ADD COLUMN condicao_pagamento_id bigint(20) DEFAULT NULL,
ADD COLUMN limite_credito decimal(10,2) DEFAULT 0.00,
ADD COLUMN situacao_new date DEFAULT NULL,
ADD COLUMN data_criacao timestamp DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN data_alteracao timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Migrar dados existentes
UPDATE fornecedor SET 
    fornecedor_new = razao_social,
    apelido_new = COALESCE(nome_fantasia, razao_social),
    cpf_cnpj_new = cnpj,
    situacao_new = CURRENT_DATE,
    limite_credito = 10000.00,
    data_criacao = COALESCE(data_cadastro, CURRENT_TIMESTAMP),
    data_alteracao = COALESCE(ultima_modificacao, CURRENT_TIMESTAMP);

-- Remover campos antigos
ALTER TABLE fornecedor 
DROP COLUMN razao_social,
DROP COLUMN nome_fantasia,
DROP COLUMN cnpj,
DROP COLUMN ativo,
DROP COLUMN data_cadastro,
DROP COLUMN ultima_modificacao;

-- Renomear novos campos
ALTER TABLE fornecedor 
CHANGE COLUMN fornecedor_new fornecedor varchar(255) NOT NULL,
CHANGE COLUMN apelido_new apelido varchar(255) NOT NULL,
CHANGE COLUMN cpf_cnpj_new cpf_cnpj varchar(20) NOT NULL,
CHANGE COLUMN situacao_new situacao date NOT NULL;

-- =============================================================================
-- 3. ADICIONAR FOREIGN KEYS NA TABELA PRODUTO
-- =============================================================================

-- Adicionar foreign key para marca
ALTER TABLE produto 
ADD CONSTRAINT fk_produto_marca 
FOREIGN KEY (marca_id) REFERENCES marca(id);

-- Adicionar foreign key para unidade_medida
ALTER TABLE produto 
ADD CONSTRAINT fk_produto_unidade_medida 
FOREIGN KEY (unidade_medida_id) REFERENCES unidade_medida(id);

-- =============================================================================
-- 4. ATUALIZAR TABELA PRODUTO_FORNECEDOR
-- =============================================================================

-- Recriar foreign key que foi removida
ALTER TABLE produto_fornecedor 
ADD CONSTRAINT fk_produto_fornecedor_produto 
FOREIGN KEY (produto_id) REFERENCES produto(id);

-- Atualizar constraint para nova tabela fornecedor
ALTER TABLE produto_fornecedor DROP FOREIGN KEY IF EXISTS produto_fornecedor_ibfk_2;
ALTER TABLE produto_fornecedor 
ADD CONSTRAINT fk_produto_fornecedor_fornecedor 
FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id);

-- =============================================================================
-- 5. INSERIR DADOS PADRÃO SE NÃO EXISTIREM
-- =============================================================================

-- Inserir marca padrão se não existir
INSERT IGNORE INTO marca (id, marca, situacao) VALUES 
(1, 'Sem Marca', CURRENT_DATE);

-- Inserir unidade de medida padrão se não existir  
INSERT IGNORE INTO unidade_medida (id, unidade_medida, situacao) VALUES 
(1, 'Unidade', CURRENT_DATE);

-- Atualizar produtos sem marca ou unidade
UPDATE produto SET marca_id = 1 WHERE marca_id IS NULL;
UPDATE produto SET unidade_medida_id = 1 WHERE unidade_medida_id IS NULL;

-- =============================================================================
-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices na tabela produto
CREATE INDEX IF NOT EXISTS idx_produto_codigo_barras ON produto(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_produto_referencia ON produto(referencia);
CREATE INDEX IF NOT EXISTS idx_produto_marca ON produto(marca_id);
CREATE INDEX IF NOT EXISTS idx_produto_unidade ON produto(unidade_medida_id);

-- Índices na tabela fornecedor
CREATE INDEX IF NOT EXISTS idx_fornecedor_cpf_cnpj ON fornecedor(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_fornecedor_nome ON fornecedor(fornecedor);

-- =============================================================================
-- VERIFICAÇÃO FINAL
-- =============================================================================

SELECT 'MIGRAÇÃO CONCLUÍDA!' as status;
SELECT 'Verificando estrutura final...' as info;

DESCRIBE produto;
DESCRIBE fornecedor;
DESCRIBE marca;
DESCRIBE unidade_medida;
DESCRIBE produto_fornecedor;

-- Verificar dados migrados
SELECT COUNT(*) as produtos_migrados FROM produto;
SELECT COUNT(*) as fornecedores_migrados FROM fornecedor;

SELECT 'ESTRUTURA ATUALIZADA COM SUCESSO!' as resultado; 