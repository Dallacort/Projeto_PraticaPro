package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.ModalidadeNfe;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ModalidadeNfeRepository {
    
    private final DatabaseConnection databaseConnection;
    
    public ModalidadeNfeRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }
    
    
    
    public List<ModalidadeNfe> findAll() {
        List<ModalidadeNfe> modalidades = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT * FROM modalidade_nfe")) {
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                modalidades.add(mapRowToModalidadeNfe(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar modalidades de NF-e", e);
        }
        return modalidades;
    }
    
    public List<ModalidadeNfe> findByAtivoTrue() {
        List<ModalidadeNfe> modalidades = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT * FROM modalidade_nfe WHERE ativo = true")) {
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                modalidades.add(mapRowToModalidadeNfe(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar modalidades de NF-e ativas", e);
        }
        return modalidades;
    }
    
    public Optional<ModalidadeNfe> findById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT * FROM modalidade_nfe WHERE id = ?")) {
            
            statement.setLong(1, id);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return Optional.of(mapRowToModalidadeNfe(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar modalidade de NF-e por ID", e);
        }
        return Optional.empty();
    }
    
    public Optional<ModalidadeNfe> findByCodigo(String codigo) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT * FROM modalidade_nfe WHERE codigo = ?")) {
            
            statement.setString(1, codigo);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return Optional.of(mapRowToModalidadeNfe(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar modalidade de NF-e por código", e);
        }
        return Optional.empty();
    }
    
    public List<ModalidadeNfe> findByDescricaoContainingIgnoreCase(String termo) {
        List<ModalidadeNfe> modalidades = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT * FROM modalidade_nfe WHERE LOWER(descricao) LIKE ?")) {
            
            statement.setString(1, "%" + termo.toLowerCase() + "%");
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                modalidades.add(mapRowToModalidadeNfe(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar modalidades de NF-e por descrição", e);
        }
        return modalidades;
    }
    
    public ModalidadeNfe save(ModalidadeNfe modalidade) {
        if (modalidade.getId() == null) {
            return insert(modalidade);
        } else {
            return update(modalidade);
        }
    }
    
    private ModalidadeNfe insert(ModalidadeNfe modalidade) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO modalidade_nfe (codigo, descricao, ativo, data_cadastro, ultima_modificacao) VALUES (?, ?, ?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            statement.setString(1, modalidade.getCodigo());
            statement.setString(2, modalidade.getDescricao());
            statement.setBoolean(3, modalidade.getAtivo() != null ? modalidade.getAtivo() : true);
            statement.setTimestamp(4, Timestamp.valueOf(now));
            statement.setTimestamp(5, Timestamp.valueOf(now));
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao criar modalidade de NF-e, nenhuma linha afetada.");
            }
            
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    modalidade.setId(generatedKeys.getLong(1));
                    modalidade.setDataCadastro(now);
                    modalidade.setUltimaModificacao(now);
                } else {
                    throw new SQLException("Falha ao criar modalidade de NF-e, nenhum ID obtido.");
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir modalidade de NF-e", e);
        }
        return modalidade;
    }
    
    private ModalidadeNfe update(ModalidadeNfe modalidade) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "UPDATE modalidade_nfe SET codigo = ?, descricao = ?, ativo = ?, ultima_modificacao = ? WHERE id = ?")) {
            
            LocalDateTime now = LocalDateTime.now();
            
            statement.setString(1, modalidade.getCodigo());
            statement.setString(2, modalidade.getDescricao());
            statement.setBoolean(3, modalidade.getAtivo() != null ? modalidade.getAtivo() : true);
            statement.setTimestamp(4, Timestamp.valueOf(now));
            statement.setLong(5, modalidade.getId());
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao atualizar modalidade de NF-e, nenhuma linha afetada.");
            }
            
            modalidade.setUltimaModificacao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar modalidade de NF-e", e);
        }
        return modalidade;
    }
    
    public void deleteById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "DELETE FROM modalidade_nfe WHERE id = ?")) {
            
            statement.setLong(1, id);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao excluir modalidade de NF-e", e);
        }
    }
    
    private ModalidadeNfe mapRowToModalidadeNfe(ResultSet rs) throws SQLException {
        ModalidadeNfe modalidade = new ModalidadeNfe();
        modalidade.setId(rs.getLong("id"));
        modalidade.setCodigo(rs.getString("codigo"));
        modalidade.setDescricao(rs.getString("descricao"));
        modalidade.setAtivo(rs.getBoolean("ativo"));
        
        // Carregar campos de data
        try {
            Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
            if (dataCadastroTimestamp != null) {
                modalidade.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
            }
            
            Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacaoTimestamp != null) {
                modalidade.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
            }
        } catch (SQLException e) {
            System.err.println("Erro ao carregar campos de data: " + e.getMessage());
        }
        
        return modalidade;
    }
} 