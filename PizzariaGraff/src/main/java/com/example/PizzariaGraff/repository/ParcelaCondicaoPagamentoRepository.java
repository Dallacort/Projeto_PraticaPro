package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.CondicaoPagamento;
import com.example.PizzariaGraff.model.FormaPagamento;
import com.example.PizzariaGraff.model.ParcelaCondicaoPagamento;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ParcelaCondicaoPagamentoRepository {
    
    private final DatabaseConnection databaseConnection;
    
    public ParcelaCondicaoPagamentoRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }
    
    public List<ParcelaCondicaoPagamento> findByCondicaoPagamentoId(Long condicaoPagamentoId) {
        List<ParcelaCondicaoPagamento> parcelas = new ArrayList<>();
        String sql = "SELECT p.*, f.nome as forma_nome FROM parcela_condicao_pagamento p " +
                     "LEFT JOIN forma_pagamento f ON p.forma_pagamento_id = f.id " +
                     "WHERE p.condicao_pagamento_id = ? " +
                     "ORDER BY p.numero ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, condicaoPagamentoId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                parcelas.add(mapResultSetToParcela(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar parcelas por condição de pagamento", e);
        }
        
        return parcelas;
    }
    
    public ParcelaCondicaoPagamento save(ParcelaCondicaoPagamento parcela) {
        if (parcela.getId() == null) {
            return insert(parcela);
        } else {
            return update(parcela);
        }
    }
    
    private ParcelaCondicaoPagamento insert(ParcelaCondicaoPagamento parcela) {
        String sql = "INSERT INTO parcela_condicao_pagamento " +
                     "(condicao_pagamento_id, numero, dias, percentual, forma_pagamento_id, data_cadastro, ultima_modificacao) " +
                     "VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setLong(1, parcela.getCondicaoPagamento().getId());
            stmt.setInt(2, parcela.getNumero());
            stmt.setInt(3, parcela.getDias());
            stmt.setDouble(4, parcela.getPercentual());
            
            if (parcela.getFormaPagamento() != null && parcela.getFormaPagamento().getId() != null) {
                stmt.setLong(5, parcela.getFormaPagamento().getId());
            } else {
                stmt.setNull(5, Types.BIGINT);
            }
            
            stmt.executeUpdate();
            
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                parcela.setId(rs.getLong(1));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir parcela de condição de pagamento", e);
        }
        
        return parcela;
    }
    
    private ParcelaCondicaoPagamento update(ParcelaCondicaoPagamento parcela) {
        String sql = "UPDATE parcela_condicao_pagamento " +
                     "SET numero = ?, dias = ?, percentual = ?, forma_pagamento_id = ?, ultima_modificacao = CURRENT_TIMESTAMP " +
                     "WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, parcela.getNumero());
            stmt.setInt(2, parcela.getDias());
            stmt.setDouble(3, parcela.getPercentual());
            
            if (parcela.getFormaPagamento() != null && parcela.getFormaPagamento().getId() != null) {
                stmt.setLong(4, parcela.getFormaPagamento().getId());
            } else {
                stmt.setNull(4, Types.BIGINT);
            }
            
            stmt.setLong(5, parcela.getId());
            
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar parcela de condição de pagamento", e);
        }
        
        return parcela;
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM parcela_condicao_pagamento WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar parcela de condição de pagamento", e);
        }
    }
    
    public void deleteByCondicaoPagamentoId(Long condicaoPagamentoId) {
        String sql = "DELETE FROM parcela_condicao_pagamento WHERE condicao_pagamento_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, condicaoPagamentoId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar parcelas por condição de pagamento", e);
        }
    }
    
    private ParcelaCondicaoPagamento mapResultSetToParcela(ResultSet rs) throws SQLException {
        ParcelaCondicaoPagamento parcela = new ParcelaCondicaoPagamento();
        parcela.setId(rs.getLong("id"));
        parcela.setNumero(rs.getInt("numero"));
        parcela.setDias(rs.getInt("dias"));
        
        // Ler percentual do banco
        double percentual = rs.getDouble("percentual");
        if (rs.wasNull()) {
            percentual = 0.0;
        }
        parcela.setPercentual(percentual);
        
        System.out.println("Parcela " + parcela.getNumero() + " - Percentual lido do banco: " + percentual);
        
        // Configura a condição de pagamento
        CondicaoPagamento condicao = new CondicaoPagamento();
        condicao.setId(rs.getLong("condicao_pagamento_id"));
        parcela.setCondicaoPagamento(condicao);
        
        // Configura a forma de pagamento se existir
        Long formaPagamentoId = rs.getLong("forma_pagamento_id");
        if (!rs.wasNull()) {
            FormaPagamento formaPagamento = new FormaPagamento();
            formaPagamento.setId(formaPagamentoId);
            
            // Se tivermos o nome da forma de pagamento no resultado
            try {
                String formaNome = rs.getString("forma_nome");
                if (formaNome != null) {
                    formaPagamento.setNome(formaNome);
                }
            } catch (SQLException e) {
                // Coluna pode não existir no resultado, o que é aceitável
            }
            
            parcela.setFormaPagamento(formaPagamento);
        }
        
        // Processa as datas
        Timestamp dataCadastro = rs.getTimestamp("data_cadastro");
        if (dataCadastro != null) {
            parcela.setDataCadastro(dataCadastro.toLocalDateTime());
        }
        
        Timestamp ultimaModificacao = rs.getTimestamp("ultima_modificacao");
        if (ultimaModificacao != null) {
            parcela.setUltimaModificacao(ultimaModificacao.toLocalDateTime());
        }
        
        return parcela;
    }
} 