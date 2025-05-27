package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.repository.DatabaseConnection;
import com.example.PizzariaGraff.model.FormaPagamento;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FormaPagamentoRepository {
    
    private final DatabaseConnection databaseConnection;
    
    public FormaPagamentoRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
        verificarEstruturaBanco();
    }
    
    // Método para verificar e corrigir a estrutura da tabela
    private void verificarEstruturaBanco() {
        try (Connection conn = databaseConnection.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            
            // Verificar se a tabela existe
            boolean tabelaExiste = false;
            try (ResultSet rs = metaData.getTables(null, null, null, new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    System.out.println("Tabela encontrada: " + tableName);
                    if ("forma_pagamento".equalsIgnoreCase(tableName)) {
                        tabelaExiste = true;
                        break;
                    }
                }
            }
            
            if (tabelaExiste) {
                // Verificar se as colunas de data existem
                boolean temDataCadastro = false;
                boolean temUltimaModificacao = false;
                
                try (ResultSet colunas = metaData.getColumns(null, null, "forma_pagamento", null)) {
                    System.out.println("Verificando colunas da tabela forma_pagamento:");
                    while (colunas.next()) {
                        String colName = colunas.getString("COLUMN_NAME");
                        String colType = colunas.getString("TYPE_NAME");
                        System.out.println("  - Coluna: " + colName + ", Tipo: " + colType);
                        
                        if ("data_cadastro".equalsIgnoreCase(colName)) {
                            temDataCadastro = true;
                        } else if ("ultima_modificacao".equalsIgnoreCase(colName)) {
                            temUltimaModificacao = true;
                        }
                    }
                }
                
                if (!temDataCadastro || !temUltimaModificacao) {
                    System.out.println("Adicionando colunas de data à tabela forma_pagamento");
                    try (Statement stmt = conn.createStatement()) {
                        if (!temDataCadastro) {
                            stmt.execute("ALTER TABLE forma_pagamento ADD COLUMN data_cadastro TIMESTAMP");
                            System.out.println("Coluna data_cadastro adicionada à tabela forma_pagamento");
                            stmt.execute("UPDATE forma_pagamento SET data_cadastro = CURRENT_TIMESTAMP");
                            System.out.println("Registros atualizados com data_cadastro atual");
                        }
                        
                        if (!temUltimaModificacao) {
                            stmt.execute("ALTER TABLE forma_pagamento ADD COLUMN ultima_modificacao TIMESTAMP");
                            System.out.println("Coluna ultima_modificacao adicionada à tabela forma_pagamento");
                            stmt.execute("UPDATE forma_pagamento SET ultima_modificacao = CURRENT_TIMESTAMP");
                            System.out.println("Registros atualizados com ultima_modificacao atual");
                        }
                    }
                }
            } else {
                System.out.println("Tabela 'forma_pagamento' não existe, será criada quando necessário");
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/modificar estrutura da tabela forma_pagamento: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public List<FormaPagamento> findAll() {
        System.out.println("Iniciando busca de todas as formas de pagamento");
        try {
            return findAllByOrderByDescricaoAsc();
        } catch (Exception e) {
            System.err.println("Erro crítico ao buscar formas de pagamento: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public List<FormaPagamento> findAllByOrderByDescricaoAsc() {
        List<FormaPagamento> formas = new ArrayList<>();
        String sql = "SELECT * FROM forma_pagamento ORDER BY descricao ASC";
        
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;
        
        try {
            System.out.println("Tentando obter conexão com o banco de dados...");
            conn = databaseConnection.getConnection();
            System.out.println("Conexão obtida com sucesso!");
            
            System.out.println("Criando statement...");
            stmt = conn.createStatement();
            
            System.out.println("Executando query: " + sql);
            rs = stmt.executeQuery(sql);
            
            System.out.println("Processando resultados...");
            while (rs.next()) {
                formas.add(mapResultSetToFormaPagamento(rs));
            }
            System.out.println("Resultados processados com sucesso. Total de registros: " + formas.size());
        } catch (SQLException e) {
            System.err.println("Erro SQL ao buscar formas de pagamento: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar formas de pagamento", e);
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
                System.out.println("Recursos liberados com sucesso");
            } catch (SQLException e) {
                System.err.println("Erro ao fechar recursos: " + e.getMessage());
            }
        }
        
        return formas;
    }
    
    public List<FormaPagamento> findByAtivoTrue() {
        List<FormaPagamento> formas = new ArrayList<>();
        String sql = "SELECT * FROM forma_pagamento WHERE ativo = true ORDER BY descricao ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                formas.add(mapResultSetToFormaPagamento(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar formas de pagamento ativas", e);
        }
        
        return formas;
    }
    
    public Optional<FormaPagamento> findById(Long id) {
        String sql = "SELECT * FROM forma_pagamento WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToFormaPagamento(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar forma de pagamento por ID", e);
        }
        
        return Optional.empty();
    }
    
    public FormaPagamento save(FormaPagamento formaPagamento) {
        if (formaPagamento.getId() == null) {
            return insert(formaPagamento);
        } else {
            return update(formaPagamento);
        }
    }
    
    private FormaPagamento insert(FormaPagamento formaPagamento) {
        String sql = "INSERT INTO forma_pagamento (nome, descricao, ativo, data_cadastro, ultima_modificacao) VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, formaPagamento.getNome());
            stmt.setString(2, formaPagamento.getDescricao());
            stmt.setBoolean(3, formaPagamento.getAtivo());
            stmt.setTimestamp(4, Timestamp.valueOf(now));
            stmt.setTimestamp(5, Timestamp.valueOf(now));
            
            stmt.executeUpdate();
            
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                formaPagamento.setId(rs.getLong(1));
                formaPagamento.setDataCadastro(now);
                formaPagamento.setUltimaModificacao(now);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir forma de pagamento", e);
        }
        
        return formaPagamento;
    }
    
    private FormaPagamento update(FormaPagamento formaPagamento) {
        String sql = "UPDATE forma_pagamento SET nome = ?, descricao = ?, ativo = ?, ultima_modificacao = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, formaPagamento.getNome());
            stmt.setString(2, formaPagamento.getDescricao());
            stmt.setBoolean(3, formaPagamento.getAtivo());
            stmt.setTimestamp(4, Timestamp.valueOf(now));
            stmt.setLong(5, formaPagamento.getId());
            
            stmt.executeUpdate();
            
            formaPagamento.setUltimaModificacao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar forma de pagamento", e);
        }
        
        return formaPagamento;
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM forma_pagamento WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar forma de pagamento", e);
        }
    }
    
    public List<FormaPagamento> findByDescricaoContainingIgnoreCase(String termo) {
        List<FormaPagamento> formas = new ArrayList<>();
        String sql = "SELECT * FROM forma_pagamento WHERE LOWER(descricao) LIKE LOWER(?) ORDER BY descricao ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, "%" + termo + "%");
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                formas.add(mapResultSetToFormaPagamento(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao pesquisar formas de pagamento", e);
        }
        
        return formas;
    }
    
    private FormaPagamento mapResultSetToFormaPagamento(ResultSet rs) throws SQLException {
        FormaPagamento formaPagamento = new FormaPagamento();
        formaPagamento.setId(rs.getLong("id"));
        formaPagamento.setNome(rs.getString("nome"));
        formaPagamento.setDescricao(rs.getString("descricao"));
        formaPagamento.setAtivo(rs.getBoolean("ativo"));
        
        Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
        if (dataCadastroTimestamp != null) {
            formaPagamento.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
        }
        
        Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
        if (ultimaModificacaoTimestamp != null) {
            formaPagamento.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
        }
        
        return formaPagamento;
    }
    
    public Connection getConnection() throws SQLException {
        return databaseConnection.getConnection();
    }
} 