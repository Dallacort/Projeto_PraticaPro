-- pizzariagraff.categoria definição

CREATE TABLE `categoria` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(60) NOT NULL COMMENT 'Nome da categoria',
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) DEFAULT 1 COMMENT 'Status da categoria: 1=Ativo, 0=Inativo',
  PRIMARY KEY (`id`),
  KEY `idx_categoria_nome` (`categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Tabela de categoria de produtos';


-- pizzariagraff.condicao_pagamento definição

CREATE TABLE `condicao_pagamento` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `numero_parcelas` int(11) DEFAULT 1,
  `parcelas` int(11) NOT NULL DEFAULT 1,
  `ativo` tinyint(1) DEFAULT 1,
  `dias_primeira_parcela` int(11) DEFAULT 0,
  `dias_entre_parcelas` int(11) DEFAULT 0,
  `percentual_juros` decimal(10,2) DEFAULT 0.00,
  `percentual_multa` decimal(10,2) DEFAULT 0.00,
  `percentual_desconto` decimal(10,2) DEFAULT 0.00,
  `data_cadastro` datetime DEFAULT current_timestamp(),
  `ultima_modificacao` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `condicao_pagamento` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_condicao_pagamento` (`condicao_pagamento`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.contas_pagar definição

CREATE TABLE `contas_pagar` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nota_numero` varchar(20) NOT NULL,
  `nota_modelo` varchar(2) NOT NULL,
  `nota_serie` varchar(3) NOT NULL,
  `fornecedor_id` bigint(20) NOT NULL,
  `numero_parcela` int(11) NOT NULL,
  `total_parcelas` int(11) NOT NULL,
  `valor_original` decimal(15,2) NOT NULL,
  `valor_pago` decimal(15,2) DEFAULT 0.00,
  `valor_desconto` decimal(15,2) DEFAULT 0.00,
  `valor_juros` decimal(15,2) DEFAULT 0.00,
  `valor_multa` decimal(15,2) DEFAULT 0.00,
  `valor_total` decimal(15,2) NOT NULL,
  `data_emissao` date NOT NULL,
  `data_vencimento` date NOT NULL,
  `data_pagamento` date DEFAULT NULL,
  `forma_pagamento_id` bigint(20) DEFAULT NULL,
  `situacao` varchar(20) NOT NULL DEFAULT 'PENDENTE',
  `observacoes` text DEFAULT NULL,
  `data_criacao` timestamp NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_contas_pagar_fornecedor` (`fornecedor_id`),
  KEY `idx_contas_pagar_vencimento` (`data_vencimento`),
  KEY `idx_contas_pagar_situacao` (`situacao`),
  KEY `idx_contas_pagar_nota` (`nota_numero`,`nota_modelo`,`nota_serie`,`fornecedor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- pizzariagraff.contas_receber definição

CREATE TABLE `contas_receber` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nota_numero` varchar(20) NOT NULL,
  `nota_modelo` varchar(2) NOT NULL,
  `nota_serie` varchar(3) NOT NULL,
  `cliente_id` bigint(20) NOT NULL,
  `numero_parcela` int(11) NOT NULL,
  `total_parcelas` int(11) NOT NULL,
  `valor_original` decimal(15,2) NOT NULL,
  `valor_recebido` decimal(15,2) DEFAULT 0.00,
  `valor_desconto` decimal(15,2) DEFAULT 0.00,
  `valor_juros` decimal(15,2) DEFAULT 0.00,
  `valor_multa` decimal(15,2) DEFAULT 0.00,
  `valor_total` decimal(15,2) NOT NULL,
  `data_emissao` date NOT NULL,
  `data_vencimento` date NOT NULL,
  `data_recebimento` date DEFAULT NULL,
  `forma_pagamento_id` bigint(20) DEFAULT NULL,
  `situacao` varchar(20) NOT NULL DEFAULT 'PENDENTE',
  `observacoes` text DEFAULT NULL,
  `data_criacao` timestamp NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_contas_receber_cliente` (`cliente_id`),
  KEY `idx_contas_receber_vencimento` (`data_vencimento`),
  KEY `idx_contas_receber_situacao` (`situacao`),
  KEY `idx_contas_receber_nota` (`nota_numero`,`nota_modelo`,`nota_serie`,`cliente_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- pizzariagraff.forma_pagamento definição

CREATE TABLE `forma_pagamento` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` varchar(100) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.funcao_funcionario definição

CREATE TABLE `funcao_funcionario` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(255) DEFAULT NULL,
  `salario_base` decimal(10,2) DEFAULT 0.00,
  `ativo` tinyint(1) DEFAULT 1,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `funcao_funcionario` varchar(255) NOT NULL,
  `requer_cnh` tinyint(1) DEFAULT 0,
  `carga_horaria` decimal(10,2) NOT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  `data_criacao` datetime DEFAULT NULL,
  `data_alteracao` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_funcao_ativo` (`ativo`),
  KEY `idx_funcao_descricao` (`descricao`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Funções/cargos dos funcionários';


-- pizzariagraff.marca definição

CREATE TABLE `marca` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `marca` varchar(60) NOT NULL COMMENT 'Nome da marca',
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) DEFAULT 1 COMMENT 'Status da marca: 1=Ativo, 0=Inativo',
  PRIMARY KEY (`id`),
  KEY `idx_marca_nome` (`marca`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Tabela de marcas de produtos';


-- pizzariagraff.modalidade_nfe definição

CREATE TABLE `modalidade_nfe` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(10) NOT NULL,
  `descricao` varchar(100) NOT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.pais definição

CREATE TABLE `pais` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `codigo` varchar(5) DEFAULT NULL,
  `sigla` varchar(5) DEFAULT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `nacionalidade` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pais_nacionalidade` (`nacionalidade`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.unidade_medida definição

CREATE TABLE `unidade_medida` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `unidade_medida` varchar(255) NOT NULL COMMENT 'Nome da unidade de medida',
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) DEFAULT 1 COMMENT 'Status da unidade de medida: 1=Ativo, 0=Inativo',
  PRIMARY KEY (`id`),
  KEY `idx_unidade_medida_nome` (`unidade_medida`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Tabela de unidades de medida';


-- pizzariagraff.veiculo definição

CREATE TABLE `veiculo` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `placa` varchar(10) NOT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `ano` int(11) DEFAULT NULL,
  `capacidade` decimal(10,2) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.estado definição

CREATE TABLE `estado` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `uf` varchar(2) NOT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `pais_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_estado_pais` (`pais_id`),
  CONSTRAINT `fk_estado_pais` FOREIGN KEY (`pais_id`) REFERENCES `pais` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.parcela_condicao_pagamento definição

CREATE TABLE `parcela_condicao_pagamento` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `condicao_pagamento_id` bigint(20) NOT NULL,
  `numero` int(11) NOT NULL COMMENT 'Número sequencial da parcela',
  `dias` int(11) NOT NULL COMMENT 'Dias para vencimento a partir da emissão',
  `percentual` decimal(10,2) NOT NULL COMMENT 'Percentual do valor total',
  `forma_pagamento_id` bigint(20) DEFAULT NULL COMMENT 'Forma de pagamento específica para esta parcela',
  `data_cadastro` datetime DEFAULT current_timestamp(),
  `ultima_modificacao` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `condicao_pagamento_id` (`condicao_pagamento_id`),
  KEY `forma_pagamento_id` (`forma_pagamento_id`),
  CONSTRAINT `parcela_condicao_pagamento_ibfk_1` FOREIGN KEY (`condicao_pagamento_id`) REFERENCES `condicao_pagamento` (`id`) ON DELETE CASCADE,
  CONSTRAINT `parcela_condicao_pagamento_ibfk_2` FOREIGN KEY (`forma_pagamento_id`) REFERENCES `forma_pagamento` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.produto definição

CREATE TABLE `produto` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `produto` varchar(255) NOT NULL,
  `codigo_barras` varchar(255) DEFAULT NULL,
  `referencia` varchar(10) DEFAULT NULL,
  `marca_id` bigint(20) NOT NULL,
  `unidade_medida_id` bigint(20) NOT NULL,
  `valor_compra` decimal(10,2) NOT NULL,
  `valor_venda` decimal(10,2) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 0,
  `quantidade_minima` int(11) NOT NULL DEFAULT 1,
  `percentual_lucro` decimal(10,2) NOT NULL,
  `descricao` text DEFAULT NULL,
  `observacoes` varchar(255) DEFAULT NULL,
  `data_criacao` timestamp NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) DEFAULT 1 COMMENT 'Status do produto: 1=Ativo, 0=Inativo',
  `categoria_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_produto_marca` (`marca_id`),
  KEY `fk_produto_unidade_medida` (`unidade_medida_id`),
  KEY `fk_produto_categoria` (`categoria_id`),
  CONSTRAINT `fk_produto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`),
  CONSTRAINT `fk_produto_marca` FOREIGN KEY (`marca_id`) REFERENCES `marca` (`id`),
  CONSTRAINT `fk_produto_unidade_medida` FOREIGN KEY (`unidade_medida_id`) REFERENCES `unidade_medida` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.cidade definição

CREATE TABLE `cidade` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `estado_id` bigint(20) NOT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `estado_id` (`estado_id`),
  CONSTRAINT `cidade_ibfk_1` FOREIGN KEY (`estado_id`) REFERENCES `estado` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.cliente definição

CREATE TABLE `cliente` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cliente` varchar(50) NOT NULL COMMENT 'Nome do cliente',
  `apelido` varchar(60) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` varchar(200) DEFAULT NULL,
  `numero` varchar(5) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(50) DEFAULT NULL,
  `cep` varchar(9) DEFAULT NULL,
  `cidade_id` bigint(20) DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `limite_credito` decimal(10,2) DEFAULT 0.00,
  `rg_inscricao_estadual` varchar(14) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `estado_civil` varchar(255) DEFAULT NULL,
  `tipo` int(11) DEFAULT NULL COMMENT '1=Pessoa Física, 2=Pessoa Jurídica',
  `sexo` varchar(1) DEFAULT NULL COMMENT 'M=Masculino, F=Feminino',
  `condicao_pagamento_id` bigint(20) DEFAULT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  `cpf_cpnj` varchar(14) DEFAULT NULL COMMENT 'CPF ou CNPJ unificado',
  `nacionalidade_id` bigint(20) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cliente_cpfcpnj` (`cpf_cpnj`),
  KEY `cidade_id` (`cidade_id`),
  KEY `fk_cliente_condicao_pagamento` (`condicao_pagamento_id`),
  KEY `idx_cliente_cpf_cpnj` (`cpf_cpnj`),
  KEY `idx_cliente_tipo` (`tipo`),
  KEY `idx_cliente_nacionalidade_id` (`nacionalidade_id`),
  CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`cidade_id`) REFERENCES `cidade` (`id`),
  CONSTRAINT `fk_cliente_condicao_pagamento` FOREIGN KEY (`condicao_pagamento_id`) REFERENCES `condicao_pagamento` (`id`),
  CONSTRAINT `fk_cliente_nacionalidade` FOREIGN KEY (`nacionalidade_id`) REFERENCES `pais` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Tabela de clientes atualizada conforme DER';


-- pizzariagraff.funcionario definição

CREATE TABLE `funcionario` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `funcionario` varchar(255) NOT NULL COMMENT 'Nome do funcionário',
  `apelido` varchar(60) DEFAULT NULL,
  `telefone` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `endereco` varchar(200) NOT NULL,
  `numero` varchar(5) NOT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(50) NOT NULL,
  `cep` varchar(9) NOT NULL,
  `cidade_id` bigint(20) NOT NULL,
  `data_admissao` date NOT NULL,
  `data_demissao` date DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rg_inscricao_estadual` varchar(14) DEFAULT NULL,
  `cnh` varchar(25) DEFAULT NULL,
  `data_validade_cnh` date DEFAULT NULL,
  `sexo` int(11) NOT NULL COMMENT '1=Masculino, 2=Feminino',
  `observacao` varchar(255) NOT NULL,
  `estado_civil` int(11) NOT NULL,
  `salario` int(11) NOT NULL,
  `nacionalidade_id` bigint(20) NOT NULL,
  `funcao_funcionario_id` bigint(20) NOT NULL,
  `cpf_cpnj` varchar(14) DEFAULT NULL COMMENT 'CPF ou CNPJ do funcionário',
  `ativo` tinyint(1) DEFAULT 1,
  `data_nascimento` date NOT NULL,
  `tipo` int(11) DEFAULT 1 COMMENT 'Tipo do funcionário: 1=Pessoa Física, 2=Pessoa Jurídica',
  PRIMARY KEY (`id`),
  KEY `cidade_id` (`cidade_id`),
  KEY `idx_funcionario_cpf_cpnj` (`cpf_cpnj`),
  KEY `idx_funcionario_email` (`email`),
  KEY `idx_funcionario_funcao` (`funcao_funcionario_id`),
  KEY `idx_funcionario_nacionalidade` (`nacionalidade_id`),
  KEY `idx_funcionario_tipo` (`tipo`),
  CONSTRAINT `fk_funcionario_funcao` FOREIGN KEY (`funcao_funcionario_id`) REFERENCES `funcao_funcionario` (`id`),
  CONSTRAINT `fk_funcionario_nacionalidade` FOREIGN KEY (`nacionalidade_id`) REFERENCES `pais` (`id`),
  CONSTRAINT `funcionario_ibfk_1` FOREIGN KEY (`cidade_id`) REFERENCES `cidade` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Tabela de funcionários atualizada conforme DER';


-- pizzariagraff.transportadora definição

CREATE TABLE `transportadora` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `razao_social` varchar(150) NOT NULL,
  `nome_fantasia` varchar(100) DEFAULT NULL,
  `cnpj` varchar(18) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` varchar(200) DEFAULT NULL,
  `cidade_id` bigint(20) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `tipo` char(1) DEFAULT 'J' COMMENT 'F-Física, J-Jurídica',
  `rg_ie` varchar(20) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `numero` varchar(10) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `condicao_pagamento_id` bigint(20) DEFAULT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cidade_id` (`cidade_id`),
  KEY `fk_transportadora_condicao_pagamento` (`condicao_pagamento_id`),
  CONSTRAINT `fk_transportadora_condicao_pagamento` FOREIGN KEY (`condicao_pagamento_id`) REFERENCES `condicao_pagamento` (`id`),
  CONSTRAINT `transportadora_ibfk_1` FOREIGN KEY (`cidade_id`) REFERENCES `cidade` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.transportadora_emails definição

CREATE TABLE `transportadora_emails` (
  `id_email` bigint(20) NOT NULL AUTO_INCREMENT,
  `cod_trans` bigint(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  PRIMARY KEY (`id_email`),
  KEY `fk_email_transportadora` (`cod_trans`),
  CONSTRAINT `fk_email_transportadora` FOREIGN KEY (`cod_trans`) REFERENCES `transportadora` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.transportadora_telefones definição

CREATE TABLE `transportadora_telefones` (
  `id_telefone` bigint(20) NOT NULL AUTO_INCREMENT,
  `cod_trans` bigint(20) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  PRIMARY KEY (`id_telefone`),
  KEY `fk_telefone_transportadora` (`cod_trans`),
  CONSTRAINT `fk_telefone_transportadora` FOREIGN KEY (`cod_trans`) REFERENCES `transportadora` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.transportadora_veiculo definição

CREATE TABLE `transportadora_veiculo` (
  `transportadora_id` bigint(20) NOT NULL,
  `veiculo_id` bigint(20) NOT NULL,
  PRIMARY KEY (`transportadora_id`,`veiculo_id`),
  KEY `fk_transpveiculo_veiculo` (`veiculo_id`),
  CONSTRAINT `fk_transpveiculo_transportadora` FOREIGN KEY (`transportadora_id`) REFERENCES `transportadora` (`id`),
  CONSTRAINT `fk_transpveiculo_veiculo` FOREIGN KEY (`veiculo_id`) REFERENCES `veiculo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Tabela de associação para o relacionamento N-N entre transportadoras e veículos';


-- pizzariagraff.fornecedor definição

CREATE TABLE `fornecedor` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fornecedor` varchar(255) NOT NULL COMMENT 'Nome do fornecedor',
  `apelido` varchar(255) NOT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `cep` varchar(9) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `numero` varchar(5) DEFAULT NULL,
  `cidade_id` bigint(20) DEFAULT NULL,
  `rg_inscricao_estadual` varchar(14) DEFAULT NULL,
  `cpf_cnpj` varchar(14) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `telefone` varchar(255) NOT NULL,
  `tipo` int(11) NOT NULL COMMENT 'Tipo do fornecedor',
  `observacoes` varchar(255) DEFAULT NULL,
  `condicao_pagamento_id` bigint(20) DEFAULT NULL,
  `limite_credito` decimal(15,2) NOT NULL DEFAULT 0.00,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `nacionalidade_id` bigint(20) DEFAULT NULL,
  `transportadora_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fornecedor_nome` (`fornecedor`),
  KEY `idx_fornecedor_cpf_cnpj` (`cpf_cnpj`),
  KEY `idx_fornecedor_email` (`email`),
  KEY `cidade_id` (`cidade_id`),
  KEY `condicao_pagamento_id` (`condicao_pagamento_id`),
  KEY `idx_fornecedor_nacionalidade` (`nacionalidade_id`),
  KEY `idx_fornecedor_transportadora` (`transportadora_id`),
  CONSTRAINT `fk_fornecedor_nacionalidade` FOREIGN KEY (`nacionalidade_id`) REFERENCES `pais` (`id`),
  CONSTRAINT `fk_fornecedor_transportadora` FOREIGN KEY (`transportadora_id`) REFERENCES `transportadora` (`id`),
  CONSTRAINT `fornecedor_ibfk_1` FOREIGN KEY (`cidade_id`) REFERENCES `cidade` (`id`),
  CONSTRAINT `fornecedor_ibfk_2` FOREIGN KEY (`condicao_pagamento_id`) REFERENCES `condicao_pagamento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Tabela de fornecedores';


-- pizzariagraff.fornecedor_email definição

CREATE TABLE `fornecedor_email` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fornecedor_id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `tipo` varchar(20) DEFAULT 'COMERCIAL' COMMENT 'COMERCIAL, FINANCEIRO, COMPRAS, VENDAS, SUPORTE',
  `principal` tinyint(1) DEFAULT 0 COMMENT 'Se é o email principal',
  `ativo` tinyint(1) DEFAULT 1,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_fornecedor_email_fornecedor` (`fornecedor_id`),
  KEY `idx_fornecedor_email_principal` (`fornecedor_id`,`principal`),
  KEY `idx_fornecedor_email_email` (`email`),
  CONSTRAINT `fk_fornecedor_email_fornecedor` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedor` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Múltiplos emails dos fornecedores';


-- pizzariagraff.fornecedor_telefone definição

CREATE TABLE `fornecedor_telefone` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fornecedor_id` bigint(20) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `tipo` varchar(20) DEFAULT 'COMERCIAL' COMMENT 'COMERCIAL, RESIDENCIAL, CELULAR, FAX, WHATSAPP',
  `principal` tinyint(1) DEFAULT 0 COMMENT 'Se é o telefone principal',
  `ativo` tinyint(1) DEFAULT 1,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_fornecedor_telefone_fornecedor` (`fornecedor_id`),
  KEY `idx_fornecedor_telefone_principal` (`fornecedor_id`,`principal`),
  CONSTRAINT `fk_fornecedor_telefone_fornecedor` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedor` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Múltiplos telefones dos fornecedores';


-- pizzariagraff.nfe definição

CREATE TABLE `nfe` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `serie` varchar(3) NOT NULL,
  `chave_acesso` varchar(44) DEFAULT NULL,
  `data_emissao` datetime NOT NULL,
  `cliente_id` bigint(20) DEFAULT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `forma_pagamento_id` bigint(20) DEFAULT NULL,
  `condicao_pagamento_id` bigint(20) DEFAULT NULL,
  `transportadora_id` bigint(20) DEFAULT NULL,
  `veiculo_id` bigint(20) DEFAULT NULL,
  `modalidade_id` bigint(20) DEFAULT NULL,
  `cancelada` tinyint(1) DEFAULT 0,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `forma_pagamento_id` (`forma_pagamento_id`),
  KEY `condicao_pagamento_id` (`condicao_pagamento_id`),
  KEY `transportadora_id` (`transportadora_id`),
  KEY `veiculo_id` (`veiculo_id`),
  KEY `modalidade_id` (`modalidade_id`),
  CONSTRAINT `nfe_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
  CONSTRAINT `nfe_ibfk_2` FOREIGN KEY (`forma_pagamento_id`) REFERENCES `forma_pagamento` (`id`),
  CONSTRAINT `nfe_ibfk_3` FOREIGN KEY (`condicao_pagamento_id`) REFERENCES `condicao_pagamento` (`id`),
  CONSTRAINT `nfe_ibfk_4` FOREIGN KEY (`transportadora_id`) REFERENCES `transportadora` (`id`),
  CONSTRAINT `nfe_ibfk_5` FOREIGN KEY (`veiculo_id`) REFERENCES `veiculo` (`id`),
  CONSTRAINT `nfe_ibfk_6` FOREIGN KEY (`modalidade_id`) REFERENCES `modalidade_nfe` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.nota_entrada definição

CREATE TABLE `nota_entrada` (
  `numero` varchar(20) NOT NULL,
  `modelo` varchar(10) NOT NULL DEFAULT '55',
  `serie` varchar(10) NOT NULL DEFAULT '1',
  `fornecedor_id` bigint(20) NOT NULL,
  `data_emissao` date NOT NULL DEFAULT curdate(),
  `data_chegada` date DEFAULT NULL,
  `tipo_frete` char(3) NOT NULL DEFAULT 'CIF',
  `valor_produtos` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `valor_frete` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `valor_seguro` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `outras_despesas` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `valor_desconto` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `valor_total` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `condicao_pagamento_id` bigint(20) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `situacao` varchar(20) DEFAULT 'PENDENTE',
  `data_criacao` timestamp NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `transportadora_id` bigint(20) DEFAULT NULL,
  `placa_veiculo` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`numero`,`modelo`,`serie`,`fornecedor_id`),
  KEY `condicao_pagamento_id` (`condicao_pagamento_id`),
  KEY `idx_nota_entrada_fornecedor` (`fornecedor_id`),
  KEY `idx_nota_entrada_data_emissao` (`data_emissao`),
  KEY `idx_nota_entrada_situacao` (`situacao`),
  KEY `fk_nota_entrada_transportadora` (`transportadora_id`),
  CONSTRAINT `fk_nota_entrada_transportadora` FOREIGN KEY (`transportadora_id`) REFERENCES `transportadora` (`id`),
  CONSTRAINT `nota_entrada_ibfk_1` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedor` (`id`),
  CONSTRAINT `nota_entrada_ibfk_2` FOREIGN KEY (`condicao_pagamento_id`) REFERENCES `condicao_pagamento` (`id`),
  CONSTRAINT `CONSTRAINT_1` CHECK (`tipo_frete` in ('CIF','FOB','SEM')),
  CONSTRAINT `CONSTRAINT_2` CHECK (`situacao` in ('PENDENTE','CONFIRMADA','CANCELADA')),
  CONSTRAINT `CONSTRAINT_3` CHECK (`valor_produtos` >= 0),
  CONSTRAINT `CONSTRAINT_4` CHECK (`valor_frete` >= 0),
  CONSTRAINT `CONSTRAINT_5` CHECK (`valor_seguro` >= 0),
  CONSTRAINT `CONSTRAINT_6` CHECK (`outras_despesas` >= 0),
  CONSTRAINT `CONSTRAINT_7` CHECK (`valor_desconto` >= 0),
  CONSTRAINT `CONSTRAINT_8` CHECK (`valor_total` >= 0),
  CONSTRAINT `CONSTRAINT_9` CHECK (`data_chegada` is null or `data_chegada` >= `data_emissao`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.nota_saida definição

CREATE TABLE `nota_saida` (
  `numero` varchar(20) NOT NULL,
  `modelo` varchar(10) NOT NULL DEFAULT '55',
  `serie` varchar(10) NOT NULL DEFAULT '1',
  `cliente_id` bigint(20) NOT NULL,
  `data_emissao` date NOT NULL DEFAULT curdate(),
  `data_saida` date DEFAULT NULL,
  `tipo_frete` char(3) NOT NULL DEFAULT 'CIF',
  `valor_produtos` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `valor_frete` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `valor_seguro` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `outras_despesas` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `valor_desconto` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `valor_total` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `condicao_pagamento_id` bigint(20) DEFAULT NULL,
  `transportadora_id` bigint(20) DEFAULT NULL,
  `placa_veiculo` varchar(10) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `situacao` varchar(20) DEFAULT 'PENDENTE',
  `data_criacao` timestamp NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`numero`,`modelo`,`serie`,`cliente_id`),
  KEY `condicao_pagamento_id` (`condicao_pagamento_id`),
  KEY `idx_nota_saida_cliente` (`cliente_id`),
  KEY `idx_nota_saida_data_emissao` (`data_emissao`),
  KEY `idx_nota_saida_situacao` (`situacao`),
  KEY `fk_nota_saida_transportadora` (`transportadora_id`),
  CONSTRAINT `fk_nota_saida_transportadora` FOREIGN KEY (`transportadora_id`) REFERENCES `transportadora` (`id`),
  CONSTRAINT `nota_saida_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
  CONSTRAINT `nota_saida_ibfk_2` FOREIGN KEY (`condicao_pagamento_id`) REFERENCES `condicao_pagamento` (`id`),
  CONSTRAINT `nota_saida_check_tipo_frete` CHECK (`tipo_frete` in ('CIF','FOB','SEM')),
  CONSTRAINT `nota_saida_check_situacao` CHECK (`situacao` in ('PENDENTE','CONFIRMADA','CANCELADA')),
  CONSTRAINT `nota_saida_check_valor_produtos` CHECK (`valor_produtos` >= 0),
  CONSTRAINT `nota_saida_check_valor_frete` CHECK (`valor_frete` >= 0),
  CONSTRAINT `nota_saida_check_valor_seguro` CHECK (`valor_seguro` >= 0),
  CONSTRAINT `nota_saida_check_outras_despesas` CHECK (`outras_despesas` >= 0),
  CONSTRAINT `nota_saida_check_valor_desconto` CHECK (`valor_desconto` >= 0),
  CONSTRAINT `nota_saida_check_valor_total` CHECK (`valor_total` >= 0),
  CONSTRAINT `nota_saida_check_data_saida` CHECK (`data_saida` is null or `data_saida` >= `data_emissao`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.produto_fornecedor definição

CREATE TABLE `produto_fornecedor` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `produto_id` bigint(20) NOT NULL,
  `fornecedor_id` bigint(20) NOT NULL,
  `codigo_prod` varchar(50) DEFAULT NULL,
  `custo` decimal(10,2) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_produto_fornecedor_produto` (`produto_id`),
  KEY `fk_produto_fornecedor_fornecedor` (`fornecedor_id`),
  CONSTRAINT `fk_produto_fornecedor_fornecedor` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedor` (`id`),
  CONSTRAINT `fk_produto_fornecedor_produto` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.produto_nota_saida definição

CREATE TABLE `produto_nota_saida` (
  `nota_numero` varchar(20) NOT NULL,
  `nota_modelo` varchar(10) NOT NULL,
  `nota_serie` varchar(10) NOT NULL,
  `cliente_id` bigint(20) NOT NULL,
  `produto_id` bigint(20) NOT NULL,
  `sequencia` int(11) NOT NULL,
  `quantidade` decimal(15,4) NOT NULL,
  `valor_unitario` decimal(15,4) NOT NULL,
  `valor_desconto` decimal(15,4) DEFAULT 0.0000,
  `percentual_desconto` decimal(5,2) DEFAULT 0.00,
  `valor_total` decimal(15,4) NOT NULL,
  `rateio_frete` decimal(15,4) DEFAULT 0.0000,
  `rateio_seguro` decimal(15,4) DEFAULT 0.0000,
  `rateio_outras` decimal(15,4) DEFAULT 0.0000,
  `custo_preco_final` decimal(15,4) DEFAULT 0.0000,
  PRIMARY KEY (`nota_numero`,`nota_modelo`,`nota_serie`,`cliente_id`,`produto_id`,`sequencia`),
  KEY `produto_id` (`produto_id`),
  KEY `idx_produto_nota_saida_cliente` (`cliente_id`),
  CONSTRAINT `produto_nota_saida_ibfk_1` FOREIGN KEY (`nota_numero`, `nota_modelo`, `nota_serie`, `cliente_id`) REFERENCES `nota_saida` (`numero`, `modelo`, `serie`, `cliente_id`) ON DELETE CASCADE,
  CONSTRAINT `produto_nota_saida_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`),
  CONSTRAINT `produto_nota_saida_check_quantidade` CHECK (`quantidade` > 0),
  CONSTRAINT `produto_nota_saida_check_valor_unitario` CHECK (`valor_unitario` >= 0),
  CONSTRAINT `produto_nota_saida_check_valor_desconto` CHECK (`valor_desconto` >= 0),
  CONSTRAINT `produto_nota_saida_check_percentual_desconto` CHECK (`percentual_desconto` >= 0 and `percentual_desconto` <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.produtos_nota definição

CREATE TABLE `produtos_nota` (
  `nota_numero` varchar(20) NOT NULL,
  `nota_modelo` varchar(10) NOT NULL,
  `nota_serie` varchar(10) NOT NULL,
  `fornecedor_id` bigint(20) NOT NULL,
  `produto_id` bigint(20) NOT NULL,
  `sequencia` int(11) NOT NULL DEFAULT 1,
  `quantidade` decimal(15,4) NOT NULL,
  `valor_unitario` decimal(15,4) NOT NULL,
  `valor_desconto` decimal(15,4) DEFAULT 0.0000,
  `percentual_desconto` decimal(5,2) DEFAULT 0.00,
  `valor_total` decimal(15,4) NOT NULL,
  `rateio_frete` decimal(15,4) DEFAULT 0.0000,
  `rateio_seguro` decimal(15,4) DEFAULT 0.0000,
  `rateio_outras` decimal(15,4) DEFAULT 0.0000,
  `custo_preco_final` decimal(15,4) DEFAULT NULL,
  `data_criacao` timestamp NULL DEFAULT current_timestamp(),
  `data_alteracao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`nota_numero`,`nota_modelo`,`nota_serie`,`fornecedor_id`,`produto_id`,`sequencia`),
  KEY `idx_produtos_nota_produto` (`produto_id`),
  KEY `idx_produtos_nota_nota` (`nota_numero`,`nota_modelo`,`nota_serie`),
  CONSTRAINT `produtos_nota_ibfk_1` FOREIGN KEY (`nota_numero`, `nota_modelo`, `nota_serie`, `fornecedor_id`) REFERENCES `nota_entrada` (`numero`, `modelo`, `serie`, `fornecedor_id`) ON DELETE CASCADE,
  CONSTRAINT `produtos_nota_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`),
  CONSTRAINT `CONSTRAINT_1` CHECK (`quantidade` > 0),
  CONSTRAINT `CONSTRAINT_2` CHECK (`valor_unitario` >= 0),
  CONSTRAINT `CONSTRAINT_3` CHECK (`valor_desconto` >= 0),
  CONSTRAINT `CONSTRAINT_4` CHECK (`percentual_desconto` >= 0 and `percentual_desconto` <= 100),
  CONSTRAINT `CONSTRAINT_5` CHECK (`valor_total` >= 0),
  CONSTRAINT `CONSTRAINT_6` CHECK (`sequencia` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.transp_item definição

CREATE TABLE `transp_item` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `descricao` varchar(100) DEFAULT NULL,
  `transportadora_id` bigint(20) DEFAULT NULL,
  `codigo_transp` varchar(20) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `transportadora_id` (`transportadora_id`),
  CONSTRAINT `transp_item_ibfk_1` FOREIGN KEY (`transportadora_id`) REFERENCES `transportadora` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.item_nfe definição

CREATE TABLE `item_nfe` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nfe_id` bigint(20) NOT NULL,
  `produto_id` bigint(20) NOT NULL,
  `quantidade` decimal(10,3) NOT NULL,
  `valor_unitario` decimal(10,2) NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `nfe_id` (`nfe_id`),
  KEY `produto_id` (`produto_id`),
  CONSTRAINT `item_nfe_ibfk_1` FOREIGN KEY (`nfe_id`) REFERENCES `nfe` (`id`),
  CONSTRAINT `item_nfe_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.movimentacao_nfe definição

CREATE TABLE `movimentacao_nfe` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nfe_id` bigint(20) NOT NULL,
  `data_movimentacao` datetime NOT NULL,
  `status` varchar(50) NOT NULL,
  `descricao` text DEFAULT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `nfe_id` (`nfe_id`),
  CONSTRAINT `movimentacao_nfe_ibfk_1` FOREIGN KEY (`nfe_id`) REFERENCES `nfe` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- pizzariagraff.contas_pagar_avulsa definição

CREATE TABLE `contas_pagar_avulsa` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `numero_nota` varchar(50) DEFAULT NULL,
  `modelo` varchar(10) DEFAULT NULL,
  `serie` varchar(10) DEFAULT NULL,
  `fornecedor_id` bigint(20) NOT NULL,
  `num_parcela` int(11) NOT NULL DEFAULT 1,
  `valor_parcela` decimal(15,2) NOT NULL,
  `data_emissao` date NOT NULL,
  `data_vencimento` date NOT NULL,
  `data_pagamento` date DEFAULT NULL,
  `valor_pago` decimal(15,2) DEFAULT 0.00,
  `juros` decimal(15,2) DEFAULT 0.00,
  `multa` decimal(15,2) DEFAULT 0.00,
  `desconto` decimal(15,2) DEFAULT 0.00,
  `status` varchar(20) NOT NULL DEFAULT 'PENDENTE',
  `forma_pagamento_id` bigint(20) DEFAULT NULL,
  `observacao` text DEFAULT NULL,
  `data_criacao` timestamp NULL DEFAULT current_timestamp(),
  `data_atualizacao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_contas_pagar_avulsa_vencimento` (`data_vencimento`),
  KEY `idx_contas_pagar_avulsa_status` (`status`),
  KEY `idx_contas_pagar_avulsa_fornecedor` (`fornecedor_id`),
  KEY `fk_contas_pagar_avulsa_fornecedor` (`fornecedor_id`),
  KEY `fk_contas_pagar_avulsa_forma_pagamento` (`forma_pagamento_id`),
  CONSTRAINT `fk_contas_pagar_avulsa_fornecedor` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedor` (`id`),
  CONSTRAINT `fk_contas_pagar_avulsa_forma_pagamento` FOREIGN KEY (`forma_pagamento_id`) REFERENCES `forma_pagamento` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;