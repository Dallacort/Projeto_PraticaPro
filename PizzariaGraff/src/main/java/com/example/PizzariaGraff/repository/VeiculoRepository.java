package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.Veiculo;
import com.example.PizzariaGraff.model.Transportadora;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class VeiculoRepository {
    
    private final DatabaseConnection databaseConnection;
    private final TransportadoraRepository transportadoraRepository;
    
    public VeiculoRepository(DatabaseConnection databaseConnection, TransportadoraRepository transportadoraRepository) {
        this.databaseConnection = databaseConnection;
        this.transportadoraRepository = transportadoraRepository;
    }
    
    
    
    public List<Veiculo> findAll() {
        List<Veiculo> veiculos = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT v.*, t.razao_social as transportadora_nome FROM veiculo v " +
                "LEFT JOIN transportadora t ON v.transportadora_id = t.id")) {
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                veiculos.add(mapRowToVeiculo(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar veículos", e);
        }
        return veiculos;
    }
    
    public List<Veiculo> findByAtivoTrue() {
        List<Veiculo> veiculos = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT v.*, t.razao_social as transportadora_nome FROM veiculo v " +
                "LEFT JOIN transportadora t ON v.transportadora_id = t.id " +
                "WHERE v.ativo = true")) {
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                veiculos.add(mapRowToVeiculo(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar veículos ativos", e);
        }
        return veiculos;
    }
    
    public Optional<Veiculo> findById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT v.*, t.razao_social as transportadora_nome FROM veiculo v " +
                "LEFT JOIN transportadora t ON v.transportadora_id = t.id " +
                "WHERE v.id = ?")) {
            
            statement.setLong(1, id);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return Optional.of(mapRowToVeiculo(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar veículo por ID", e);
        }
        return Optional.empty();
    }
    
    public Optional<Veiculo> findByPlaca(String placa) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT v.*, t.razao_social as transportadora_nome FROM veiculo v " +
                "LEFT JOIN transportadora t ON v.transportadora_id = t.id " +
                "WHERE v.placa = ?")) {
            
            statement.setString(1, placa);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return Optional.of(mapRowToVeiculo(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar veículo por placa", e);
        }
        return Optional.empty();
    }
    
    public List<Veiculo> findByTransportadoraId(Long transportadoraId) {
        List<Veiculo> veiculos = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT v.*, t.razao_social as transportadora_nome FROM veiculo v " +
                "LEFT JOIN transportadora t ON v.transportadora_id = t.id " +
                "WHERE v.transportadora_id = ?")) {
            
            statement.setLong(1, transportadoraId);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                veiculos.add(mapRowToVeiculo(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar veículos por transportadora", e);
        }
        return veiculos;
    }
    
    public Veiculo save(Veiculo veiculo) {
        if (veiculo.getId() == null) {
            return insert(veiculo);
        } else {
            return update(veiculo);
        }
    }
    
    private Veiculo insert(Veiculo veiculo) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO veiculo (placa, modelo, marca, ano, capacidade, transportadora_id, ativo, data_cadastro, ultima_modificacao) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            statement.setString(1, veiculo.getPlaca());
            statement.setString(2, veiculo.getModelo());
            statement.setString(3, veiculo.getMarca());
            
            if (veiculo.getAno() != null) {
                statement.setInt(4, veiculo.getAno());
            } else {
                statement.setNull(4, Types.INTEGER);
            }
            
            if (veiculo.getCapacidade() != null) {
                statement.setBigDecimal(5, veiculo.getCapacidade());
            } else {
                statement.setNull(5, Types.DECIMAL);
            }
            
            if (veiculo.getTransportadora() != null && veiculo.getTransportadora().getId() != null) {
                statement.setLong(6, veiculo.getTransportadora().getId());
            } else {
                statement.setNull(6, Types.BIGINT);
            }
            
            statement.setBoolean(7, veiculo.getAtivo() != null ? veiculo.getAtivo() : true);
            statement.setTimestamp(8, Timestamp.valueOf(now));
            statement.setTimestamp(9, Timestamp.valueOf(now));
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao criar veículo, nenhuma linha afetada.");
            }
            
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    veiculo.setId(generatedKeys.getLong(1));
                    veiculo.setDataCadastro(now);
                    veiculo.setUltimaModificacao(now);
                } else {
                    throw new SQLException("Falha ao criar veículo, nenhum ID obtido.");
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir veículo", e);
        }
        return veiculo;
    }
    
    private Veiculo update(Veiculo veiculo) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "UPDATE veiculo SET placa = ?, modelo = ?, marca = ?, ano = ?, " +
                "capacidade = ?, transportadora_id = ?, ativo = ?, ultima_modificacao = ? WHERE id = ?")) {
            
            LocalDateTime now = LocalDateTime.now();
            
            statement.setString(1, veiculo.getPlaca());
            statement.setString(2, veiculo.getModelo());
            statement.setString(3, veiculo.getMarca());
            
            if (veiculo.getAno() != null) {
                statement.setInt(4, veiculo.getAno());
            } else {
                statement.setNull(4, Types.INTEGER);
            }
            
            if (veiculo.getCapacidade() != null) {
                statement.setBigDecimal(5, veiculo.getCapacidade());
            } else {
                statement.setNull(5, Types.DECIMAL);
            }
            
            if (veiculo.getTransportadora() != null && veiculo.getTransportadora().getId() != null) {
                statement.setLong(6, veiculo.getTransportadora().getId());
            } else {
                statement.setNull(6, Types.BIGINT);
            }
            
            statement.setBoolean(7, veiculo.getAtivo() != null ? veiculo.getAtivo() : true);
            statement.setTimestamp(8, Timestamp.valueOf(now));
            statement.setLong(9, veiculo.getId());
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao atualizar veículo, nenhuma linha afetada.");
            }
            
            veiculo.setUltimaModificacao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar veículo", e);
        }
        return veiculo;
    }
    
    public void deleteById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "DELETE FROM veiculo WHERE id = ?")) {
            
            statement.setLong(1, id);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao excluir veículo", e);
        }
    }
    
    private Veiculo mapRowToVeiculo(ResultSet rs) throws SQLException {
        Veiculo veiculo = new Veiculo();
        veiculo.setId(rs.getLong("id"));
        veiculo.setPlaca(rs.getString("placa"));
        veiculo.setModelo(rs.getString("modelo"));
        veiculo.setMarca(rs.getString("marca"));
        veiculo.setAno(rs.getObject("ano", Integer.class));
        veiculo.setCapacidade(rs.getBigDecimal("capacidade"));
        veiculo.setAtivo(rs.getBoolean("ativo"));
        
        // Carregar campos de data
        try {
            Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
            if (dataCadastroTimestamp != null) {
                veiculo.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
            }
            
            Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacaoTimestamp != null) {
                veiculo.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
            }
        } catch (SQLException e) {
            System.err.println("Erro ao carregar campos de data: " + e.getMessage());
        }
        
        Long transportadoraId = rs.getObject("transportadora_id", Long.class);
        if (transportadoraId != null) {
            // Optionally preload the transportadora if needed
            // Transportadora transportadora = transportadoraRepository.findById(transportadoraId).orElse(null);
            // veiculo.setTransportadora(transportadora);
            
            // Or just set the ID and name for lighter loading
            Transportadora transportadora = new Transportadora();
            transportadora.setId(transportadoraId);
            transportadora.setRazaoSocial(rs.getString("transportadora_nome"));
            veiculo.setTransportadora(transportadora);
        }
        
        return veiculo;
    }
} 