package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.MovimentacaoNfe;
import com.example.PizzariaGraff.model.Nfe;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class MovimentacaoNfeRepository {
    
    private final DatabaseConnection databaseConnection;
    private final NfeRepository nfeRepository;
    
    public MovimentacaoNfeRepository(DatabaseConnection databaseConnection, NfeRepository nfeRepository) {
        this.databaseConnection = databaseConnection;
        this.nfeRepository = nfeRepository;
    }
    
  
    
    public List<MovimentacaoNfe> findAll() {
        List<MovimentacaoNfe> movimentacoes = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT m.*, n.numero as nfe_numero FROM movimentacao_nfe m " +
                "LEFT JOIN nfe n ON m.nfe_id = n.id " +
                "ORDER BY m.data_movimentacao DESC")) {
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                movimentacoes.add(mapRowToMovimentacaoNfe(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar movimentações de NF-e", e);
        }
        return movimentacoes;
    }
    
    public Optional<MovimentacaoNfe> findById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT m.*, n.numero as nfe_numero FROM movimentacao_nfe m " +
                "LEFT JOIN nfe n ON m.nfe_id = n.id " +
                "WHERE m.id = ?")) {
            
            statement.setLong(1, id);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return Optional.of(mapRowToMovimentacaoNfe(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar movimentação de NF-e por ID", e);
        }
        return Optional.empty();
    }
    
    public List<MovimentacaoNfe> findByNfeId(Long nfeId) {
        List<MovimentacaoNfe> movimentacoes = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT m.*, n.numero as nfe_numero FROM movimentacao_nfe m " +
                "LEFT JOIN nfe n ON m.nfe_id = n.id " +
                "WHERE m.nfe_id = ? " +
                "ORDER BY m.data_movimentacao DESC")) {
            
            statement.setLong(1, nfeId);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                movimentacoes.add(mapRowToMovimentacaoNfe(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar movimentações por NF-e", e);
        }
        return movimentacoes;
    }
    
    public MovimentacaoNfe save(MovimentacaoNfe movimentacao) {
        if (movimentacao.getId() == null) {
            return insert(movimentacao);
        } else {
            return update(movimentacao);
        }
    }
    
    private MovimentacaoNfe insert(MovimentacaoNfe movimentacao) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO movimentacao_nfe (nfe_id, data_movimentacao, status, descricao, data_cadastro, ultima_modificacao) " +
                "VALUES (?, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            if (movimentacao.getNfe() != null && movimentacao.getNfe().getId() != null) {
                statement.setLong(1, movimentacao.getNfe().getId());
            } else {
                statement.setNull(1, Types.BIGINT);
            }
            
            if (movimentacao.getDataMovimentacao() == null) {
                movimentacao.setDataMovimentacao(now);
            }
            statement.setTimestamp(2, Timestamp.valueOf(movimentacao.getDataMovimentacao()));
            statement.setString(3, movimentacao.getStatus());
            statement.setString(4, movimentacao.getDescricao());
            statement.setTimestamp(5, Timestamp.valueOf(now));
            statement.setTimestamp(6, Timestamp.valueOf(now));
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao criar movimentação de NF-e, nenhuma linha afetada.");
            }
            
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    movimentacao.setId(generatedKeys.getLong(1));
                    movimentacao.setDataCadastro(now);
                    movimentacao.setUltimaModificacao(now);
                } else {
                    throw new SQLException("Falha ao criar movimentação de NF-e, nenhum ID obtido.");
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir movimentação de NF-e", e);
        }
        return movimentacao;
    }
    
    private MovimentacaoNfe update(MovimentacaoNfe movimentacao) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "UPDATE movimentacao_nfe SET nfe_id = ?, data_movimentacao = ?, " +
                "status = ?, descricao = ?, ultima_modificacao = ? WHERE id = ?")) {
            
            LocalDateTime now = LocalDateTime.now();
            
            if (movimentacao.getNfe() != null && movimentacao.getNfe().getId() != null) {
                statement.setLong(1, movimentacao.getNfe().getId());
            } else {
                statement.setNull(1, Types.BIGINT);
            }
            
            statement.setTimestamp(2, Timestamp.valueOf(movimentacao.getDataMovimentacao()));
            statement.setString(3, movimentacao.getStatus());
            statement.setString(4, movimentacao.getDescricao());
            statement.setTimestamp(5, Timestamp.valueOf(now));
            statement.setLong(6, movimentacao.getId());
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao atualizar movimentação de NF-e, nenhuma linha afetada.");
            }
            
            movimentacao.setUltimaModificacao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar movimentação de NF-e", e);
        }
        return movimentacao;
    }
    
    public void deleteById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "DELETE FROM movimentacao_nfe WHERE id = ?")) {
            
            statement.setLong(1, id);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao excluir movimentação de NF-e", e);
        }
    }
    
    private MovimentacaoNfe mapRowToMovimentacaoNfe(ResultSet rs) throws SQLException {
        MovimentacaoNfe movimentacao = new MovimentacaoNfe();
        movimentacao.setId(rs.getLong("id"));
        movimentacao.setDataMovimentacao(rs.getTimestamp("data_movimentacao").toLocalDateTime());
        movimentacao.setStatus(rs.getString("status"));
        movimentacao.setDescricao(rs.getString("descricao"));
        
        // Carregar campos de data
        try {
            Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
            if (dataCadastroTimestamp != null) {
                movimentacao.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
            }
            
            Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacaoTimestamp != null) {
                movimentacao.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
            }
        } catch (SQLException e) {
            System.err.println("Erro ao carregar campos de data: " + e.getMessage());
        }
        
        Long nfeId = rs.getObject("nfe_id", Long.class);
        if (nfeId != null) {
            Nfe nfe = new Nfe();
            nfe.setId(nfeId);
            nfe.setNumero(rs.getString("nfe_numero"));
            movimentacao.setNfe(nfe);
        }
        
        return movimentacao;
    }
} 