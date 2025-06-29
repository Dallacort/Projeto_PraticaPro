package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.Transportadora;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class TransportadoraRepository {
    
    private final DatabaseConnection databaseConnection;
    
    public TransportadoraRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }
    
    private static final String FIND_QUERY = 
        "SELECT t.*, c.nome as cidade_nome, e.uf as estado_uf " +
        "FROM transportadora t " +
        "LEFT JOIN cidade c ON t.cidade_id = c.id " +
        "LEFT JOIN estado e ON c.estado_id = e.id";
    
    public List<Transportadora> findAll() {
        List<Transportadora> transportadoras = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(FIND_QUERY)) {
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                transportadoras.add(mapRowToTransportadora(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar transportadoras", e);
        }
        return transportadoras;
    }
    
    public List<Transportadora> findAllActive() {
        List<Transportadora> transportadoras = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                FIND_QUERY + " WHERE t.ativo = true")) {
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                transportadoras.add(mapRowToTransportadora(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar transportadoras ativas", e);
        }
        return transportadoras;
    }
    
    public Optional<Transportadora> findById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                FIND_QUERY + " WHERE t.id = ?")) {
            
            statement.setLong(1, id);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return Optional.of(mapRowToTransportadora(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar transportadora por ID", e);
        }
        return Optional.empty();
    }
    
    public List<Transportadora> findByTermo(String termo) {
        List<Transportadora> transportadoras = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                FIND_QUERY + " WHERE LOWER(t.razao_social) LIKE ? OR LOWER(t.nome_fantasia) LIKE ?")) {
            
            String termoBusca = "%" + termo.toLowerCase() + "%";
            statement.setString(1, termoBusca);
            statement.setString(2, termoBusca);
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                transportadoras.add(mapRowToTransportadora(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar transportadoras por termo", e);
        }
        return transportadoras;
    }
    
    public Transportadora findByCpfCnpj(String cpfCnpj) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                FIND_QUERY + " WHERE t.cnpj = ?")) {
            
            statement.setString(1, cpfCnpj);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return mapRowToTransportadora(resultSet);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar transportadora por CPF/CNPJ", e);
        }
        return null;
    }
    
    public Transportadora save(Transportadora transportadora) {
        if (transportadora.getId() == null) {
            return insert(transportadora);
        } else {
            return update(transportadora);
        }
    }
    
    private Transportadora insert(Transportadora transportadora) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO transportadora (razao_social, nome_fantasia, endereco, numero, complemento, " +
                "bairro, cep, cidade_id, data_cadastro, ultima_modificacao, rg_ie, observacao, " +
                "condicao_pagamento_id, cnpj, ativo, tipo) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            statement.setString(1, transportadora.getTransportadora());
            statement.setString(2, transportadora.getApelido());
            statement.setString(3, transportadora.getEndereco());
            statement.setString(4, transportadora.getNumero());
            statement.setString(5, transportadora.getComplemento());
            statement.setString(6, transportadora.getBairro());
            statement.setString(7, transportadora.getCep());
            statement.setObject(8, transportadora.getCidadeId(), Types.BIGINT);
            statement.setTimestamp(9, Timestamp.valueOf(now));
            statement.setTimestamp(10, Timestamp.valueOf(now));
            statement.setString(11, transportadora.getRgIe());
            statement.setString(12, transportadora.getObservacao());
            statement.setObject(13, transportadora.getCondicaoPagamentoId(), Types.BIGINT);
            statement.setString(14, transportadora.getCpfCnpj());
            statement.setBoolean(15, transportadora.getAtivo() != null ? transportadora.getAtivo() : true);
            
            if (transportadora.getTipo() != null) {
                String tipoStr = transportadora.getTipo() == 2 ? "J" : "F";
                statement.setString(16, tipoStr);
            } else {
                statement.setString(16, "J");
            }
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao criar transportadora, nenhuma linha afetada.");
            }
            
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    transportadora.setId(generatedKeys.getLong(1));
                    transportadora.setDataCriacao(now);
                    transportadora.setDataAlteracao(now);
                } else {
                    throw new SQLException("Falha ao criar transportadora, nenhum ID obtido.");
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir transportadora", e);
        }
        return transportadora;
    }
    
    private Transportadora update(Transportadora transportadora) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "UPDATE transportadora SET razao_social = ?, nome_fantasia = ?, endereco = ?, " +
                "numero = ?, complemento = ?, bairro = ?, cep = ?, cidade_id = ?, " +
                "ultima_modificacao = ?, rg_ie = ?, observacao = ?, condicao_pagamento_id = ?, " +
                "cnpj = ?, ativo = ?, tipo = ? WHERE id = ?")) {
            
            LocalDateTime now = LocalDateTime.now();
            
            statement.setString(1, transportadora.getTransportadora());
            statement.setString(2, transportadora.getApelido());
            statement.setString(3, transportadora.getEndereco());
            statement.setString(4, transportadora.getNumero());
            statement.setString(5, transportadora.getComplemento());
            statement.setString(6, transportadora.getBairro());
            statement.setString(7, transportadora.getCep());
            statement.setObject(8, transportadora.getCidadeId(), Types.BIGINT);
            statement.setTimestamp(9, Timestamp.valueOf(now));
            statement.setString(10, transportadora.getRgIe());
            statement.setString(11, transportadora.getObservacao());
            statement.setObject(12, transportadora.getCondicaoPagamentoId(), Types.BIGINT);
            statement.setString(13, transportadora.getCpfCnpj());
            statement.setBoolean(14, transportadora.getAtivo() != null ? transportadora.getAtivo() : true);
            
            if (transportadora.getTipo() != null) {
                String tipoStr = transportadora.getTipo() == 2 ? "J" : "F";
                statement.setString(15, tipoStr);
            } else {
                statement.setString(15, "J");
            }
            
            statement.setLong(16, transportadora.getId());
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao atualizar transportadora, nenhuma linha afetada.");
            }
            
            transportadora.setDataAlteracao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar transportadora", e);
        }
        return transportadora;
    }
    
    public void deleteById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement("DELETE FROM transportadora WHERE id = ?")) {
            statement.setLong(1, id);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar transportadora", e);
        }
    }
    
    private Transportadora mapRowToTransportadora(ResultSet rs) throws SQLException {
        Transportadora transportadora = new Transportadora();
        transportadora.setId(rs.getLong("id"));
        transportadora.setTransportadora(rs.getString("razao_social"));
        transportadora.setApelido(rs.getString("nome_fantasia"));
        transportadora.setEndereco(rs.getString("endereco"));
        transportadora.setNumero(rs.getString("numero"));
        transportadora.setComplemento(rs.getString("complemento"));
        transportadora.setBairro(rs.getString("bairro"));
        transportadora.setCep(rs.getString("cep"));
        transportadora.setCidadeId(rs.getLong("cidade_id"));
        
        Timestamp dataCriacaoTimestamp = rs.getTimestamp("data_cadastro");
        if (dataCriacaoTimestamp != null) {
            transportadora.setDataCriacao(dataCriacaoTimestamp.toLocalDateTime());
        }
        
        Timestamp dataAlteracaoTimestamp = rs.getTimestamp("ultima_modificacao");
        if (dataAlteracaoTimestamp != null) {
            transportadora.setDataAlteracao(dataAlteracaoTimestamp.toLocalDateTime());
        }
        
        transportadora.setRgIe(rs.getString("rg_ie"));
        transportadora.setObservacao(rs.getString("observacao"));

        long condicaoId = rs.getLong("condicao_pagamento_id");
        if (rs.wasNull()) {
            transportadora.setCondicaoPagamentoId(null);
        } else {
            transportadora.setCondicaoPagamentoId(condicaoId);
        }
        
        transportadora.setCpfCnpj(rs.getString("cnpj"));
        transportadora.setAtivo(rs.getBoolean("ativo"));
        
        String tipoStr = rs.getString("tipo");
        if (tipoStr != null) {
            transportadora.setTipo("J".equalsIgnoreCase(tipoStr) ? 2 : 1);
        }

        if (transportadora.getCidadeId() != 0 && rs.getString("cidade_nome") != null) {
            com.example.PizzariaGraff.model.Cidade cidade = new com.example.PizzariaGraff.model.Cidade();
            cidade.setId(transportadora.getCidadeId());
            cidade.setNome(rs.getString("cidade_nome"));

            com.example.PizzariaGraff.model.Estado estado = new com.example.PizzariaGraff.model.Estado();
            estado.setUf(rs.getString("estado_uf"));
            cidade.setEstado(estado);

            transportadora.setCidade(cidade);
        }
        
        return transportadora;
    }
} 