package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.repository.DatabaseConnection;
//import com.example.PizzariaGraff.model.Cliente;
import com.example.PizzariaGraff.model.Nfe;
import com.example.PizzariaGraff.model.StatusNfe;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class NfeRepository {
    
    private final DatabaseConnection databaseConnection;
    
    public NfeRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }
    
    
    
    public List<Nfe> findAll() {
        List<Nfe> notas = new ArrayList<>();
        String sql = "SELECT * FROM nfe ORDER BY data_emissao DESC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                notas.add(mapResultSetToNfe(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar notas fiscais", e);
        }
        
        return notas;
    }
    
    public Optional<Nfe> findById(Long id) {
        String sql = "SELECT * FROM nfe WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToNfe(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar nota fiscal por ID", e);
        }
        
        return Optional.empty();
    }
    
    public Optional<Nfe> findByChaveAcesso(String chaveAcesso) {
        String sql = "SELECT * FROM nfe WHERE chave_acesso = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, chaveAcesso);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToNfe(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar nota fiscal por chave de acesso", e);
        }
        
        return Optional.empty();
    }
    
    public Optional<Nfe> findByNumero(String numero) {
        String sql = "SELECT * FROM nfe WHERE numero = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToNfe(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar nota fiscal por número", e);
        }
        
        return Optional.empty();
    }
    
    public List<Nfe> findByClienteId(Long clienteId) {
        List<Nfe> notas = new ArrayList<>();
        String sql = "SELECT * FROM nfe WHERE cliente_id = ? ORDER BY data_emissao DESC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, clienteId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                notas.add(mapResultSetToNfe(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar notas fiscais do cliente", e);
        }
        
        return notas;
    }
    
    public List<Nfe> findByDataBetween(LocalDate inicio, LocalDate fim) {
        List<Nfe> nfes = new ArrayList<>();
        String sql = "SELECT * FROM nfe WHERE data_emissao BETWEEN ? AND ? ORDER BY data_emissao DESC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setDate(1, Date.valueOf(inicio));
            stmt.setDate(2, Date.valueOf(fim));
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    nfes.add(mapResultSetToNfe(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar notas fiscais entre datas", e);
        }
        
        return nfes;
    }
    
    public List<Nfe> findByCancelada(Boolean cancelada) {
        List<Nfe> nfes = new ArrayList<>();
        String sql = "SELECT * FROM nfe WHERE cancelada = ? ORDER BY data_emissao DESC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setBoolean(1, cancelada);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    nfes.add(mapResultSetToNfe(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar notas fiscais por status de cancelamento", e);
        }
        
        return nfes;
    }
    
    public Nfe save(Nfe nfe) {
        if (nfe.getId() == null) {
            return insert(nfe);
        } else {
            return update(nfe);
        }
    }
    
    private Nfe insert(Nfe nfe) {
        String sql = "INSERT INTO nfe (numero, serie, chave_acesso, data_emissao, cliente_id, valor_total, " +
                    "forma_pagamento_id, condicao_pagamento_id, transportadora_id, veiculo_id, modalidade_id, cancelada, " +
                    "data_cadastro, ultima_modificacao) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, nfe.getNumero());
            stmt.setString(2, nfe.getSerie());
            stmt.setString(3, nfe.getChaveAcesso());
            stmt.setDate(4, Date.valueOf(nfe.getData()));
            
            if (nfe.getCliente() != null && nfe.getCliente().getId() != null) {
                stmt.setLong(5, nfe.getCliente().getId());
            } else {
                stmt.setNull(5, Types.BIGINT);
            }
            
            stmt.setBigDecimal(6, nfe.getValorTotal());
            
            if (nfe.getFormaPagamento() != null && nfe.getFormaPagamento().getId() != null) {
                stmt.setLong(7, nfe.getFormaPagamento().getId());
            } else {
                stmt.setNull(7, Types.BIGINT);
            }
            
            if (nfe.getCondicaoPagamento() != null && nfe.getCondicaoPagamento().getId() != null) {
                stmt.setLong(8, nfe.getCondicaoPagamento().getId());
            } else {
                stmt.setNull(8, Types.BIGINT);
            }
            
            if (nfe.getTransportadora() != null && nfe.getTransportadora().getId() != null) {
                stmt.setLong(9, nfe.getTransportadora().getId());
            } else {
                stmt.setNull(9, Types.BIGINT);
            }
            
            if (nfe.getVeiculo() != null && nfe.getVeiculo().getId() != null) {
                stmt.setLong(10, nfe.getVeiculo().getId());
            } else {
                stmt.setNull(10, Types.BIGINT);
            }
            
            if (nfe.getModalidade() != null && nfe.getModalidade().getId() != null) {
                stmt.setLong(11, nfe.getModalidade().getId());
            } else {
                stmt.setNull(11, Types.BIGINT);
            }
            
            stmt.setBoolean(12, nfe.getCancelada() != null ? nfe.getCancelada() : false);
            stmt.setTimestamp(13, Timestamp.valueOf(now));
            stmt.setTimestamp(14, Timestamp.valueOf(now));
            
            stmt.executeUpdate();
            
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                nfe.setId(rs.getLong(1));
                nfe.setDataCadastro(now);
                nfe.setUltimaModificacao(now);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir nota fiscal", e);
        }
        
        return nfe;
    }
    
    private Nfe update(Nfe nfe) {
        String sql = "UPDATE nfe SET numero = ?, serie = ?, chave_acesso = ?, data_emissao = ?, cliente_id = ?, " +
                   "valor_total = ?, forma_pagamento_id = ?, condicao_pagamento_id = ?, " +
                   "transportadora_id = ?, veiculo_id = ?, modalidade_id = ?, cancelada = ?, " +
                   "ultima_modificacao = ? " +
                   "WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, nfe.getNumero());
            stmt.setString(2, nfe.getSerie());
            stmt.setString(3, nfe.getChaveAcesso());
            stmt.setDate(4, Date.valueOf(nfe.getData()));
            
            if (nfe.getCliente() != null && nfe.getCliente().getId() != null) {
                stmt.setLong(5, nfe.getCliente().getId());
            } else {
                stmt.setNull(5, Types.BIGINT);
            }
            
            stmt.setBigDecimal(6, nfe.getValorTotal());
            
            if (nfe.getFormaPagamento() != null && nfe.getFormaPagamento().getId() != null) {
                stmt.setLong(7, nfe.getFormaPagamento().getId());
            } else {
                stmt.setNull(7, Types.BIGINT);
            }
            
            if (nfe.getCondicaoPagamento() != null && nfe.getCondicaoPagamento().getId() != null) {
                stmt.setLong(8, nfe.getCondicaoPagamento().getId());
            } else {
                stmt.setNull(8, Types.BIGINT);
            }
            
            if (nfe.getTransportadora() != null && nfe.getTransportadora().getId() != null) {
                stmt.setLong(9, nfe.getTransportadora().getId());
            } else {
                stmt.setNull(9, Types.BIGINT);
            }
            
            if (nfe.getVeiculo() != null && nfe.getVeiculo().getId() != null) {
                stmt.setLong(10, nfe.getVeiculo().getId());
            } else {
                stmt.setNull(10, Types.BIGINT);
            }
            
            if (nfe.getModalidade() != null && nfe.getModalidade().getId() != null) {
                stmt.setLong(11, nfe.getModalidade().getId());
            } else {
                stmt.setNull(11, Types.BIGINT);
            }
            
            stmt.setBoolean(12, nfe.getCancelada() != null ? nfe.getCancelada() : false);
            stmt.setTimestamp(13, Timestamp.valueOf(now));
            stmt.setLong(14, nfe.getId());
            
            stmt.executeUpdate();
            
            nfe.setUltimaModificacao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar nota fiscal", e);
        }
        
        return nfe;
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM nfe WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar nota fiscal", e);
        }
    }
    
    private Nfe mapResultSetToNfe(ResultSet rs) throws SQLException {
        Nfe nfe = new Nfe();
        nfe.setId(rs.getLong("id"));
        nfe.setNumero(rs.getString("numero"));
        nfe.setSerie(rs.getString("serie"));
        nfe.setChaveAcesso(rs.getString("chave_acesso"));
        nfe.setDataEmissao(rs.getDate("data_emissao").toLocalDate());
        nfe.setValorTotal(rs.getBigDecimal("valor_total"));
        nfe.setCancelada(rs.getBoolean("cancelada"));
        
        // Carregar campos de data
        try {
            Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
            if (dataCadastroTimestamp != null) {
                nfe.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
            }
            
            Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacaoTimestamp != null) {
                nfe.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
            }
        } catch (SQLException e) {
            System.err.println("Erro ao carregar campos de data: " + e.getMessage());
        }
        
        // Os campos de relacionamento serão carregados sob demanda ou por métodos específicos
        // Ex: nfe.setCliente(clienteRepository.findById(rs.getLong("cliente_id")).orElse(null));
        
        return nfe;
    }
} 