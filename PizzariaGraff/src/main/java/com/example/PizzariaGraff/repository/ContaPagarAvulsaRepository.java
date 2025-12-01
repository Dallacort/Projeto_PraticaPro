package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.ContaPagarAvulsa;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ContaPagarAvulsaRepository {
    
    private final DatabaseConnection databaseConnection;
    private final FornecedorRepository fornecedorRepository;
    private final FormaPagamentoRepository formaPagamentoRepository;
    
    public ContaPagarAvulsaRepository(DatabaseConnection databaseConnection,
                                     FornecedorRepository fornecedorRepository,
                                     FormaPagamentoRepository formaPagamentoRepository) {
        this.databaseConnection = databaseConnection;
        this.fornecedorRepository = fornecedorRepository;
        this.formaPagamentoRepository = formaPagamentoRepository;
    }
    
    public List<ContaPagarAvulsa> findAll() {
        List<ContaPagarAvulsa> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_pagar_avulsa ORDER BY data_vencimento ASC, num_parcela ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            System.out.println("Buscando contas avulsas...");
            int count = 0;
            while (rs.next()) {
                try {
                    contas.add(mapRowToContaPagarAvulsa(rs));
                    count++;
                } catch (Exception e) {
                    System.err.println("Erro ao mapear conta avulsa: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            System.out.println("Total de contas avulsas encontradas: " + count);
        } catch (SQLException e) {
            System.err.println("Erro SQL ao buscar contas a pagar avulsas: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar contas a pagar avulsas", e);
        }
        
        return contas;
    }
    
    public Optional<ContaPagarAvulsa> findById(Long id) {
        String sql = "SELECT * FROM contas_pagar_avulsa WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToContaPagarAvulsa(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar conta a pagar avulsa", e);
        }
        
        return Optional.empty();
    }
    
    public List<ContaPagarAvulsa> findByFornecedorId(Long fornecedorId) {
        List<ContaPagarAvulsa> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_pagar_avulsa WHERE fornecedor_id = ? ORDER BY data_vencimento ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, fornecedorId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contas.add(mapRowToContaPagarAvulsa(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas por fornecedor", e);
        }
        
        return contas;
    }
    
    public Optional<ContaPagarAvulsa> findByNota(String numeroNota, String modelo, String serie, Long fornecedorId) {
        String sql = "SELECT * FROM contas_pagar_avulsa WHERE numero_nota = ? AND modelo = ? AND serie = ? AND fornecedor_id = ? LIMIT 1";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numeroNota);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, fornecedorId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToContaPagarAvulsa(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar conta por nota", e);
        }
        
        return Optional.empty();
    }
    
    public List<ContaPagarAvulsa> findByStatus(String status) {
        List<ContaPagarAvulsa> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_pagar_avulsa WHERE status = ? ORDER BY data_vencimento ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, status);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contas.add(mapRowToContaPagarAvulsa(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas por status", e);
        }
        
        return contas;
    }
    
    public List<ContaPagarAvulsa> findVencidas() {
        List<ContaPagarAvulsa> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_pagar_avulsa WHERE status = 'PENDENTE' AND data_vencimento < CURDATE() ORDER BY data_vencimento ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                contas.add(mapRowToContaPagarAvulsa(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas vencidas", e);
        }
        
        return contas;
    }
    
    public ContaPagarAvulsa save(ContaPagarAvulsa conta) {
        if (conta.getId() != null && conta.getId() > 0) {
            return update(conta);
        } else {
            return insert(conta);
        }
    }
    
    private ContaPagarAvulsa insert(ContaPagarAvulsa conta) {
        String sql = "INSERT INTO contas_pagar_avulsa (numero_nota, modelo, serie, fornecedor_id, " +
                     "num_parcela, valor_parcela, data_emissao, data_vencimento, data_pagamento, " +
                     "valor_pago, juros, multa, desconto, status, forma_pagamento_id, observacao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            setContaParameters(stmt, conta);
            stmt.executeUpdate();
            
            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    conta.setId(generatedKeys.getLong(1));
                }
            }
            
            return findById(conta.getId()).orElseThrow(() -> new RuntimeException("Erro ao recuperar conta inserida"));
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir conta a pagar avulsa: " + e.getMessage(), e);
        }
    }
    
    private ContaPagarAvulsa update(ContaPagarAvulsa conta) {
        String sql = "UPDATE contas_pagar_avulsa SET numero_nota = ?, modelo = ?, serie = ?, " +
                     "fornecedor_id = ?, num_parcela = ?, valor_parcela = ?, data_emissao = ?, " +
                     "data_vencimento = ?, data_pagamento = ?, valor_pago = ?, juros = ?, multa = ?, " +
                     "desconto = ?, status = ?, forma_pagamento_id = ?, observacao = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            setContaParameters(stmt, conta);
            stmt.setLong(17, conta.getId());
            
            stmt.executeUpdate();
            
            return findById(conta.getId()).orElseThrow(() -> new RuntimeException("Erro ao recuperar conta atualizada"));
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar conta a pagar avulsa: " + e.getMessage(), e);
        }
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM contas_pagar_avulsa WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar conta a pagar avulsa", e);
        }
    }
    
    private void setContaParameters(PreparedStatement stmt, ContaPagarAvulsa conta) throws SQLException {
        int paramIndex = 1;
        stmt.setString(paramIndex++, conta.getNumeroNota());
        stmt.setString(paramIndex++, conta.getModelo());
        stmt.setString(paramIndex++, conta.getSerie());
        stmt.setLong(paramIndex++, conta.getFornecedorId());
        stmt.setInt(paramIndex++, conta.getNumParcela());
        stmt.setBigDecimal(paramIndex++, conta.getValorParcela());
        stmt.setDate(paramIndex++, Date.valueOf(conta.getDataEmissao()));
        stmt.setDate(paramIndex++, Date.valueOf(conta.getDataVencimento()));
        stmt.setDate(paramIndex++, conta.getDataPagamento() != null ? Date.valueOf(conta.getDataPagamento()) : null);
        stmt.setBigDecimal(paramIndex++, conta.getValorPago());
        stmt.setBigDecimal(paramIndex++, conta.getJuros());
        stmt.setBigDecimal(paramIndex++, conta.getMulta());
        stmt.setBigDecimal(paramIndex++, conta.getDesconto());
        stmt.setString(paramIndex++, conta.getStatus());
        stmt.setObject(paramIndex++, conta.getFormaPagamentoId());
        stmt.setString(paramIndex++, conta.getObservacao());
    }
    
    private ContaPagarAvulsa mapRowToContaPagarAvulsa(ResultSet rs) throws SQLException {
        ContaPagarAvulsa conta = new ContaPagarAvulsa();
        conta.setId(rs.getLong("id"));
        conta.setNumeroNota(rs.getString("numero_nota"));
        conta.setModelo(rs.getString("modelo"));
        conta.setSerie(rs.getString("serie"));
        conta.setFornecedorId(rs.getLong("fornecedor_id"));
        conta.setNumParcela(rs.getInt("num_parcela"));
        conta.setValorParcela(rs.getBigDecimal("valor_parcela"));
        
        Date dataEmissao = rs.getDate("data_emissao");
        conta.setDataEmissao(dataEmissao != null ? dataEmissao.toLocalDate() : null);
        
        Date dataVencimento = rs.getDate("data_vencimento");
        conta.setDataVencimento(dataVencimento != null ? dataVencimento.toLocalDate() : null);
        
        Date dataPagamento = rs.getDate("data_pagamento");
        conta.setDataPagamento(dataPagamento != null ? dataPagamento.toLocalDate() : null);
        
        conta.setValorPago(rs.getBigDecimal("valor_pago"));
        conta.setJuros(rs.getBigDecimal("juros"));
        conta.setMulta(rs.getBigDecimal("multa"));
        conta.setDesconto(rs.getBigDecimal("desconto"));
        conta.setStatus(rs.getString("status"));
        
        Long formaPagamentoId = rs.getObject("forma_pagamento_id", Long.class);
        conta.setFormaPagamentoId(formaPagamentoId);
        
        conta.setObservacao(rs.getString("observacao"));
        
        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        conta.setDataCriacao(dataCriacao != null ? dataCriacao.toLocalDateTime() : null);
        
        Timestamp dataAtualizacao = rs.getTimestamp("data_atualizacao");
        conta.setDataAtualizacao(dataAtualizacao != null ? dataAtualizacao.toLocalDateTime() : null);
        
        // Carregar fornecedor
        fornecedorRepository.findById(conta.getFornecedorId()).ifPresent(conta::setFornecedor);
        
        // Carregar forma de pagamento
        if (formaPagamentoId != null) {
            formaPagamentoRepository.findById(formaPagamentoId).ifPresent(conta::setFormaPagamento);
        }
        
        return conta;
    }
}

