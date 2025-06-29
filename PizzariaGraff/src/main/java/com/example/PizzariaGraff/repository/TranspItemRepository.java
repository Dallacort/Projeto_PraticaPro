package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.TranspItem;
import com.example.PizzariaGraff.model.Transportadora;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class TranspItemRepository {
    
    private final DatabaseConnection databaseConnection;
    private final TransportadoraRepository transportadoraRepository;
    
    public TranspItemRepository(DatabaseConnection databaseConnection, TransportadoraRepository transportadoraRepository) {
        this.databaseConnection = databaseConnection;
        this.transportadoraRepository = transportadoraRepository;
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
                    if ("transp_item".equalsIgnoreCase(tableName)) {
                        tabelaExiste = true;
                        break;
                    }
                }
            }
            
            if (tabelaExiste) {
                // Verificar se as colunas de data existem
                boolean temDataCadastro = false;
                boolean temUltimaModificacao = false;
                
                try (ResultSet colunas = metaData.getColumns(null, null, "transp_item", null)) {
                    System.out.println("Verificando colunas da tabela transp_item:");
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
                    System.out.println("Adicionando colunas de data à tabela transp_item");
                    try (Statement stmt = conn.createStatement()) {
                        if (!temDataCadastro) {
                            stmt.execute("ALTER TABLE transp_item ADD COLUMN data_cadastro TIMESTAMP");
                            System.out.println("Coluna data_cadastro adicionada à tabela transp_item");
                            stmt.execute("UPDATE transp_item SET data_cadastro = CURRENT_TIMESTAMP");
                            System.out.println("Registros atualizados com data_cadastro atual");
                        }
                        
                        if (!temUltimaModificacao) {
                            stmt.execute("ALTER TABLE transp_item ADD COLUMN ultima_modificacao TIMESTAMP");
                            System.out.println("Coluna ultima_modificacao adicionada à tabela transp_item");
                            stmt.execute("UPDATE transp_item SET ultima_modificacao = CURRENT_TIMESTAMP");
                            System.out.println("Registros atualizados com ultima_modificacao atual");
                        }
                    }
                }
            } else {
                System.out.println("Tabela 'transp_item' não existe, será criada quando necessário");
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/modificar estrutura da tabela transp_item: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public List<TranspItem> findAll() {
        List<TranspItem> itens = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT i.*, t.transportadora as transportadora_nome FROM transp_item i " +
                "LEFT JOIN transportadora t ON i.transportadora_id = t.id")) {
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                itens.add(mapRowToTranspItem(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar itens de transportadora", e);
        }
        return itens;
    }
    
    public List<TranspItem> findByAtivoTrue() {
        List<TranspItem> itens = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT i.*, t.transportadora as transportadora_nome FROM transp_item i " +
                "LEFT JOIN transportadora t ON i.transportadora_id = t.id " +
                "WHERE i.ativo = true")) {
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                itens.add(mapRowToTranspItem(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar itens de transportadora ativos", e);
        }
        return itens;
    }
    
    public Optional<TranspItem> findById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT i.*, t.transportadora as transportadora_nome FROM transp_item i " +
                "LEFT JOIN transportadora t ON i.transportadora_id = t.id " +
                "WHERE i.id = ?")) {
            
            statement.setLong(1, id);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return Optional.of(mapRowToTranspItem(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar item de transportadora por ID", e);
        }
        return Optional.empty();
    }
    
    public Optional<TranspItem> findByCodigo(String codigo) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT i.*, t.transportadora as transportadora_nome FROM transp_item i " +
                "LEFT JOIN transportadora t ON i.transportadora_id = t.id " +
                "WHERE i.codigo = ?")) {
            
            statement.setString(1, codigo);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return Optional.of(mapRowToTranspItem(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar item de transportadora por código", e);
        }
        return Optional.empty();
    }
    
    public List<TranspItem> findByTransportadoraId(Long transportadoraId) {
        List<TranspItem> itens = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT i.*, t.transportadora as transportadora_nome FROM transp_item i " +
                "LEFT JOIN transportadora t ON i.transportadora_id = t.id " +
                "WHERE i.transportadora_id = ?")) {
            
            statement.setLong(1, transportadoraId);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                itens.add(mapRowToTranspItem(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar itens por transportadora", e);
        }
        return itens;
    }
    
    public List<TranspItem> findByDescricaoContainingIgnoreCase(String termo) {
        List<TranspItem> itens = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT i.*, t.transportadora as transportadora_nome FROM transp_item i " +
                "LEFT JOIN transportadora t ON i.transportadora_id = t.id " +
                "WHERE LOWER(i.descricao) LIKE ?")) {
            
            statement.setString(1, "%" + termo.toLowerCase() + "%");
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                itens.add(mapRowToTranspItem(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar itens por descrição", e);
        }
        return itens;
    }
    
    public TranspItem save(TranspItem transpItem) {
        if (transpItem.getId() == null) {
            return insert(transpItem);
        } else {
            return update(transpItem);
        }
    }
    
    private TranspItem insert(TranspItem transpItem) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO transp_item (codigo, descricao, transportadora_id, codigo_transp, ativo, data_cadastro, ultima_modificacao) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            statement.setString(1, transpItem.getCodigo());
            statement.setString(2, transpItem.getDescricao());
            
            if (transpItem.getTransportadora() != null && transpItem.getTransportadora().getId() != null) {
                statement.setLong(3, transpItem.getTransportadora().getId());
            } else {
                statement.setNull(3, Types.BIGINT);
            }
            
            statement.setString(4, transpItem.getCodigoTransp());
            statement.setBoolean(5, transpItem.getAtivo() != null ? transpItem.getAtivo() : true);
            statement.setTimestamp(6, Timestamp.valueOf(now));
            statement.setTimestamp(7, Timestamp.valueOf(now));
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao criar item de transportadora, nenhuma linha afetada.");
            }
            
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    transpItem.setId(generatedKeys.getLong(1));
                    transpItem.setDataCadastro(now);
                    transpItem.setUltimaModificacao(now);
                } else {
                    throw new SQLException("Falha ao criar item de transportadora, nenhum ID obtido.");
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir item de transportadora", e);
        }
        return transpItem;
    }
    
    private TranspItem update(TranspItem transpItem) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "UPDATE transp_item SET codigo = ?, descricao = ?, transportadora_id = ?, " +
                "codigo_transp = ?, ativo = ?, ultima_modificacao = ? WHERE id = ?")) {
            
            LocalDateTime now = LocalDateTime.now();
            
            statement.setString(1, transpItem.getCodigo());
            statement.setString(2, transpItem.getDescricao());
            
            if (transpItem.getTransportadora() != null && transpItem.getTransportadora().getId() != null) {
                statement.setLong(3, transpItem.getTransportadora().getId());
            } else {
                statement.setNull(3, Types.BIGINT);
            }
            
            statement.setString(4, transpItem.getCodigoTransp());
            statement.setBoolean(5, transpItem.getAtivo() != null ? transpItem.getAtivo() : true);
            statement.setTimestamp(6, Timestamp.valueOf(now));
            statement.setLong(7, transpItem.getId());
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao atualizar item de transportadora, nenhuma linha afetada.");
            }
            
            transpItem.setUltimaModificacao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar item de transportadora", e);
        }
        return transpItem;
    }
    
    public void deleteById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "DELETE FROM transp_item WHERE id = ?")) {
            
            statement.setLong(1, id);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao excluir item de transportadora", e);
        }
    }
    
    private TranspItem mapRowToTranspItem(ResultSet rs) throws SQLException {
        TranspItem transpItem = new TranspItem();
        transpItem.setId(rs.getLong("id"));
        transpItem.setCodigo(rs.getString("codigo"));
        transpItem.setDescricao(rs.getString("descricao"));
        transpItem.setCodigoTransp(rs.getString("codigo_transp"));
        transpItem.setAtivo(rs.getBoolean("ativo"));
        
        // Carregar campos de data
        try {
            Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
            if (dataCadastroTimestamp != null) {
                transpItem.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
            }
            
            Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacaoTimestamp != null) {
                transpItem.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
            }
        } catch (SQLException e) {
            System.err.println("Erro ao carregar campos de data: " + e.getMessage());
        }
        
        Long transportadoraId = rs.getObject("transportadora_id", Long.class);
        if (transportadoraId != null) {
            Transportadora transportadora = new Transportadora();
            transportadora.setId(transportadoraId);
            transportadora.setTransportadora(rs.getString("transportadora_nome"));
            transpItem.setTransportadora(transportadora);
        }
        
        return transpItem;
    }
} 