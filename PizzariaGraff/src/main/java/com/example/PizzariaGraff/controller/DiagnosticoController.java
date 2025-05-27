package com.example.PizzariaGraff.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import com.example.PizzariaGraff.repository.DatabaseConnection;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import java.sql.DriverManager;

@RestController
@RequestMapping("/diagnostico")
@Tag(name = "Diagnóstico", description = "API para diagnóstico e manutenção do sistema")
public class DiagnosticoController {

    private final DatabaseConnection databaseConnection;
    private final RequestMappingHandlerMapping handlerMapping;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    public DiagnosticoController(DatabaseConnection databaseConnection, RequestMappingHandlerMapping handlerMapping) {
        this.databaseConnection = databaseConnection;
        this.handlerMapping = handlerMapping;
    }

    @GetMapping("/rotas")
    public ResponseEntity<Map<String, Object>> listarRotas() {
        Map<String, Object> response = new HashMap<>();
        Map<String, List<Map<String, String>>> rotasPorController = new TreeMap<>();
        
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = handlerMapping.getHandlerMethods();
        
        for (Map.Entry<RequestMappingInfo, HandlerMethod> entry : handlerMethods.entrySet()) {
            RequestMappingInfo mappingInfo = entry.getKey();
            HandlerMethod handlerMethod = entry.getValue();
            
            String controllerName = handlerMethod.getBeanType().getSimpleName();
            String methodName = handlerMethod.getMethod().getName();
            
            // Ignorar controladores do Spring interno
            if (controllerName.startsWith("Basic") || controllerName.contains("ErrorController")) {
                continue;
            }
            
            if (!rotasPorController.containsKey(controllerName)) {
                rotasPorController.put(controllerName, new ArrayList<>());
            }
            
            Map<String, String> detalhesRota = new HashMap<>();
            detalhesRota.put("metodo", methodName);
            
            if (mappingInfo.getPatternsCondition() != null) {
                detalhesRota.put("padroes", mappingInfo.getPatternsCondition().toString());
            }
            
            if (mappingInfo.getMethodsCondition() != null) {
                detalhesRota.put("httpMethods", mappingInfo.getMethodsCondition().toString());
            }
            
            rotasPorController.get(controllerName).add(detalhesRota);
        }
        
        response.put("totalControllers", rotasPorController.size());
        response.put("controllers", rotasPorController);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verificar-pais")
    public ResponseEntity<Map<String, Object>> verificarPais() {
        Map<String, Object> response = new HashMap<>();
        
        try (Connection conn = databaseConnection.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            
            // 1. Verificar se a tabela país existe
            boolean tabelaPaisExiste = false;
            try (ResultSet rs = metaData.getTables(null, null, "pais", null)) {
                tabelaPaisExiste = rs.next();
            }
            response.put("tabela_pais_existe", tabelaPaisExiste);
            
            if (tabelaPaisExiste) {
                // 2. Verificar registros na tabela país
                try (Statement stmt = conn.createStatement();
                     ResultSet rs = stmt.executeQuery("SELECT id, nome FROM pais")) {
                    
                    List<Map<String, String>> paises = new ArrayList<>();
                    while (rs.next()) {
                        Map<String, String> pais = new HashMap<>();
                        pais.put("id", rs.getString("id"));
                        pais.put("nome", rs.getString("nome"));
                        paises.add(pais);
                    }
                    
                    response.put("paises_encontrados", paises);
                    response.put("total_paises", paises.size());
                }
                
                // 3. Verificar se há registros com ID "1"
                try (Statement stmt = conn.createStatement();
                     ResultSet rs = stmt.executeQuery("SELECT * FROM pais WHERE id = '1'")) {
                    
                    boolean paisIdUmExiste = rs.next();
                    response.put("pais_id_1_existe", paisIdUmExiste);
                    
                    if (paisIdUmExiste) {
                        Map<String, String> paisUm = new HashMap<>();
                        paisUm.put("id", rs.getString("id"));
                        paisUm.put("nome", rs.getString("nome"));
                        paisUm.put("codigo", rs.getString("codigo"));
                        paisUm.put("sigla", rs.getString("sigla"));
                        response.put("pais_id_1", paisUm);
                    }
                }
                
                // 4. Verificar a referência de chave estrangeira na tabela de estados
                List<Map<String, String>> fks = new ArrayList<>();
                try (ResultSet rs = metaData.getExportedKeys(null, null, "pais")) {
                    while (rs.next()) {
                        Map<String, String> fk = new HashMap<>();
                        fk.put("tabela_referenciadora", rs.getString("FKTABLE_NAME"));
                        fk.put("coluna_referenciadora", rs.getString("FKCOLUMN_NAME"));
                        fk.put("coluna_referenciada", rs.getString("PKCOLUMN_NAME"));
                        fks.add(fk);
                    }
                }
                response.put("referencias_fk", fks);
                
                // 5. Verificar se há estados referenciando o país ID "1"
                try {
                    boolean tabelaEstadoExiste = false;
                    try (ResultSet rs = metaData.getTables(null, null, "estado", null)) {
                        tabelaEstadoExiste = rs.next();
                    }
                    
                    if (tabelaEstadoExiste) {
                        try (Statement stmt = conn.createStatement();
                             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM estado WHERE pais_id = '1'")) {
                            
                            if (rs.next()) {
                                int totalEstados = rs.getInt("total");
                                response.put("estados_referenciando_pais_1", totalEstados);
                            }
                        }
                    } else {
                        response.put("tabela_estado_existe", false);
                    }
                } catch (SQLException e) {
                    response.put("erro_verificar_estados", e.getMessage());
                }
            }
            
            response.put("status", "OK");
        } catch (SQLException e) {
            e.printStackTrace();
            response.put("status", "ERRO");
            response.put("mensagem", "Falha ao verificar tabela país: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/corrigir-pais-id")
    public ResponseEntity<Map<String, Object>> corrigirPaisId() {
        Map<String, Object> response = new HashMap<>();
        
        try (Connection conn = databaseConnection.getConnection()) {
            // 1. Verificar se a tabela país existe
            DatabaseMetaData metaData = conn.getMetaData();
            boolean tabelaPaisExiste = false;
            try (ResultSet rs = metaData.getTables(null, null, "pais", null)) {
                tabelaPaisExiste = rs.next();
            }
            
            // 2. Verificar se existe país com ID "1"
            boolean paisIdUmExiste = false;
            if (tabelaPaisExiste) {
                try (Statement stmt = conn.createStatement();
                     ResultSet rs = stmt.executeQuery("SELECT id FROM pais WHERE id = '1'")) {
                    paisIdUmExiste = rs.next();
                }
                
                if (!paisIdUmExiste) {
                    // Tentar atualizar um país existente para ter ID "1"
                    try (Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery("SELECT id FROM pais LIMIT 1")) {
                        
                        if (rs.next()) {
                            String idExistente = rs.getString("id");
                            
                            // Verificar se algum estado referencia este país
                            boolean tabelaEstadoExiste = false;
                            try (ResultSet rsTable = metaData.getTables(null, null, "estado", null)) {
                                tabelaEstadoExiste = rsTable.next();
                            }
                            
                            if (tabelaEstadoExiste) {
                                // Atualizar os estados para usar o novo ID
                                try (PreparedStatement updateEstados = conn.prepareStatement(
                                        "UPDATE estado SET pais_id = '1' WHERE pais_id = ?")) {
                                    updateEstados.setString(1, idExistente);
                                    int estadosAtualizados = updateEstados.executeUpdate();
                                    response.put("estados_atualizados", estadosAtualizados);
                                }
                            }
                            
                            // Atualizar o ID do país
                            try (PreparedStatement updatePais = conn.prepareStatement(
                                    "UPDATE pais SET id = '1' WHERE id = ?")) {
                                updatePais.setString(1, idExistente);
                                int paisAtualizado = updatePais.executeUpdate();
                                response.put("pais_atualizado", paisAtualizado > 0);
                                response.put("id_antigo", idExistente);
                            }
                        } else {
                            // Se não há país, criar um novo com ID "1"
                            try (Statement insertStmt = conn.createStatement()) {
                                String insertBrasil = "INSERT INTO pais (id, nome, codigo, sigla) VALUES " +
                                                    "('1', 'Brasil', '55', 'BR')";
                                insertStmt.execute(insertBrasil);
                                response.put("pais_inserido", true);
                            }
                        }
                    }
                } else {
                    response.put("pais_id_1_ja_existe", true);
                }
            } else {
                // Criar tabela país com ID "1"
                try (Statement stmt = conn.createStatement()) {
                    String createTable = "CREATE TABLE pais (" +
                                        "id VARCHAR(10) PRIMARY KEY, " +
                                        "nome VARCHAR(100) NOT NULL, " + 
                                        "codigo VARCHAR(3), " +
                                        "sigla VARCHAR(2) NOT NULL)";
                    stmt.execute(createTable);
                    
                    String insertBrasil = "INSERT INTO pais (id, nome, codigo, sigla) VALUES " +
                                        "('1', 'Brasil', '55', 'BR')";
                    stmt.execute(insertBrasil);
                    
                    response.put("tabela_pais_criada", true);
                }
            }
            
            // Verificar resultado final
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM pais WHERE id = '1'")) {
                
                if (rs.next()) {
                    Map<String, String> paisFinal = new HashMap<>();
                    paisFinal.put("id", rs.getString("id"));
                    paisFinal.put("nome", rs.getString("nome"));
                    paisFinal.put("codigo", rs.getString("codigo"));
                    paisFinal.put("sigla", rs.getString("sigla"));
                    response.put("pais_final", paisFinal);
                    response.put("correcao_bem_sucedida", true);
                } else {
                    response.put("correcao_bem_sucedida", false);
                }
            }
            
            response.put("status", "OK");
        } catch (SQLException e) {
            e.printStackTrace();
            response.put("status", "ERRO");
            response.put("mensagem", "Falha ao corrigir país: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Verificar status do sistema")
    public ResponseEntity<Map<String, Object>> status() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "Serviço ativo");
        
        // Verificar conexão com o banco de dados
        try {
            databaseConnection.getConnection().close();
            status.put("database", "Conectado");
        } catch (Exception e) {
            status.put("database", "Erro de conexão: " + e.getMessage());
        }
        
        return ResponseEntity.ok(status);
    }

    @GetMapping("/all-endpoints")
    @Operation(summary = "Listar todos os endpoints disponíveis no sistema")
    public ResponseEntity<Map<String, String>> listarTodosEndpoints() {
        Map<String, String> endpoints = new HashMap<>();
        
        // Endpoints de diagnóstico
        endpoints.put("/diagnostico", "Verificar status do sistema");
        endpoints.put("/diagnostico/all-endpoints", "Listar todos os endpoints disponíveis no sistema");
        endpoints.put("/diagnostico/endpoints", "Listar endpoints de diagnóstico");
        endpoints.put("/diagnostico/database", "Verifica a conexão com o banco de dados");
        endpoints.put("/diagnostico/criar-tabela-produtos", "Cria a tabela de produtos se não existir");
        endpoints.put("/diagnostico/criar-tabela-clientes", "Cria a tabela de clientes se não existir");
        endpoints.put("/diagnostico/criar-tabela-fornecedores", "Cria a tabela de fornecedores se não existir");
        endpoints.put("/diagnostico/renomear-tabela-fornecedor", "Renomeia a tabela fornecedor para fornecedores");
        
        // Novos endpoints para criar tabelas
        endpoints.put("/diagnostico/criar-tabela-transportadoras", "Cria a tabela de transportadoras se não existir");
        endpoints.put("/diagnostico/criar-tabela-veiculos", "Cria a tabela de veículos se não existir");
        endpoints.put("/diagnostico/criar-tabela-transp-itens", "Cria a tabela de itens de transportadoras se não existir");
        endpoints.put("/diagnostico/criar-tabela-modalidades-nfe", "Cria a tabela de modalidades de NF-e se não existir");
        endpoints.put("/diagnostico/criar-tabela-movimentacoes-nfe", "Cria a tabela de movimentações de NF-e se não existir");
        endpoints.put("/diagnostico/criar-tabela-produtos-fornecedores", "Cria a tabela de produtos de fornecedores se não existir");
        endpoints.put("/diagnostico/criar-tabela-condicao-pagamento", "Cria a tabela de condições de pagamento se não existir");
        endpoints.put("/diagnostico/criar-tabela-nfe", "Cria a tabela de notas fiscais eletrônicas se não existir");
        endpoints.put("/diagnostico/criar-tabela-categoria", "Cria a tabela de categorias se não existir");
        endpoints.put("/diagnostico/criar-tabela-funcionario", "Cria a tabela de funcionários se não existir");
        
        return ResponseEntity.ok(endpoints);
    }

    @GetMapping("/database")
    @Operation(summary = "Verificar conexão com o banco de dados")
    public ResponseEntity<Map<String, Object>> verificarDatabase() {
        Map<String, Object> response = new HashMap<>();
        try {
            String version = jdbcTemplate.queryForObject("SELECT VERSION()", String.class);
            response.put("conectado", true);
            response.put("versao", version);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("conectado", false);
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/criar-tabela-produtos")
    @Operation(summary = "Criar tabela de produtos se não existir")
    public ResponseEntity<Map<String, Object>> criarTabelaProdutos() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela já existe
            boolean tabelaExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM produtos LIMIT 1", Boolean.class);
                tabelaExiste = true;
            } catch (Exception e) {
                // Tabela não existe, vamos criar
            }

            if (tabelaExiste) {
                response.put("status", "A tabela produtos já existe");
                return ResponseEntity.ok(response);
            }

            // Criar a tabela
            jdbcTemplate.execute("CREATE TABLE produtos (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "codigo VARCHAR(50) NOT NULL, " +
                    "nome VARCHAR(100) NOT NULL, " +
                    "descricao VARCHAR(255), " +
                    "preco DECIMAL(10,2) NOT NULL, " +
                    "ativo BOOLEAN DEFAULT TRUE" +
                    ")");

            // Inserir alguns produtos de exemplo
            jdbcTemplate.update("INSERT INTO produtos (codigo, nome, descricao, preco, ativo) VALUES (?, ?, ?, ?, ?)",
                    "P001", "Pizza de Calabresa", "Pizza tradicional de calabresa", 49.90, true);
            jdbcTemplate.update("INSERT INTO produtos (codigo, nome, descricao, preco, ativo) VALUES (?, ?, ?, ?, ?)",
                    "P002", "Pizza de Mussarela", "Pizza tradicional de mussarela", 44.90, true);
            jdbcTemplate.update("INSERT INTO produtos (codigo, nome, descricao, preco, ativo) VALUES (?, ?, ?, ?, ?)",
                    "P003", "Refrigerante Cola 2L", "Refrigerante sabor cola", 12.90, true);

            response.put("status", "Tabela produtos criada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/criar-tabela-clientes")
    @Operation(summary = "Criar tabela de clientes se não existir")
    public ResponseEntity<Map<String, Object>> criarTabelaClientes() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela já existe
            boolean tabelaExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM clientes LIMIT 1", Boolean.class);
                tabelaExiste = true;
            } catch (Exception e) {
                // Tabela não existe, vamos criar
            }

            if (tabelaExiste) {
                response.put("status", "A tabela clientes já existe");
                return ResponseEntity.ok(response);
            }

            // Criar a tabela
            jdbcTemplate.execute("CREATE TABLE clientes (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "nome VARCHAR(100) NOT NULL, " +
                    "cpf VARCHAR(14), " +
                    "cnpj VARCHAR(18), " +
                    "email VARCHAR(100), " +
                    "telefone VARCHAR(20), " +
                    "endereco VARCHAR(255), " +
                    "numero VARCHAR(20), " +
                    "complemento VARCHAR(100), " +
                    "bairro VARCHAR(100), " +
                    "cep VARCHAR(10), " +
                    "cidade_id BIGINT, " +
                    "ativo BOOLEAN DEFAULT TRUE, " +
                    "FOREIGN KEY (cidade_id) REFERENCES cidades(id)" +
                    ")");

            // Inserir alguns clientes de exemplo
            jdbcTemplate.update("INSERT INTO clientes (nome, cpf, email, telefone, ativo) VALUES (?, ?, ?, ?, ?)",
                    "Cliente Teste 1", "111.222.333-44", "teste1@email.com", "(11) 98765-4321", true);
            jdbcTemplate.update("INSERT INTO clientes (nome, cpf, email, telefone, ativo) VALUES (?, ?, ?, ?, ?)",
                    "Cliente Teste 2", "222.333.444-55", "teste2@email.com", "(11) 91234-5678", true);

            response.put("status", "Tabela clientes criada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/criar-tabela-fornecedores")
    @Operation(summary = "Criar tabela de fornecedores se não existir")
    public ResponseEntity<Map<String, Object>> criarTabelaFornecedores() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela já existe
            boolean tabelaExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM fornecedores LIMIT 1", Boolean.class);
                tabelaExiste = true;
            } catch (Exception e) {
                // Tabela não existe, vamos criar
            }

            if (tabelaExiste) {
                response.put("status", "A tabela fornecedores já existe");
                return ResponseEntity.ok(response);
            }

            // Criar a tabela
            jdbcTemplate.execute("CREATE TABLE fornecedores (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "razao_social VARCHAR(100) NOT NULL, " +
                    "nome_fantasia VARCHAR(100), " +
                    "cnpj VARCHAR(18) NOT NULL, " +
                    "email VARCHAR(100), " +
                    "telefone VARCHAR(20), " +
                    "endereco VARCHAR(255), " +
                    "numero VARCHAR(20), " +
                    "complemento VARCHAR(100), " +
                    "bairro VARCHAR(100), " +
                    "cep VARCHAR(10), " +
                    "cidade_id BIGINT, " +
                    "ativo BOOLEAN DEFAULT TRUE, " +
                    "FOREIGN KEY (cidade_id) REFERENCES cidades(id)" +
                    ")");

            // Inserir alguns fornecedores de exemplo
            jdbcTemplate.update("INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, email, telefone, ativo) VALUES (?, ?, ?, ?, ?, ?)",
                    "Fornecedor Teste LTDA", "Fornecedor Teste", "12.345.678/0001-90", "fornecedor1@email.com", "(11) 3456-7890", true);
            jdbcTemplate.update("INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, email, telefone, ativo) VALUES (?, ?, ?, ?, ?, ?)",
                    "Distribuidor Alimentos Ltda", "Distrib Alimentos", "98.765.432/0001-10", "distribuidor@email.com", "(11) 2345-6789", true);

            response.put("status", "Tabela fornecedores criada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/renomear-tabela-fornecedor")
    @Operation(summary = "Renomear tabela fornecedor para fornecedores")
    public ResponseEntity<Map<String, Object>> renomearTabelaFornecedor() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela fornecedor existe
            boolean tabelaFornecedorExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM fornecedor LIMIT 1", Boolean.class);
                tabelaFornecedorExiste = true;
            } catch (Exception e) {
                // Tabela não existe
            }

