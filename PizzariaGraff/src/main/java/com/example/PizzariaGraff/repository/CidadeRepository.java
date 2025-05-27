package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Estado;
import com.example.PizzariaGraff.model.Pais;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class CidadeRepository {
    
    private final DatabaseConnection databaseConnection;
    private final EstadoRepository estadoRepository;
    
    public CidadeRepository(DatabaseConnection databaseConnection, EstadoRepository estadoRepository) {
        this.databaseConnection = databaseConnection;
        this.estadoRepository = estadoRepository;
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
    
    public List<Cidade> findAll() {
        List<Cidade> cidades = new ArrayList<>();
        
        // Verificar se as colunas de data existem
        try (Connection conn = databaseConnection.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            
            // Verificar se a tabela existe
            boolean tabelaExiste = false;
            try (ResultSet rs = metaData.getTables(null, null, null, new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    System.out.println("Tabela encontrada: " + tableName);
                    if ("cidade".equalsIgnoreCase(tableName)) {
                        tabelaExiste = true;
                        break;
                    }
                }
            }
            
            if (tabelaExiste) {
                // Verificar se as colunas de data existem
                boolean temDataCadastro = false;
                boolean temUltimaModificacao = false;
                
                try (ResultSet colunas = metaData.getColumns(null, null, "cidade", null)) {
                    System.out.println("Verificando colunas da tabela cidade:");
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
                    System.out.println("Adicionando colunas de data à tabela cidade");
                    try (Statement stmt = conn.createStatement()) {
                        if (!temDataCadastro) {
                            stmt.execute("ALTER TABLE cidade ADD COLUMN data_cadastro TIMESTAMP");
                            System.out.println("Coluna data_cadastro adicionada à tabela cidade");
                        }
                        
                        if (!temUltimaModificacao) {
                            stmt.execute("ALTER TABLE cidade ADD COLUMN ultima_modificacao TIMESTAMP");
                            System.out.println("Coluna ultima_modificacao adicionada à tabela cidade");
                        }
                        
                        // Se adicionamos as colunas, atualizar registros existentes com a data atual
                        if (!temDataCadastro || !temUltimaModificacao) {
                            LocalDateTime now = LocalDateTime.now();
                            stmt.execute("UPDATE cidade SET " + 
                                        (!temDataCadastro ? "data_cadastro = '" + Timestamp.valueOf(now) + "'" : "") +
                                        (!temDataCadastro && !temUltimaModificacao ? ", " : "") +
                                        (!temUltimaModificacao ? "ultima_modificacao = '" + Timestamp.valueOf(now) + "'" : ""));
                            System.out.println("Registros existentes atualizados com datas");
                        }
                    }
                }
            } else {
                System.out.println("Tabela 'cidade' não existe, será criada quando necessário");
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/modificar estrutura da tabela cidade: " + e.getMessage());
            e.printStackTrace();
        }
        
        String sql = "SELECT c.*, " +
                     "e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM cidade c " +
                     "LEFT JOIN estado e ON c.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "ORDER BY c.nome ASC";
        
        System.out.println("CidadeRepository.findAll() - Executando SQL: " + sql);
        
        try (Connection conn = databaseConnection.getConnection()) {
            System.out.println("CidadeRepository.findAll() - Conexão obtida com sucesso");
            
            try (Statement stmt = conn.createStatement()) {
                System.out.println("CidadeRepository.findAll() - Statement criado com sucesso");
                
                try (ResultSet rs = stmt.executeQuery(sql)) {
                    System.out.println("CidadeRepository.findAll() - Query executada com sucesso");
                    
                    while (rs.next()) {
                        try {
                            Cidade cidade = mapResultSetToCidade(rs);
                            System.out.println("CidadeRepository.findAll() - Cidade carregada: " + cidade.getNome() + 
                                             ", Data cadastro: " + cidade.getDataCadastro() + 
                                             ", Última modificação: " + cidade.getUltimaModificacao());
                            cidades.add(cidade);
                        } catch (SQLException e) {
                            System.err.println("Erro ao mapear cidade do ResultSet: " + e.getMessage());
                            e.printStackTrace();
                            // Continua para o próximo registro
                        }
                    }
                    
                    System.out.println("CidadeRepository.findAll() - " + cidades.size() + " cidades encontradas");
                }
            }
        } catch (SQLException e) {
            System.err.println("CidadeRepository.findAll() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar cidades", e);
        }
        
        return cidades;
    }
    
    public Optional<Cidade> findById(Long id) {
        String sql = "SELECT c.*, " +
                     "e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM cidade c " +
                     "LEFT JOIN estado e ON c.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE c.id = ?";
        
        System.out.println("CidadeRepository.findById() - Buscando cidade com ID: " + id);
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            System.out.println("CidadeRepository.findById() - Executando SQL: " + sql.replace("?", id.toString()));
            
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                try {
                    Cidade cidade = mapResultSetToCidade(rs);
                    System.out.println("CidadeRepository.findById() - Cidade encontrada: " + cidade.getNome() + 
                                     ", Data cadastro: " + cidade.getDataCadastro() + 
                                     ", Última modificação: " + cidade.getUltimaModificacao());
                    return Optional.of(cidade);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear cidade do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("CidadeRepository.findById() - Nenhuma cidade encontrada com ID: " + id);
            }
            rs.close();
        } catch (SQLException e) {
            System.err.println("CidadeRepository.findById() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar cidade por ID", e);
        }
        
        return Optional.empty();
    }
    
    public List<Cidade> findByEstadoId(Long estadoId) {
        List<Cidade> cidades = new ArrayList<>();
        String sql = "SELECT c.*, " +
                     "e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM cidade c " +
                     "LEFT JOIN estado e ON c.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE c.estado_id = ? " +
                     "ORDER BY c.nome ASC";
        
        System.out.println("CidadeRepository.findByEstadoId() - Buscando cidades do estado ID: " + estadoId);
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, estadoId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                try {
                    Cidade cidade = mapResultSetToCidade(rs);
                    cidades.add(cidade);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear cidade do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            rs.close();
        } catch (SQLException e) {
            System.err.println("CidadeRepository.findByEstadoId() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar cidades por estado", e);
        }
        
        return cidades;
    }
    
    public Cidade save(Cidade cidade) {
        if (cidade.getId() == null) {
            return insert(cidade);
        } else {
            return update(cidade);
        }
    }
    
    private Cidade insert(Cidade cidade) {
        LocalDateTime now = LocalDateTime.now();
        cidade.setDataCadastro(now);
        cidade.setUltimaModificacao(now);
        
        if (cidade.getAtivo() == null) {
            cidade.setAtivo(true);
        }
        
        String sql = "INSERT INTO cidade (nome, estado_id, data_cadastro, ultima_modificacao, ativo) VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, cidade.getNome());
            stmt.setObject(2, cidade.getEstado() != null ? cidade.getEstado().getId() : null);
            stmt.setTimestamp(3, Timestamp.valueOf(now));
            stmt.setTimestamp(4, Timestamp.valueOf(now));
            stmt.setBoolean(5, cidade.getAtivo());
            
            stmt.executeUpdate();
            
            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    cidade.setId(generatedKeys.getLong(1));
                } else {
                    throw new SQLException("Falha ao inserir cidade, nenhum ID obtido.");
                }
            }
            
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao inserir cidade: " + e.getMessage(), e);
        }
        
        return cidade;
    }
    
    private Cidade update(Cidade cidade) {
        LocalDateTime now = LocalDateTime.now();
        cidade.setUltimaModificacao(now);
        
        if (cidade.getAtivo() == null) {
            cidade.setAtivo(true);
        }
        
        String sql = "UPDATE cidade SET nome = ?, estado_id = ?, ultima_modificacao = ?, ativo = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, cidade.getNome());
            stmt.setObject(2, cidade.getEstado() != null ? cidade.getEstado().getId() : null);
            stmt.setTimestamp(3, Timestamp.valueOf(now));
            stmt.setBoolean(4, cidade.getAtivo());
            stmt.setLong(5, cidade.getId());
            
            stmt.executeUpdate();
            
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao atualizar cidade: " + e.getMessage(), e);
        }
        
        return cidade;
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM cidade WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
            
            System.out.println("CidadeRepository.deleteById() - Cidade ID " + id + " excluída com sucesso");
        } catch (SQLException e) {
            System.err.println("CidadeRepository.deleteById() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao deletar cidade", e);
        }
    }
    
    public List<Cidade> findAllAtivos() {
        List<Cidade> cidades = new ArrayList<>();
        String sql = "SELECT c.*, " +
                     "e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM cidade c " +
                     "LEFT JOIN estado e ON c.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE c.ativo = true " +
                     "ORDER BY c.nome ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement()) {
             
            ResultSet rs = stmt.executeQuery(sql);
            
            while (rs.next()) {
                try {
                    Cidade cidade = mapResultSetToCidade(rs);
                    cidades.add(cidade);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear cidade do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            rs.close();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar cidades ativas: " + e.getMessage(), e);
        }
        
        return cidades;
    }
    
    public void softDeleteById(Long id) {
        String sql = "UPDATE cidade SET ativo = false WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            int rowsAffected = stmt.executeUpdate();
            
            System.out.println("CidadeRepository.softDeleteById() - Cidade desativada: ID=" + id + ", " + rowsAffected + " registro(s) afetado(s)");
            
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao desativar cidade: " + e.getMessage(), e);
        }
    }
    
    private Cidade mapResultSetToCidade(ResultSet rs) throws SQLException {
        Cidade cidade = new Cidade();
        cidade.setId(rs.getLong("id"));
        cidade.setNome(rs.getString("nome"));
        
        // Carregar dados do estado
        Long estadoId = rs.getLong("estado_id");
        if (estadoId > 0) {
            Estado estado = new Estado();
            estado.setId(estadoId);
            
            try {
                estado.setNome(rs.getString("estado_nome"));
                estado.setUf(rs.getString("estado_uf"));
                
                // Carregar dados do país associado ao estado
                String paisId = rs.getString("estado_pais_id");
                if (paisId != null && !paisId.isEmpty()) {
                    Pais pais = new Pais();
                    pais.setId(paisId);
                    
                    try {
                        // Tentar carregar diretamente dos dados do JOIN
                        pais.setNome(rs.getString("pais_nome"));
                        pais.setSigla(rs.getString("pais_sigla"));
                        pais.setCodigo(rs.getString("pais_codigo"));
                        
                        estado.setPais(pais);
                        System.out.println("País carregado do ResultSet: " + pais.getNome() + " (ID: " + pais.getId() + ")");
                    } catch (SQLException ex) {
                        // Se não conseguir carregar do ResultSet, buscar do repositório
                        try {
                            Optional<Pais> paisOpt = estadoRepository.getPaisRepository().findById(paisId);
                            if (paisOpt.isPresent()) {
                                estado.setPais(paisOpt.get());
                                System.out.println("País carregado do repositório: " + paisOpt.get().getNome());
                            } else {
                                System.out.println("País com ID " + paisId + " não encontrado para o estado " + estadoId);
                            }
                        } catch (Exception e) {
                            System.err.println("Erro ao carregar país para o estado: " + e.getMessage());
                        }
                    }
                }
            } catch (SQLException e) {
                // Se não conseguir obter as colunas do JOIN, tentar buscar do repositório
                try {
                    Optional<Estado> estadoOpt = estadoRepository.findById(estadoId);
                    if (estadoOpt.isPresent()) {
                        estado = estadoOpt.get();
                    }
                } catch (Exception ex) {
                    System.err.println("Erro ao buscar estado: " + ex.getMessage());
                }
            }
            
            cidade.setEstado(estado);
        }
        
        // Carregar campos de data
        try {
            Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
            if (dataCadastroTimestamp != null) {
                cidade.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
            }
            
            Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacaoTimestamp != null) {
                cidade.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
            }
            
            // Carregar campo ativo
            try {
                boolean ativo = rs.getBoolean("ativo");
                cidade.setAtivo(ativo);
            } catch (SQLException e) {
                // Se a coluna não existir, definir como true
                cidade.setAtivo(true);
            }
        } catch (SQLException e) {
            System.err.println("Erro ao carregar campos adicionais: " + e.getMessage());
            // Valores default para datas e ativo
            cidade.setDataCadastro(LocalDateTime.now());
            cidade.setUltimaModificacao(LocalDateTime.now());
            cidade.setAtivo(true);
        }
        
        return cidade;
    }
    
    // Método para verificar e corrigir a estrutura da tabela
    private void verificarEstruturaBanco() {
        try {
            Connection conn = databaseConnection.getConnection();
            DatabaseMetaData metaData = conn.getMetaData();
            
            // Verificar se a coluna ativo existe
            boolean temAtivo = false;
            
            try (ResultSet colunas = metaData.getColumns(null, null, "cidade", "ativo")) {
                temAtivo = colunas.next();
            }
            
            if (!temAtivo) {
                System.out.println("Adicionando coluna ativo à tabela cidade");
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("ALTER TABLE cidade ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT true");
                    System.out.println("Coluna ativo adicionada à tabela cidade");
                    stmt.execute("UPDATE cidade SET ativo = true");
                    System.out.println("Registros atualizados com ativo = true");
                }
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/modificar estrutura da tabela cidade: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 