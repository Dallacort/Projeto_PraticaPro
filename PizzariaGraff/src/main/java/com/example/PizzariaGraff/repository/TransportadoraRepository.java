package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.Transportadora;
import com.example.PizzariaGraff.model.Cidade;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class TransportadoraRepository {
    
    private final DatabaseConnection databaseConnection;
    private final CidadeRepository cidadeRepository;
    
    public TransportadoraRepository(DatabaseConnection databaseConnection, CidadeRepository cidadeRepository) {
        this.databaseConnection = databaseConnection;
        this.cidadeRepository = cidadeRepository;
    }
    
    
    public List<Transportadora> findAll() {
        List<Transportadora> transportadoras = new ArrayList<>();
        String sql = "SELECT t.*, c.nome as cidade_nome FROM transportadora t " +
                     "LEFT JOIN cidade c ON t.cidade_id = c.id " +
                     "ORDER BY t.razao_social ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                transportadoras.add(mapResultSetToTransportadora(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar transportadoras", e);
        }
        
        return transportadoras;
    }
    
    public List<Transportadora> findByAtivoTrue() {
        List<Transportadora> transportadoras = new ArrayList<>();
        String sql = "SELECT t.*, c.nome as cidade_nome FROM transportadora t " +
                     "LEFT JOIN cidade c ON t.cidade_id = c.id " +
                     "WHERE t.ativo = true " +
                     "ORDER BY t.razao_social ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                transportadoras.add(mapResultSetToTransportadora(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar transportadoras ativas", e);
        }
        
        return transportadoras;
    }
    
    public Optional<Transportadora> findById(Long id) {
        String sql = "SELECT t.*, c.nome as cidade_nome FROM transportadora t " +
                     "LEFT JOIN cidade c ON t.cidade_id = c.id " +
                     "WHERE t.id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToTransportadora(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar transportadora por ID", e);
        }
        
        return Optional.empty();
    }
    
    public Optional<Transportadora> findByCnpj(String cnpj) {
        String sql = "SELECT t.*, c.nome as cidade_nome FROM transportadora t " +
                     "LEFT JOIN cidade c ON t.cidade_id = c.id " +
                     "WHERE t.cnpj = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, cnpj);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToTransportadora(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar transportadora por CNPJ", e);
        }
        
        return Optional.empty();
    }
    
    public Transportadora save(Transportadora transportadora) {
        if (transportadora.getId() == null) {
            return insert(transportadora);
        } else {
            return update(transportadora);
        }
    }
    
    private Transportadora insert(Transportadora transportadora) {
        String sql = "INSERT INTO transportadora (razao_social, nome_fantasia, cnpj, email, telefone, endereco, cidade_id, ativo, data_cadastro, ultima_modificacao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, transportadora.getRazaoSocial());
            stmt.setString(2, transportadora.getNomeFantasia());
            stmt.setString(3, transportadora.getCnpj());
            stmt.setString(4, transportadora.getEmail());
            stmt.setString(5, transportadora.getTelefone());
            stmt.setString(6, transportadora.getEndereco());
            
            if (transportadora.getCidade() != null) {
                stmt.setLong(7, transportadora.getCidade().getId());
            } else {
                stmt.setNull(7, java.sql.Types.BIGINT);
            }
            
            stmt.setBoolean(8, transportadora.getAtivo());
            stmt.setTimestamp(9, Timestamp.valueOf(now));
            stmt.setTimestamp(10, Timestamp.valueOf(now));
            
            stmt.executeUpdate();
            
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                transportadora.setId(rs.getLong(1));
                transportadora.setDataCadastro(now);
                transportadora.setUltimaModificacao(now);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir transportadora", e);
        }
        
        return transportadora;
    }
    
    private Transportadora update(Transportadora transportadora) {
        String sql = "UPDATE transportadora SET razao_social = ?, nome_fantasia = ?, cnpj = ?, email = ?, " +
                     "telefone = ?, endereco = ?, cidade_id = ?, ativo = ?, ultima_modificacao = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, transportadora.getRazaoSocial());
            stmt.setString(2, transportadora.getNomeFantasia());
            stmt.setString(3, transportadora.getCnpj());
            stmt.setString(4, transportadora.getEmail());
            stmt.setString(5, transportadora.getTelefone());
            stmt.setString(6, transportadora.getEndereco());
            
            if (transportadora.getCidade() != null) {
                stmt.setLong(7, transportadora.getCidade().getId());
            } else {
                stmt.setNull(7, java.sql.Types.BIGINT);
            }
            
            stmt.setBoolean(8, transportadora.getAtivo());
            stmt.setTimestamp(9, Timestamp.valueOf(now));
            stmt.setLong(10, transportadora.getId());
            
            stmt.executeUpdate();
            
            transportadora.setUltimaModificacao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar transportadora", e);
        }
        
        return transportadora;
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM transportadora WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar transportadora", e);
        }
    }
    
    private Transportadora mapResultSetToTransportadora(ResultSet rs) throws SQLException {
        Transportadora transportadora = new Transportadora();
        transportadora.setId(rs.getLong("id"));
        transportadora.setRazaoSocial(rs.getString("razao_social"));
        transportadora.setNomeFantasia(rs.getString("nome_fantasia"));
        transportadora.setCnpj(rs.getString("cnpj"));
        transportadora.setEmail(rs.getString("email"));
        transportadora.setTelefone(rs.getString("telefone"));
        transportadora.setEndereco(rs.getString("endereco"));
        transportadora.setAtivo(rs.getBoolean("ativo"));
        
        // Carregar campos de data
        try {
            Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
            if (dataCadastroTimestamp != null) {
                transportadora.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
            }
            
            Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacaoTimestamp != null) {
                transportadora.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
            }
        } catch (SQLException e) {
            System.err.println("Erro ao carregar campos de data: " + e.getMessage());
        }
        
        // Carregar a cidade relacionada
        Long cidadeId = rs.getLong("cidade_id");
        if (cidadeId > 0) {
            Cidade cidade = new Cidade();
            cidade.setId(cidadeId);
            
            try {
                cidade.setNome(rs.getString("cidade_nome"));
            } catch (SQLException e) {
                // Se não conseguir obter o nome via JOIN, buscar cidade do repositório
                Optional<Cidade> cidadeOpt = cidadeRepository.findById(cidadeId);
                if (cidadeOpt.isPresent()) {
                    cidade = cidadeOpt.get();
                }
            }
            
            transportadora.setCidade(cidade);
        }
        
        return transportadora;
    }
} 