            // Verificar se a tabela fornecedores já existe
            boolean tabelaFornecedoresExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM fornecedores LIMIT 1", Boolean.class);
                tabelaFornecedoresExiste = true;
            } catch (Exception e) {
                // Tabela não existe
            }

            if (!tabelaFornecedorExiste) {
                response.put("status", "A tabela fornecedor não existe para ser renomeada");
                return ResponseEntity.ok(response);
            }

            if (tabelaFornecedoresExiste) {
                response.put("status", "A tabela fornecedores já existe, não é possível renomear");
                return ResponseEntity.ok(response);
            }

            // Desabilitar verificação de chaves estrangeiras temporariamente
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            
            // Renomear a tabela
            jdbcTemplate.execute("RENAME TABLE fornecedor TO fornecedores");

            // Reabilitar verificação de chaves estrangeiras
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

            response.put("status", "Tabela fornecedor renomeada para fornecedores com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Garantir que a verificação de chaves estrangeiras seja reabilitada mesmo em caso de erro
            try {
                jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            } catch (Exception ignored) {
                // Ignorar erro ao reabilitar chaves
            }
            
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/criar-tabela-transportadoras")
    @Operation(summary = "Criar tabela de transportadoras se não existir")
    public ResponseEntity<Map<String, Object>> criarTabelaTransportadoras() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela já existe
            boolean tabelaExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM transportadoras LIMIT 1", Boolean.class);
                tabelaExiste = true;
            } catch (Exception e) {
                // Tabela não existe, vamos criar
            }

            if (tabelaExiste) {
                response.put("status", "A tabela transportadoras já existe");
                return ResponseEntity.ok(response);
            }

            // Criar a tabela
            jdbcTemplate.execute("CREATE TABLE transportadoras (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "razao_social VARCHAR(100) NOT NULL, " +
                    "nome_fantasia VARCHAR(100), " +
                    "cnpj VARCHAR(18) NOT NULL, " +
                    "email VARCHAR(100), " +
                    "telefone VARCHAR(20), " +
                    "endereco VARCHAR(255), " +
                    "cidade_id BIGINT, " +
                    "ativo BOOLEAN DEFAULT TRUE, " +
                    "FOREIGN KEY (cidade_id) REFERENCES cidades(id)" +
                    ")");

            // Inserir algumas transportadoras de exemplo
            jdbcTemplate.update("INSERT INTO transportadoras (razao_social, nome_fantasia, cnpj, email, telefone, ativo) VALUES (?, ?, ?, ?, ?, ?)",
                    "Transportadora Rápida LTDA", "Trans Rápida", "12.345.678/0001-90", "transrapida@email.com", "(11) 3456-7890", true);
            jdbcTemplate.update("INSERT INTO transportadoras (razao_social, nome_fantasia, cnpj, email, telefone, ativo) VALUES (?, ?, ?, ?, ?, ?)",
                    "Entregas Expressas S.A.", "Expressas", "98.765.432/0001-10", "expressas@email.com", "(11) 2345-6789", true);

            response.put("status", "Tabela transportadoras criada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/criar-tabela-veiculos")
    @Operation(summary = "Criar tabela de veículos se não existir")
    public ResponseEntity<Map<String, Object>> criarTabelaVeiculos() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela já existe
            boolean tabelaExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM veiculo LIMIT 1", Boolean.class);
                tabelaExiste = true;
            } catch (Exception e) {
                // Tabela não existe, vamos criar
            }

            if (tabelaExiste) {
                response.put("status", "A tabela veiculo já existe");
                return ResponseEntity.ok(response);
            }

            // Criar a tabela
            jdbcTemplate.execute("CREATE TABLE veiculo (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "placa VARCHAR(10) NOT NULL, " +
                    "modelo VARCHAR(50) NOT NULL, " +
                    "marca VARCHAR(50) NOT NULL, " +
                    "ano INT, " +
                    "capacidade DECIMAL(10,2), " +
                    "transportadora_id BIGINT, " +
                    "ativo BOOLEAN DEFAULT TRUE, " +
                    "FOREIGN KEY (transportadora_id) REFERENCES transportadora(id)" +
                    ")");

            // Inserir alguns veículos de exemplo
            jdbcTemplate.update("INSERT INTO veiculo (placa, modelo, marca, ano, capacidade, ativo) VALUES (?, ?, ?, ?, ?, ?)",
                    "ABC-1234", "Fiorino", "Fiat", 2020, 500.00, true);
            jdbcTemplate.update("INSERT INTO veiculo (placa, modelo, marca, ano, capacidade, ativo) VALUES (?, ?, ?, ?, ?, ?)",
                    "XYZ-9876", "HR", "Hyundai", 2021, 1500.00, true);

            response.put("status", "Tabela veiculo criada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/criar-tabela-transp-itens")
    @Operation(summary = "Criar tabela de itens de transportadoras se não existir")
    public ResponseEntity<Map<String, Object>> criarTabelaTranspItens() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela já existe
            boolean tabelaExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM transp_item LIMIT 1", Boolean.class);
                tabelaExiste = true;
            } catch (Exception e) {
                // Tabela não existe, vamos criar
            }

            if (tabelaExiste) {
                response.put("status", "A tabela transp_item já existe");
                return ResponseEntity.ok(response);
            }

            // Criar a tabela
            jdbcTemplate.execute("CREATE TABLE transp_item (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "codigo VARCHAR(50) NOT NULL, " +
                    "descricao VARCHAR(255) NOT NULL, " +
                    "transportadora_id BIGINT, " +
                    "codigo_transp VARCHAR(50), " +
                    "ativo BOOLEAN DEFAULT TRUE, " +
                    "FOREIGN KEY (transportadora_id) REFERENCES transportadora(id)" +
                    ")");

            // Inserir alguns itens de exemplo
            jdbcTemplate.update("INSERT INTO transp_item (codigo, descricao, codigo_transp, ativo) VALUES (?, ?, ?, ?)",
                    "IT001", "Caixa Padrão", "CX001", true);
            jdbcTemplate.update("INSERT INTO transp_item (codigo, descricao, codigo_transp, ativo) VALUES (?, ?, ?, ?)",
                    "IT002", "Embalagem Térmica", "EMB002", true);

            response.put("status", "Tabela transp_item criada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/criar-tabela-modalidades-nfe")
    @Operation(summary = "Criar tabela de modalidades de NF-e se não existir")
    public ResponseEntity<Map<String, Object>> criarTabelaModalidadesNfe() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela já existe
            boolean tabelaExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM modalidade_nfe LIMIT 1", Boolean.class);
                tabelaExiste = true;
            } catch (Exception e) {
                // Tabela não existe, vamos criar
            }

            if (tabelaExiste) {
                response.put("status", "A tabela modalidade_nfe já existe");
                return ResponseEntity.ok(response);
            }

            // Criar a tabela
            jdbcTemplate.execute("CREATE TABLE modalidade_nfe (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "codigo VARCHAR(10) NOT NULL, " +
                    "descricao VARCHAR(100) NOT NULL, " +
                    "ativo BOOLEAN DEFAULT TRUE" +
                    ")");

            // Inserir algumas modalidades de exemplo
            jdbcTemplate.update("INSERT INTO modalidade_nfe (codigo, descricao, ativo) VALUES (?, ?, ?)",
                    "0", "Contratação do Frete por conta do Remetente (CIF)", true);
            jdbcTemplate.update("INSERT INTO modalidade_nfe (codigo, descricao, ativo) VALUES (?, ?, ?)",
                    "1", "Contratação do Frete por conta do Destinatário (FOB)", true);
            jdbcTemplate.update("INSERT INTO modalidade_nfe (codigo, descricao, ativo) VALUES (?, ?, ?)",
                    "2", "Contratação do Frete por conta de Terceiros", true);
            jdbcTemplate.update("INSERT INTO modalidade_nfe (codigo, descricao, ativo) VALUES (?, ?, ?)",
                    "3", "Transporte Próprio por conta do Remetente", true);
            jdbcTemplate.update("INSERT INTO modalidade_nfe (codigo, descricao, ativo) VALUES (?, ?, ?)",
                    "4", "Transporte Próprio por conta do Destinatário", true);
            jdbcTemplate.update("INSERT INTO modalidade_nfe (codigo, descricao, ativo) VALUES (?, ?, ?)",
                    "9", "Sem Ocorrência de Transporte", true);

            response.put("status", "Tabela modalidade_nfe criada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/criar-tabela-movimentacoes-nfe")
    @Operation(summary = "Criar tabela de movimentações de NF-e se não existir")
    public ResponseEntity<Map<String, Object>> criarTabelaMovimentacoesNfe() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela já existe
            boolean tabelaExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM movimentacao_nfe LIMIT 1", Boolean.class);
                tabelaExiste = true;
            } catch (Exception e) {
                // Tabela não existe, vamos criar
            }

            if (tabelaExiste) {
                response.put("status", "A tabela movimentacao_nfe já existe");
                return ResponseEntity.ok(response);
            }

            // Criar a tabela
            jdbcTemplate.execute("CREATE TABLE movimentacao_nfe (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "nfe_id BIGINT, " +
                    "data_movimentacao DATETIME NOT NULL, " +
                    "status VARCHAR(50) NOT NULL, " +
                    "descricao TEXT, " +
                    "FOREIGN KEY (nfe_id) REFERENCES nfe(id)" +
                    ")");

            response.put("status", "Tabela movimentacao_nfe criada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/criar-tabela-produtos-fornecedores")
    @Operation(summary = "Criar tabela de produtos de fornecedores se não existir")
    public ResponseEntity<Map<String, Object>> criarTabelaProdutosFornecedores() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela já existe
            boolean tabelaExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM produto_fornecedor LIMIT 1", Boolean.class);
                tabelaExiste = true;
            } catch (Exception e) {
                // Tabela não existe, vamos criar
            }

            if (tabelaExiste) {
                response.put("status", "A tabela produto_fornecedor já existe");
                return ResponseEntity.ok(response);
            }

            // Criar a tabela
            jdbcTemplate.execute("CREATE TABLE produto_fornecedor (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "produto_id BIGINT NOT NULL, " +
                    "fornecedor_id BIGINT NOT NULL, " +
                    "codigo_prod VARCHAR(50), " +
                    "custo DECIMAL(10,2), " +
                    "ativo BOOLEAN DEFAULT TRUE, " +
                    "FOREIGN KEY (produto_id) REFERENCES produto(id), " +
                    "FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)" +
                    ")");

            response.put("status", "Tabela produto_fornecedor criada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/criar-tabela-condicao-pagamento")
    @Operation(summary = "Criar tabela de condições de pagamento se não existir")
    public ResponseEntity<Map<String, Object>> criarTabelaCondicaoPagamento() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela já existe
            boolean tabelaExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM condicao_pagamento LIMIT 1", Boolean.class);
                tabelaExiste = true;
            } catch (Exception e) {
                // Tabela não existe, vamos criar
            }

            if (tabelaExiste) {
                response.put("status", "A tabela condicao_pagamento já existe");
                return ResponseEntity.ok(response);
            }

            // Criar a tabela
            jdbcTemplate.execute("CREATE TABLE condicao_pagamento (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "nome VARCHAR(100) NOT NULL, " +
                    "parcelas INT NOT NULL DEFAULT 1, " +
                    "ativo BOOLEAN DEFAULT TRUE" +
                    ")");

            // Inserir algumas condições de pagamento de exemplo
            jdbcTemplate.update("INSERT INTO condicao_pagamento (nome, parcelas, ativo) VALUES (?, ?, ?)",
                    "À Vista", 1, true);
            jdbcTemplate.update("INSERT INTO condicao_pagamento (nome, parcelas, ativo) VALUES (?, ?, ?)",
                    "2x sem juros", 2, true);
            jdbcTemplate.update("INSERT INTO condicao_pagamento (nome, parcelas, ativo) VALUES (?, ?, ?)",
                    "3x sem juros", 3, true);

            response.put("status", "Tabela condicao_pagamento criada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/criar-tabela-nfe")
    @Operation(summary = "Criar tabela de notas fiscais eletrônicas se não existir")
    public ResponseEntity<Map<String, Object>> criarTabelaNfe() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Verificar se a tabela já existe
            boolean tabelaExiste = false;
            try {
                jdbcTemplate.queryForObject("SELECT 1 FROM nfe LIMIT 1", Boolean.class);
                tabelaExiste = true;
            } catch (Exception e) {
                // Tabela não existe, vamos criar
            }

            if (tabelaExiste) {
                response.put("status", "A tabela nfe já existe");
                return ResponseEntity.ok(response);
            }

            // Criar a tabela
            jdbcTemplate.execute("CREATE TABLE nfe (" +
                    "id BIGINT PRIMARY KEY AUTO_INCREMENT, " +
                    "numero VARCHAR(50) NOT NULL, " +
                    "serie VARCHAR(3) NOT NULL, " +
                    "chave_acesso VARCHAR(44), " +
                    "data_emissao DATETIME NOT NULL, " +
                    "cliente_id BIGINT, " +
                    "valor_total DECIMAL(10,2) NOT NULL, " +
                    "forma_pagamento_id BIGINT, " +
                    "condicao_pagamento_id BIGINT, " +
                    "transportadora_id BIGINT, " +
                    "veiculo_id BIGINT, " +
                    "modalidade_id BIGINT, " +
                    "cancelada BOOLEAN DEFAULT FALSE, " +
                    "FOREIGN KEY (cliente_id) REFERENCES cliente(id), " +
                    "FOREIGN KEY (forma_pagamento_id) REFERENCES forma_pagamento(id), " +
                    "FOREIGN KEY (condicao_pagamento_id) REFERENCES condicao_pagamento(id), " +
                    "FOREIGN KEY (transportadora_id) REFERENCES transportadora(id), " +
                    "FOREIGN KEY (veiculo_id) REFERENCES veiculo(id), " +
                    "FOREIGN KEY (modalidade_id) REFERENCES modalidade_nfe(id)" +
                    ")");

            response.put("status", "Tabela nfe criada com sucesso");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/criar-tabela-categoria")
    public String criarTabelaCategoria() {
        String sql = "CREATE TABLE IF NOT EXISTS categoria (" +
                "id SERIAL PRIMARY KEY, " +
                "nome VARCHAR(255) NOT NULL, " +
                "ativo BOOLEAN DEFAULT true" +
                ")";
        
        jdbcTemplate.execute(sql);
        return "Tabela Categoria criada com sucesso!";
    }

    @GetMapping("/criar-tabela-funcionario")
    public String criarTabelaFuncionario() {
        String sql = "CREATE TABLE IF NOT EXISTS funcionario (" +
                "id SERIAL PRIMARY KEY, " +
                "nome VARCHAR(255) NOT NULL, " +
                "cpf VARCHAR(20), " +
                "rg VARCHAR(20), " +
                "data_nascimento DATE, " +
                "telefone VARCHAR(20), " +
                "email VARCHAR(255), " +
                "endereco VARCHAR(255), " +
                "numero VARCHAR(20), " +
                "complemento VARCHAR(255), " +
                "bairro VARCHAR(255), " +
                "cep VARCHAR(20), " +
                "cidade_id INTEGER REFERENCES cidade(id), " +
                "cargo VARCHAR(100), " +
                "data_admissao DATE, " +
                "data_demissao DATE, " +
                "ativo BOOLEAN DEFAULT true" +
                ")";
        
        jdbcTemplate.execute(sql);
        return "Tabela Funcionario criada com sucesso!";
    }

    @GetMapping("/banco")
    @Operation(summary = "Verifica a conexão com o banco de dados")
    public ResponseEntity<?> verificarBanco() {
        Map<String, Object> response = new HashMap<>();
        response.put("jdbcUrl", jdbcUrl);
        
        try {
            // Tentar conexão direta
            Connection conn = DriverManager.getConnection(jdbcUrl, username, password);
            response.put("status", "Conexão estabelecida com sucesso");
            
            // Verificar tabelas
            Statement stmt = conn.createStatement();
            
            // Verificar se a tabela forma_pagamento existe, se não existir, criar
            try {
                stmt.execute("SELECT 1 FROM forma_pagamento LIMIT 1");
                response.put("tabela_forma_pagamento", "Tabela existe");
            } catch (Exception e) {
                // Tabela não existe, tentar criar
                try {
                    stmt.execute("CREATE TABLE IF NOT EXISTS forma_pagamento (" +
                            "id BIGINT PRIMARY KEY AUTO_INCREMENT, " +
                            "descricao VARCHAR(100) NOT NULL, " +
                            "ativo BOOLEAN DEFAULT TRUE, " +
                            "data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "ultima_modificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)");
                    
                    stmt.execute("INSERT INTO forma_pagamento (descricao, ativo) VALUES " +
                            "('Dinheiro', true), " +
                            "('Cartão de Crédito', true), " +
                            "('Cartão de Débito', true), " +
                            "('PIX', true)");
                    
                    response.put("tabela_forma_pagamento", "Tabela criada com dados iniciais");
                } catch (Exception e2) {
                    response.put("tabela_forma_pagamento_erro", e2.getMessage());
                }
            }
            
            conn.close();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "Erro ao conectar");
            response.put("erro", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/atualizar-forma-pagamento")
    @Operation(summary = "Atualiza a estrutura da tabela forma_pagamento")
    public ResponseEntity<?> atualizarFormaPagamento() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Connection conn = null;
            Statement stmt = null;
            
            try {
                // Verificar conexão
                conn = DriverManager.getConnection(jdbcUrl, username, password);
                stmt = conn.createStatement();
                
                // Verificar se a tabela existe
                boolean tabelaExiste = false;
                try {
                    stmt.executeQuery("SELECT 1 FROM forma_pagamento LIMIT 1");
                    tabelaExiste = true;
                } catch (SQLException e) {
                    response.put("status", "Tabela forma_pagamento não existe");
                    // Criar a tabela completa
                    stmt.execute("CREATE TABLE forma_pagamento (" +
                            "id BIGINT PRIMARY KEY AUTO_INCREMENT, " +
                            "nome VARCHAR(100) NOT NULL, " +
                            "descricao VARCHAR(100) NOT NULL, " +
                            "ativo BOOLEAN DEFAULT TRUE, " +
                            "data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "ultima_modificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)");
                    
                    stmt.execute("INSERT INTO forma_pagamento (nome, descricao, ativo) VALUES " +
                            "('Dinheiro', 'Pagamento em dinheiro', true), " +
                            "('Cartão de Crédito', 'Pagamento com cartão de crédito', true), " +
                            "('Cartão de Débito', 'Pagamento com cartão de débito', true), " +
                            "('PIX', 'Pagamento via PIX', true)");
                    
                    response.put("tabela_criada", "Tabela forma_pagamento criada com estrutura completa");
                    return ResponseEntity.ok(response);
                }
                
                // Verificar se o campo nome já existe
                boolean campoNomeExiste = false;
                try {
                    ResultSet rs = stmt.executeQuery("SELECT nome FROM forma_pagamento LIMIT 1");
                    campoNomeExiste = true;
                    rs.close();
                } catch (SQLException e) {
                    // Campo não existe
                }
                
                if (!campoNomeExiste) {
                    // Adicionar o campo nome
                    stmt.execute("ALTER TABLE forma_pagamento ADD COLUMN nome VARCHAR(100) NOT NULL DEFAULT 'Nome Padrão' AFTER id");
                    
                    // Atualizar o campo nome com base na descrição para formas de pagamento existentes
                    stmt.execute("UPDATE forma_pagamento SET nome = descricao");
                    
                    response.put("campo_adicionado", "Campo 'nome' adicionado à tabela forma_pagamento");
                } else {
                    response.put("campo_existe", "Campo 'nome' já existe na tabela forma_pagamento");
                }
                
                response.put("status", "OK");
                return ResponseEntity.ok(response);
            } finally {
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            }
        } catch (Exception e) {
            response.put("erro", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
} 