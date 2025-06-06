package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.CondicaoPagamento;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class CondicaoPagamentoRepository {
    
    private final DatabaseConnection databaseConnection;
    private final ParcelaCondicaoPagamentoRepository parcelaRepository;
    
    public CondicaoPagamentoRepository(DatabaseConnection databaseConnection, 
                                      ParcelaCondicaoPagamentoRepository parcelaRepository) {
        this.databaseConnection = databaseConnection;
        this.parcelaRepository = parcelaRepository;
    }
    
    public List<CondicaoPagamento> findAll() {
        List<CondicaoPagamento> condicoes = new ArrayList<>();
        String sql = "SELECT * FROM condicao_pagamento ORDER BY condicao_pagamento ASC";
        
        System.out.println("CondicaoPagamentoRepository.findAll() - Executando SQL: " + sql);
        
        try (Connection conn = databaseConnection.getConnection()) {
            System.out.println("CondicaoPagamentoRepository.findAll() - Conexão obtida com sucesso");
            
            try (Statement stmt = conn.createStatement()) {
                System.out.println("CondicaoPagamentoRepository.findAll() - Statement criado com sucesso");
                
                try (ResultSet rs = stmt.executeQuery(sql)) {
                    System.out.println("CondicaoPagamentoRepository.findAll() - Query executada com sucesso");
                    
                    while (rs.next()) {
                        try {
                            CondicaoPagamento condicao = mapResultSetToCondicaoPagamento(rs);
                            condicao.setParcelasCondicaoPagamento(parcelaRepository.findByCondicaoPagamentoId(condicao.getId()));
                            condicoes.add(condicao);
                        } catch (SQLException e) {
                            System.err.println("Erro ao mapear condição de pagamento: " + e.getMessage());
                            e.printStackTrace();
                            // Continua para o próximo registro
                        }
                    }
                    
                    System.out.println("CondicaoPagamentoRepository.findAll() - " + condicoes.size() + " condições encontradas");
                }
            }
        } catch (SQLException e) {
            System.err.println("CondicaoPagamentoRepository.findAll() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar condições de pagamento", e);
        }
        
        return condicoes;
    }
    
    public List<CondicaoPagamento> findByAtivoTrue() {
        List<CondicaoPagamento> condicoes = new ArrayList<>();
        String sql = "SELECT * FROM condicao_pagamento WHERE ativo = true ORDER BY condicao_pagamento ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                try {
                    CondicaoPagamento condicao = mapResultSetToCondicaoPagamento(rs);
                    condicao.setParcelasCondicaoPagamento(parcelaRepository.findByCondicaoPagamentoId(condicao.getId()));
                    condicoes.add(condicao);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear condição de pagamento: " + e.getMessage());
                    // Continua para o próximo registro
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar condições de pagamento ativas", e);
        }
        
        return condicoes;
    }
    
    public Optional<CondicaoPagamento> findById(Long id) {
        String sql = "SELECT * FROM condicao_pagamento WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                try {
                    CondicaoPagamento condicao = mapResultSetToCondicaoPagamento(rs);
                    condicao.setParcelasCondicaoPagamento(parcelaRepository.findByCondicaoPagamentoId(condicao.getId()));
                    return Optional.of(condicao);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear condição de pagamento: " + e.getMessage());
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar condição de pagamento por ID", e);
        }
        
        return Optional.empty();
    }
    
    public Optional<CondicaoPagamento> findByCondicaoPagamento(String condicaoPagamento) {
        String sql = "SELECT * FROM condicao_pagamento WHERE condicao_pagamento = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, condicaoPagamento);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                try {
                    CondicaoPagamento condicao = mapResultSetToCondicaoPagamento(rs);
                    condicao.setParcelasCondicaoPagamento(parcelaRepository.findByCondicaoPagamentoId(condicao.getId()));
                    return Optional.of(condicao);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear condição de pagamento: " + e.getMessage());
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar condição de pagamento", e);
        }
        
        return Optional.empty();
    }
    
    public List<CondicaoPagamento> findByTermo(String termo) {
        List<CondicaoPagamento> condicoes = new ArrayList<>();
        String sql = "SELECT * FROM condicao_pagamento WHERE LOWER(condicao_pagamento) LIKE LOWER(?) ORDER BY condicao_pagamento ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, "%" + termo + "%");
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                try {
                    CondicaoPagamento condicao = mapResultSetToCondicaoPagamento(rs);
                    condicao.setParcelasCondicaoPagamento(parcelaRepository.findByCondicaoPagamentoId(condicao.getId()));
                    condicoes.add(condicao);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear condição de pagamento: " + e.getMessage());
                    // Continua para o próximo registro
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao pesquisar condições de pagamento", e);
        }
        
        return condicoes;
    }
    
    public boolean existsByCondicaoPagamento(String condicaoPagamento) {
        String sql = "SELECT COUNT(*) FROM condicao_pagamento WHERE condicao_pagamento = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, condicaoPagamento);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao verificar existência de condição de pagamento", e);
        }
        
        return false;
    }
    
    public CondicaoPagamento save(CondicaoPagamento condicao) {
        if (condicao.getId() == null) {
            return insert(condicao);
        } else {
            return update(condicao);
        }
    }
    
    private CondicaoPagamento insert(CondicaoPagamento condicao) {
        String sql = "INSERT INTO condicao_pagamento " +
                     "(condicao_pagamento, numero_parcelas, parcelas, ativo, dias_primeira_parcela, dias_entre_parcelas, " +
                     "percentual_juros, percentual_multa, percentual_desconto, data_cadastro, ultima_modificacao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, condicao.getCondicaoPagamento());
            stmt.setInt(2, condicao.getNumeroParcelas() != null ? condicao.getNumeroParcelas() : 1);
            stmt.setInt(3, condicao.getParcelas() != null ? condicao.getParcelas() : 1);
            stmt.setBoolean(4, condicao.getAtivo() != null ? condicao.getAtivo() : true);
            stmt.setInt(5, condicao.getDiasPrimeiraParcela() != null ? condicao.getDiasPrimeiraParcela() : 0);
            stmt.setInt(6, condicao.getDiasEntreParcelas() != null ? condicao.getDiasEntreParcelas() : 0);
            stmt.setDouble(7, condicao.getPercentualJuros() != null ? condicao.getPercentualJuros() : 0.0);
            stmt.setDouble(8, condicao.getPercentualMulta() != null ? condicao.getPercentualMulta() : 0.0);
            stmt.setDouble(9, condicao.getPercentualDesconto() != null ? condicao.getPercentualDesconto() : 0.0);
            stmt.setTimestamp(10, Timestamp.valueOf(now));
            stmt.setTimestamp(11, Timestamp.valueOf(now));
            
            stmt.executeUpdate();
            
            ResultSet generatedKeys = stmt.getGeneratedKeys();
            if (generatedKeys.next()) {
                condicao.setId(generatedKeys.getLong(1));
            }
            
            condicao.setDataCadastro(now);
            condicao.setUltimaModificacao(now);
            
            // Salvar parcelas, se houver
            if (condicao.getParcelasCondicaoPagamento() != null && !condicao.getParcelasCondicaoPagamento().isEmpty()) {
                for (var parcela : condicao.getParcelasCondicaoPagamento()) {
                    parcela.setCondicaoPagamento(condicao);
                    parcelaRepository.save(parcela);
                }
            }
            
            return condicao;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir condição de pagamento", e);
        }
    }
    
    private CondicaoPagamento update(CondicaoPagamento condicao) {
        String sql = "UPDATE condicao_pagamento SET " +
                     "condicao_pagamento = ?, numero_parcelas = ?, parcelas = ?, " +
                     "ativo = ?, dias_primeira_parcela = ?, dias_entre_parcelas = ?, " +
                     "percentual_juros = ?, percentual_multa = ?, percentual_desconto = ?, ultima_modificacao = ? " +
                     "WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, condicao.getCondicaoPagamento());
            stmt.setInt(2, condicao.getNumeroParcelas() != null ? condicao.getNumeroParcelas() : 1);
            stmt.setInt(3, condicao.getParcelas() != null ? condicao.getParcelas() : 1);
            stmt.setBoolean(4, condicao.getAtivo() != null ? condicao.getAtivo() : true);
            stmt.setInt(5, condicao.getDiasPrimeiraParcela() != null ? condicao.getDiasPrimeiraParcela() : 0);
            stmt.setInt(6, condicao.getDiasEntreParcelas() != null ? condicao.getDiasEntreParcelas() : 0);
            stmt.setDouble(7, condicao.getPercentualJuros() != null ? condicao.getPercentualJuros() : 0.0);
            stmt.setDouble(8, condicao.getPercentualMulta() != null ? condicao.getPercentualMulta() : 0.0);
            stmt.setDouble(9, condicao.getPercentualDesconto() != null ? condicao.getPercentualDesconto() : 0.0);
            stmt.setTimestamp(10, Timestamp.valueOf(now));
            stmt.setLong(11, condicao.getId());
            
            stmt.executeUpdate();
            
            condicao.setUltimaModificacao(now);
            
            // Excluir todas as parcelas existentes antes de adicionar as novas
            if (condicao.getParcelasCondicaoPagamento() != null) {
                // Deletar parcelas existentes
                parcelaRepository.deleteByCondicaoPagamentoId(condicao.getId());
                
                // Adicionar as novas parcelas
                for (var parcela : condicao.getParcelasCondicaoPagamento()) {
                    parcela.setCondicaoPagamento(condicao);
                    parcela.setId(null); // Forçar a criação de novas parcelas
                    parcelaRepository.save(parcela);
                }
            }
            
            return condicao;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar condição de pagamento", e);
        }
    }
    
    public void deleteById(Long id) {
        // Ao invés de excluir fisicamente, vamos modificar para exclusão lógica
        String sql = "UPDATE condicao_pagamento SET ativo = false, ultima_modificacao = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setLong(2, id);
            stmt.executeUpdate();
            
            System.out.println("Condição de pagamento ID " + id + " marcada como inativa (exclusão lógica)");
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao realizar exclusão lógica da condição de pagamento", e);
        }
    }
    
    public void deleteParcelasByCondicaoPagamentoId(Long condicaoPagamentoId) {
        String sql = "DELETE FROM parcela_condicao_pagamento WHERE condicao_pagamento_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, condicaoPagamentoId);
            int rowsAffected = stmt.executeUpdate();
            System.out.println("Removidas " + rowsAffected + " parcelas da condição de pagamento ID: " + condicaoPagamentoId);
        } catch (SQLException e) {
            System.err.println("Erro ao excluir parcelas da condição de pagamento: " + e.getMessage());
            throw new RuntimeException("Erro ao excluir parcelas da condição de pagamento", e);
        }
    }
    
    private CondicaoPagamento mapResultSetToCondicaoPagamento(ResultSet rs) throws SQLException {
        CondicaoPagamento condicao = new CondicaoPagamento();
        condicao.setId(rs.getLong("id"));
        condicao.setCondicaoPagamento(rs.getString("condicao_pagamento"));
        
        try {
            condicao.setNumeroParcelas(rs.getInt("numero_parcelas"));
        } catch (SQLException e) {
            condicao.setNumeroParcelas(1);
            System.err.println("Coluna 'numero_parcelas' não encontrada, usando valor padrão 1");
        }

        try {
            condicao.setParcelas(rs.getInt("parcelas"));
        } catch (SQLException e) {
            condicao.setParcelas(1);
            System.err.println("Coluna 'parcelas' não encontrada, usando valor padrão 1");
        }

        try {
            condicao.setDiasPrimeiraParcela(rs.getInt("dias_primeira_parcela"));
        } catch (SQLException e) {
            condicao.setDiasPrimeiraParcela(0);
            System.err.println("Coluna 'dias_primeira_parcela' não encontrada, usando valor padrão 0");
        }

        try {
            condicao.setDiasEntreParcelas(rs.getInt("dias_entre_parcelas"));
        } catch (SQLException e) {
            condicao.setDiasEntreParcelas(0);
            System.err.println("Coluna 'dias_entre_parcelas' não encontrada, usando valor padrão 0");
        }

        try {
            condicao.setPercentualJuros(rs.getDouble("percentual_juros"));
        } catch (SQLException e) {
            condicao.setPercentualJuros(0.0);
            System.err.println("Coluna 'percentual_juros' não encontrada, usando valor padrão 0.0");
        }

        try {
            condicao.setPercentualMulta(rs.getDouble("percentual_multa"));
        } catch (SQLException e) {
            condicao.setPercentualMulta(0.0);
            System.err.println("Coluna 'percentual_multa' não encontrada, usando valor padrão 0.0");
        }

        try {
            condicao.setPercentualDesconto(rs.getDouble("percentual_desconto"));
        } catch (SQLException e) {
            condicao.setPercentualDesconto(0.0);
            System.err.println("Coluna 'percentual_desconto' não encontrada, usando valor padrão 0.0");
        }

        try {
            condicao.setAtivo(rs.getBoolean("ativo"));
        } catch (SQLException e) {
            condicao.setAtivo(true);
            System.err.println("Coluna 'ativo' não encontrada, usando valor padrão true");
        }
        
        try {
            Timestamp dataCadastro = rs.getTimestamp("data_cadastro");
            if (dataCadastro != null) {
                condicao.setDataCadastro(dataCadastro.toLocalDateTime());
            }
        } catch (SQLException e) {
            System.err.println("Coluna 'data_cadastro' não encontrada");
        }
        
        try {
            Timestamp ultimaModificacao = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacao != null) {
                condicao.setUltimaModificacao(ultimaModificacao.toLocalDateTime());
            }
        } catch (SQLException e) {
            System.err.println("Coluna 'ultima_modificacao' não encontrada");
        }
        
        return condicao;
    }
}
