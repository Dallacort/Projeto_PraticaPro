package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.repository.DatabaseConnection;
import com.example.PizzariaGraff.model.Estado;
import com.example.PizzariaGraff.model.Pais;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class EstadoRepository {
    
    private final DatabaseConnection databaseConnection;
    private final PaisRepository paisRepository;
    
    public EstadoRepository(DatabaseConnection databaseConnection, PaisRepository paisRepository) {
        this.databaseConnection = databaseConnection;
        this.paisRepository = paisRepository;
        verificarEstruturaBanco();
    }
    
    /**
     * Retorna o repositório de países
     * @return PaisRepository utilizado por este repositório
     */
    public PaisRepository getPaisRepository() {
        return this.paisRepository;
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
            
            try (ResultSet colunas = metaData.getColumns(null, null, "estado", "ativo")) {
                temAtivo = colunas.next();
            }
            
            if (!temAtivo) {
                System.out.println("Adicionando coluna ativo à tabela estado");
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("ALTER TABLE estado ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT true");
                    System.out.println("Coluna ativo adicionada à tabela estado");
                    stmt.execute("UPDATE estado SET ativo = true");
                    System.out.println("Registros atualizados com ativo = true");
                }
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/modificar estrutura da tabela estado: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public List<Estado> findAll() {
        List<Estado> estados = new ArrayList<>();
        
        // Verificar se as colunas de data existem
        try (Connection conn = databaseConnection.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            
            // Verificar se a tabela existe
            boolean tabelaExiste = false;
            try (ResultSet rs = metaData.getTables(null, null, null, new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    System.out.println("Tabela encontrada: " + tableName);
                    if ("estado".equalsIgnoreCase(tableName)) {
                        tabelaExiste = true;
                        break;
                    }
                }
            }
            
            if (tabelaExiste) {
                // Verificar se as colunas de data existem
                boolean temDataCadastro = false;
                boolean temUltimaModificacao = false;
                
                try (ResultSet colunas = metaData.getColumns(null, null, "estado", null)) {
                    System.out.println("Verificando colunas da tabela estado:");
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
                    System.out.println("Adicionando colunas de data à tabela estado");
                    try (Statement stmt = conn.createStatement()) {
                        if (!temDataCadastro) {
                            stmt.execute("ALTER TABLE estado ADD COLUMN data_cadastro TIMESTAMP");
                            System.out.println("Coluna data_cadastro adicionada à tabela estado");
                        }
                        
                        if (!temUltimaModificacao) {
                            stmt.execute("ALTER TABLE estado ADD COLUMN ultima_modificacao TIMESTAMP");
                            System.out.println("Coluna ultima_modificacao adicionada à tabela estado");
                        }
                        
                        // Se adicionamos as colunas, atualizar registros existentes com a data atual
                        if (!temDataCadastro || !temUltimaModificacao) {
                            LocalDateTime now = LocalDateTime.now();
                            stmt.execute("UPDATE estado SET " + 
                                        (!temDataCadastro ? "data_cadastro = '" + Timestamp.valueOf(now) + "'" : "") +
                                        (!temDataCadastro && !temUltimaModificacao ? ", " : "") +
                                        (!temUltimaModificacao ? "ultima_modificacao = '" + Timestamp.valueOf(now) + "'" : ""));
                            System.out.println("Registros existentes atualizados com datas");
                        }
                    }
                }
            } else {
                System.out.println("Tabela 'estado' não existe, será criada quando necessário");
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/modificar estrutura da tabela estado: " + e.getMessage());
            e.printStackTrace();
        }
        
        String sql = "SELECT e.*, p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM estado e " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "ORDER BY e.nome ASC";
        
        System.out.println("EstadoRepository.findAll() - Executando SQL: " + sql);
        
        try (Connection conn = databaseConnection.getConnection()) {
            System.out.println("EstadoRepository.findAll() - Conexão obtida com sucesso");
            
            try (Statement stmt = conn.createStatement()) {
                System.out.println("EstadoRepository.findAll() - Statement criado com sucesso");
                
                try (ResultSet rs = stmt.executeQuery(sql)) {
                    System.out.println("EstadoRepository.findAll() - Query executada com sucesso");
                    
                    while (rs.next()) {
                        try {
                            Estado estado = mapResultSetToEstado(rs);
                            System.out.println("EstadoRepository.findAll() - Estado carregado: " + estado.getNome() + 
                                             ", Data cadastro: " + estado.getDataCadastro() + 
                                             ", Última modificação: " + estado.getUltimaModificacao());
                            estados.add(estado);
                        } catch (SQLException e) {
                            System.err.println("Erro ao mapear estado do ResultSet: " + e.getMessage());
                            e.printStackTrace();
                            // Continua para o próximo registro
                        }
                    }
                    
                    System.out.println("EstadoRepository.findAll() - " + estados.size() + " estados encontrados");
                }
            }
        } catch (SQLException e) {
            System.err.println("EstadoRepository.findAll() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar estados", e);
        }
        
        return estados;
    }
    
    public Optional<Estado> findById(Long id) {
        String sql = "SELECT e.*, p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM estado e " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE e.id = ?";
        
        System.out.println("EstadoRepository.findById() - Buscando estado com ID: " + id);
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            System.out.println("EstadoRepository.findById() - Executando SQL: " + sql.replace("?", id.toString()));
            
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                try {
                    Estado estado = mapResultSetToEstado(rs);
                    System.out.println("EstadoRepository.findById() - Estado encontrado: " + estado.getNome() + 
                                     ", Data cadastro: " + estado.getDataCadastro() + 
                                     ", Última modificação: " + estado.getUltimaModificacao());
                    return Optional.of(estado);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear estado do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("EstadoRepository.findById() - Nenhum estado encontrado com ID: " + id);
            }
            rs.close();
        } catch (SQLException e) {
            System.err.println("EstadoRepository.findById() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar estado por ID", e);
        }
        
        return Optional.empty();
    }
    
    public List<Estado> findByPaisId(String paisId) {
        List<Estado> estados = new ArrayList<>();
        String sql = "SELECT e.*, p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM estado e " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE e.pais_id = ? " +
                     "ORDER BY e.nome ASC";
        
        System.out.println("EstadoRepository.findByPaisId() - Buscando estados do país ID: " + paisId);
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, paisId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                try {
                    Estado estado = mapResultSetToEstado(rs);
                    estados.add(estado);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear estado do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            rs.close();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar estados por país: " + e.getMessage(), e);
        }
        
        return estados;
    }
    
    public Estado save(Estado estado) {
        if (estado.getId() == null) {
            return insert(estado);
        } else {
            return update(estado);
        }
    }
    
    private Estado insert(Estado estado) {
        LocalDateTime now = LocalDateTime.now();
        estado.setDataCadastro(now);
        estado.setUltimaModificacao(now);
        
        if (estado.getAtivo() == null) {
            estado.setAtivo(true);
        }
        
        String sql = "INSERT INTO estado (nome, uf, pais_id, data_cadastro, ultima_modificacao, ativo) VALUES (?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, estado.getNome());
            stmt.setString(2, estado.getUf());
            stmt.setString(3, estado.getPais() != null ? estado.getPais().getId() : null);
            stmt.setTimestamp(4, Timestamp.valueOf(now));
            stmt.setTimestamp(5, Timestamp.valueOf(now));
            stmt.setBoolean(6, estado.getAtivo());
            
            stmt.executeUpdate();
            
            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    estado.setId(generatedKeys.getLong(1));
                } else {
                    throw new SQLException("Falha ao inserir estado, nenhum ID obtido.");
                }
            }
            
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao inserir estado: " + e.getMessage(), e);
        }
        
        return estado;
    }
    
    private Estado update(Estado estado) {
        LocalDateTime now = LocalDateTime.now();
        estado.setUltimaModificacao(now);
        
        if (estado.getAtivo() == null) {
            estado.setAtivo(true);
        }
        
        String sql = "UPDATE estado SET nome = ?, uf = ?, pais_id = ?, ultima_modificacao = ?, ativo = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, estado.getNome());
            stmt.setString(2, estado.getUf());
            stmt.setString(3, estado.getPais() != null ? estado.getPais().getId() : null);
            stmt.setTimestamp(4, Timestamp.valueOf(now));
            stmt.setBoolean(5, estado.getAtivo());
            stmt.setLong(6, estado.getId());
            
            stmt.executeUpdate();
            
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao atualizar estado: " + e.getMessage(), e);
        }
        
        return estado;
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM estado WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
            
            System.out.println("EstadoRepository.deleteById() - Estado ID " + id + " excluído com sucesso");
        } catch (SQLException e) {
            System.err.println("EstadoRepository.deleteById() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao deletar estado", e);
        }
    }
    
    public List<Estado> findAllAtivos() {
        List<Estado> estados = new ArrayList<>();
        String sql = "SELECT e.*, p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM estado e " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE e.ativo = true " +
                     "ORDER BY e.nome ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement()) {
             
            ResultSet rs = stmt.executeQuery(sql);
            
            while (rs.next()) {
                try {
                    Estado estado = mapResultSetToEstado(rs);
                    estados.add(estado);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear estado do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            rs.close();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar estados ativos: " + e.getMessage(), e);
        }
        
        return estados;
    }
    
    public void softDeleteById(Long id) {
        String sql = "UPDATE estado SET ativo = false WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            int rowsAffected = stmt.executeUpdate();
            
            System.out.println("EstadoRepository.softDeleteById() - Estado desativado: ID=" + id + ", " + rowsAffected + " registro(s) afetado(s)");
            
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao desativar estado: " + e.getMessage(), e);
        }
    }
    
    private Estado mapResultSetToEstado(ResultSet rs) throws SQLException {
        Estado estado = new Estado();
        estado.setId(rs.getLong("id"));
        estado.setNome(rs.getString("nome"));
        estado.setUf(rs.getString("uf"));
        
        // Carregar dados do país
        String paisId = rs.getString("pais_id");
        if (paisId != null) {
            Pais pais = new Pais();
            pais.setId(paisId);
            
            try {
                pais.setNome(rs.getString("pais_nome"));
                pais.setSigla(rs.getString("pais_sigla"));
                pais.setCodigo(rs.getString("pais_codigo"));
            } catch (SQLException e) {
                // Se não conseguir obter as colunas do JOIN, tentar buscar do repositório
                try {
                    Optional<Pais> paisOpt = paisRepository.findById(paisId);
                    if (paisOpt.isPresent()) {
                        pais = paisOpt.get();
                    }
                } catch (Exception ex) {
                    System.err.println("Erro ao buscar país: " + ex.getMessage());
                }
            }
            
            estado.setPais(pais);
        }
        
        // Carregar campos de data
        try {
            Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
            if (dataCadastroTimestamp != null) {
                estado.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
            }
            
            Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacaoTimestamp != null) {
                estado.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
            }
            
            // Carregar campo ativo
            try {
                boolean ativo = rs.getBoolean("ativo");
                estado.setAtivo(ativo);
            } catch (SQLException e) {
                // Se a coluna não existir, definir como true
                estado.setAtivo(true);
            }
        } catch (SQLException e) {
            System.err.println("Erro ao carregar campos adicionais: " + e.getMessage());
            // Valores default para datas e ativo
            estado.setDataCadastro(LocalDateTime.now());
            estado.setUltimaModificacao(LocalDateTime.now());
            estado.setAtivo(true);
        }
        
        return estado;
    }
} 