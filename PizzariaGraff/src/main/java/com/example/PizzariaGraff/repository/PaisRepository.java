package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.repository.DatabaseConnection;
import com.example.PizzariaGraff.model.Pais;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class PaisRepository {
    
    private final DatabaseConnection databaseConnection;
    
    public PaisRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
        verificarEstruturaBanco();
    }
    
    /**
     * Retorna uma conexão com o banco de dados
     * @return Connection ativa para o banco de dados
     * @throws SQLException em caso de erro ao obter a conexão
     */
    public Connection getConnection() throws SQLException {
        return databaseConnection.getConnection();
    }
    
    // Método para verificar e corrigir a estrutura da tabela
    private void verificarEstruturaBanco() {
        try {
            Connection conn = databaseConnection.getConnection();
            DatabaseMetaData metaData = conn.getMetaData();
            
            // Verificar se a coluna ativo existe
            boolean temAtivo = false;
            
            try (ResultSet colunas = metaData.getColumns(null, null, "pais", "ativo")) {
                temAtivo = colunas.next();
            }
            
            if (!temAtivo) {
                System.out.println("Adicionando coluna ativo à tabela pais");
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("ALTER TABLE pais ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT true");
                    System.out.println("Coluna ativo adicionada à tabela pais");
                    stmt.execute("UPDATE pais SET ativo = true");
                    System.out.println("Registros atualizados com ativo = true");
                }
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/modificar estrutura da tabela pais: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public List<Pais> findAll() {
        List<Pais> paises = new ArrayList<>();
        // Adicionando verificação da existência da tabela pais
        try (Connection conn = databaseConnection.getConnection()) {
            System.out.println("Verificando tabelas disponíveis no banco de dados:");
            DatabaseMetaData metaData = conn.getMetaData();
            boolean tabelaEncontrada = false;
            
            try (ResultSet rs = metaData.getTables(null, null, null, new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    System.out.println("Tabela encontrada: " + tableName);
                    if ("pais".equalsIgnoreCase(tableName)) {
                        tabelaEncontrada = true;
                    }
                }
            }
            
            if (!tabelaEncontrada) {
                System.out.println("AVISO: Tabela 'pais' não encontrada no banco de dados!");
                // Se a tabela não existir, podemos criar
                try (Statement stmt = conn.createStatement()) {
                    String createTable = "CREATE TABLE IF NOT EXISTS pais (" +
                                         "id VARCHAR(10) PRIMARY KEY, " +
                                         "nome VARCHAR(100) NOT NULL, " + 
                                         "codigo VARCHAR(3), " +
                                         "sigla VARCHAR(2) NOT NULL, " +
                                         "data_cadastro TIMESTAMP, " +
                                         "ultima_modificacao TIMESTAMP)";
                    stmt.execute(createTable);
                    System.out.println("Tabela 'pais' criada com sucesso!");
                    
                    // Verificar se as colunas de data existem
                    try (ResultSet colunas = metaData.getColumns(null, null, "pais", "data_cadastro")) {
                        if (!colunas.next()) {
                            // Adicionar coluna data_cadastro se não existir
                            stmt.execute("ALTER TABLE pais ADD COLUMN data_cadastro TIMESTAMP");
                            System.out.println("Coluna 'data_cadastro' adicionada à tabela 'pais'");
                        }
                    }
                    
                    try (ResultSet colunas = metaData.getColumns(null, null, "pais", "ultima_modificacao")) {
                        if (!colunas.next()) {
                            // Adicionar coluna ultima_modificacao se não existir
                            stmt.execute("ALTER TABLE pais ADD COLUMN ultima_modificacao TIMESTAMP");
                            System.out.println("Coluna 'ultima_modificacao' adicionada à tabela 'pais'");
                        }
                    }
                    
                    // Inserir um registro inicial com ID simples
                    LocalDateTime now = LocalDateTime.now();
                    String insertBrasil = "INSERT INTO pais (id, nome, codigo, sigla, data_cadastro, ultima_modificacao) " +
                                         "VALUES ('1', 'Brasil', '55', 'BR', ?, ?)";
                    
                    PreparedStatement pstmt = conn.prepareStatement(insertBrasil);
                    pstmt.setTimestamp(1, Timestamp.valueOf(now));
                    pstmt.setTimestamp(2, Timestamp.valueOf(now));
                    pstmt.executeUpdate();
                    pstmt.close();
                    
                    System.out.println("Registro inicial inserido com data_cadastro: " + now);
                }
            } else {
                // Verificar estrutura da tabela
                try (ResultSet colunas = metaData.getColumns(null, null, "pais", null)) {
                    System.out.println("Estrutura da tabela 'pais':");
                    while (colunas.next()) {
                        String colName = colunas.getString("COLUMN_NAME");
                        String colType = colunas.getString("TYPE_NAME");
                        System.out.println("  - Coluna: " + colName + ", Tipo: " + colType);
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            System.out.println("Erro ao verificar tabelas: " + e.getMessage());
        }
        
        // Agora realizar a consulta
        String sql = "SELECT * FROM pais ORDER BY nome ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement()) {
             
            System.out.println("PaisRepository.findAll() - Executando consulta: " + sql);
            ResultSet rs = stmt.executeQuery(sql);
            
            while (rs.next()) {
                try {
                    Pais pais = mapResultSetToPais(rs);
                    System.out.println("PaisRepository.findAll() - País carregado: " + pais.getNome() + 
                                     ", Data cadastro: " + pais.getDataCadastro() + 
                                     ", Última modificação: " + pais.getUltimaModificacao());
                    paises.add(pais);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear país do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            rs.close();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar países: " + e.getMessage(), e);
        }
        
        return paises;
    }
    
    public Optional<Pais> findById(Long id) {
        System.out.println("PaisRepository: Buscando país com ID: " + id);
        String sql = "SELECT * FROM pais WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            System.out.println("PaisRepository: Executando SQL: " + sql.replace("?", String.valueOf(id)));
            
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                try {
                    Pais pais = mapResultSetToPais(rs);
                    System.out.println("PaisRepository: País encontrado: " + pais.getNome() + " (ID: " + pais.getId() + ")");
                    System.out.println("PaisRepository: Data cadastro: " + pais.getDataCadastro());
                    System.out.println("PaisRepository: Última modificação: " + pais.getUltimaModificacao());
                    return Optional.of(pais);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear país do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("PaisRepository: Nenhum país encontrado com ID: " + id);
                
                // Verificar se a tabela existe e tem registros
                try (Statement checkStmt = conn.createStatement();
                     ResultSet countRs = checkStmt.executeQuery("SELECT COUNT(*) as total FROM pais")) {
                    
                    if (countRs.next()) {
                        int total = countRs.getInt("total");
                        System.out.println("PaisRepository: Total de países na tabela: " + total);
                    }
                }
            }
            
            rs.close();
        } catch (SQLException e) {
            e.printStackTrace();
            System.err.println("PaisRepository: Erro ao buscar país por ID: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("PaisRepository: Causa: " + e.getCause().getMessage());
            }
            throw new RuntimeException("Erro ao buscar país por ID: " + e.getMessage(), e);
        }
        
        return Optional.empty();
    }
    
    public Pais save(Pais pais) {
        if (pais.getId() == null) {
            return insert(pais);
        } else {
            return update(pais);
        }
    }
    
    private Pais insert(Pais pais) {
        LocalDateTime now = LocalDateTime.now();
        pais.setDataCadastro(now);
        pais.setUltimaModificacao(now);
        
        // Garantir que o campo ativo nunca seja null
        if (pais.getAtivo() == null) {
            pais.setAtivo(true);
        }
        
        // Usar AUTO_INCREMENT do MySQL, removendo a definição manual do ID
        String sql = "INSERT INTO pais (nome, codigo, sigla, data_cadastro, ultima_modificacao, ativo) VALUES (?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, pais.getNome());
            stmt.setString(2, pais.getCodigo());
            stmt.setString(3, pais.getSigla());
            stmt.setTimestamp(4, Timestamp.valueOf(pais.getDataCadastro()));
            stmt.setTimestamp(5, Timestamp.valueOf(pais.getUltimaModificacao()));
            stmt.setBoolean(6, pais.getAtivo());
            
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                // Obter o ID gerado automaticamente
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        pais.setId(generatedKeys.getLong(1));
                    } else {
                        throw new SQLException("Falha ao inserir país, nenhum ID foi gerado");
                    }
                }
            }
            
        } catch (SQLException e) {
            e.printStackTrace();
            System.err.println("Erro SQL detalhado: " + e.getMessage());
            System.err.println("Estado SQL: " + e.getSQLState());
            System.err.println("Código de erro: " + e.getErrorCode());
            throw new RuntimeException("Erro ao inserir país: " + e.getMessage(), e);
        }
        
        return pais;
    }
    
    private Pais update(Pais pais) {
        pais.setUltimaModificacao(LocalDateTime.now());
        
        // Garantir que o campo ativo nunca seja null
        if (pais.getAtivo() == null) {
            pais.setAtivo(true);
        }
        
        String sql = "UPDATE pais SET nome = ?, codigo = ?, sigla = ?, ultima_modificacao = ?, ativo = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, pais.getNome());
            stmt.setString(2, pais.getCodigo());
            stmt.setString(3, pais.getSigla());
            stmt.setTimestamp(4, Timestamp.valueOf(pais.getUltimaModificacao()));
            stmt.setBoolean(5, pais.getAtivo());
            stmt.setLong(6, pais.getId());
            
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao atualizar país: " + e.getMessage(), e);
        }
        
        return pais;
    }
    
    public void deleteById(Long id) {
        System.out.println("PaisRepository: Deletando país com ID: " + id);
        String sql = "DELETE FROM pais WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("PaisRepository: País deletado com sucesso");
            } else {
                System.out.println("PaisRepository: Nenhum país encontrado para deletar com ID: " + id);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao deletar país: " + e.getMessage(), e);
        }
    }
    
    public List<Pais> findAllAtivos() {
        List<Pais> paises = new ArrayList<>();
        String sql = "SELECT * FROM pais WHERE ativo = true ORDER BY nome ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement()) {
             
            ResultSet rs = stmt.executeQuery(sql);
            
            while (rs.next()) {
                try {
                    Pais pais = mapResultSetToPais(rs);
                    paises.add(pais);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear país do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            rs.close();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar países ativos: " + e.getMessage(), e);
        }
        
        return paises;
    }
    
    public void softDeleteById(Long id) {
        System.out.println("PaisRepository: Soft delete do país com ID: " + id);
        String sql = "UPDATE pais SET ativo = false WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("PaisRepository: País desativado com sucesso");
            } else {
                System.out.println("PaisRepository: Nenhum país encontrado para desativar com ID: " + id);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao desativar país: " + e.getMessage(), e);
        }
    }
    
    private Pais mapResultSetToPais(ResultSet rs) throws SQLException {
        Pais pais = new Pais();
        pais.setId(rs.getLong("id"));
        pais.setNome(rs.getString("nome"));
        pais.setCodigo(rs.getString("codigo"));
        pais.setSigla(rs.getString("sigla"));
        
        // Carregar campos de data
        Timestamp dataCadastro = rs.getTimestamp("data_cadastro");
        if (dataCadastro != null) {
            pais.setDataCadastro(dataCadastro.toLocalDateTime());
        }
        
        Timestamp ultimaModificacao = rs.getTimestamp("ultima_modificacao");
        if (ultimaModificacao != null) {
            pais.setUltimaModificacao(ultimaModificacao.toLocalDateTime());
        }
        
        // Garantir que o campo ativo nunca seja null
        try {
            boolean ativo = rs.getBoolean("ativo");
            pais.setAtivo(ativo);
        } catch (SQLException e) {
            // Se a coluna não existir, definir como ativo
            pais.setAtivo(true);
        }
        
        // Garantia adicional - nunca deixar ativo como null
        if (pais.getAtivo() == null) {
            pais.setAtivo(true);
        }
        
        return pais;
    }
} 