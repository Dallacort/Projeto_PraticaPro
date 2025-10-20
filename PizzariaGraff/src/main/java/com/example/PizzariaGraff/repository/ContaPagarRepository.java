package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.ContaPagar;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ContaPagarRepository {
    
    private final DatabaseConnection databaseConnection;
    private final FornecedorRepository fornecedorRepository;
    private final FormaPagamentoRepository formaPagamentoRepository;
    
    public ContaPagarRepository(DatabaseConnection databaseConnection,
                                FornecedorRepository fornecedorRepository,
                                FormaPagamentoRepository formaPagamentoRepository) {
        this.databaseConnection = databaseConnection;
        this.fornecedorRepository = fornecedorRepository;
        this.formaPagamentoRepository = formaPagamentoRepository;
    }
    
    public List<ContaPagar> findAll() {
        List<ContaPagar> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_pagar ORDER BY data_vencimento ASC, numero_parcela ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                contas.add(mapRowToContaPagar(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas a pagar", e);
        }
        
        return contas;
    }
    
    public Optional<ContaPagar> findById(Long id) {
        String sql = "SELECT * FROM contas_pagar WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToContaPagar(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar conta a pagar", e);
        }
        
        return Optional.empty();
    }
    
    public List<ContaPagar> findByFornecedorId(Long fornecedorId) {
        List<ContaPagar> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_pagar WHERE fornecedor_id = ? ORDER BY data_vencimento ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, fornecedorId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contas.add(mapRowToContaPagar(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas por fornecedor", e);
        }
        
        return contas;
    }
    
    public List<ContaPagar> findBySituacao(String situacao) {
        List<ContaPagar> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_pagar WHERE situacao = ? ORDER BY data_vencimento ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, situacao);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contas.add(mapRowToContaPagar(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas por situação", e);
        }
        
        return contas;
    }
    
    public List<ContaPagar> findByNota(String numero, String modelo, String serie, Long fornecedorId) {
        List<ContaPagar> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_pagar WHERE nota_numero = ? AND nota_modelo = ? AND nota_serie = ? AND fornecedor_id = ? ORDER BY numero_parcela ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, fornecedorId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contas.add(mapRowToContaPagar(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas por nota", e);
        }
        
        return contas;
    }
    
    public List<ContaPagar> findVencidas() {
        List<ContaPagar> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_pagar WHERE situacao = 'PENDENTE' AND data_vencimento < CURDATE() ORDER BY data_vencimento ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                contas.add(mapRowToContaPagar(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas vencidas", e);
        }
        
        return contas;
    }
    
    public ContaPagar save(ContaPagar conta) {
        if (conta.getId() != null && conta.getId() > 0) {
            return update(conta);
        } else {
            return insert(conta);
        }
    }
    
    private ContaPagar insert(ContaPagar conta) {
        String sql = "INSERT INTO contas_pagar (nota_numero, nota_modelo, nota_serie, fornecedor_id, " +
                     "numero_parcela, total_parcelas, valor_original, valor_pago, valor_desconto, " +
                     "valor_juros, valor_multa, valor_total, data_emissao, data_vencimento, " +
                     "data_pagamento, forma_pagamento_id, situacao, observacoes) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
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
            throw new RuntimeException("Erro ao inserir conta a pagar: " + e.getMessage(), e);
        }
    }
    
    private ContaPagar update(ContaPagar conta) {
        String sql = "UPDATE contas_pagar SET valor_pago = ?, valor_desconto = ?, valor_juros = ?, " +
                     "valor_multa = ?, valor_total = ?, data_pagamento = ?, forma_pagamento_id = ?, " +
                     "situacao = ?, observacoes = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setBigDecimal(1, conta.getValorPago());
            stmt.setBigDecimal(2, conta.getValorDesconto());
            stmt.setBigDecimal(3, conta.getValorJuros());
            stmt.setBigDecimal(4, conta.getValorMulta());
            stmt.setBigDecimal(5, conta.getValorTotal());
            stmt.setDate(6, conta.getDataPagamento() != null ? Date.valueOf(conta.getDataPagamento()) : null);
            stmt.setObject(7, conta.getFormaPagamentoId());
            stmt.setString(8, conta.getSituacao());
            stmt.setString(9, conta.getObservacoes());
            stmt.setLong(10, conta.getId());
            
            stmt.executeUpdate();
            
            return findById(conta.getId()).orElseThrow(() -> new RuntimeException("Erro ao recuperar conta atualizada"));
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar conta a pagar: " + e.getMessage(), e);
        }
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM contas_pagar WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar conta a pagar", e);
        }
    }
    
    public void deleteByNota(String numero, String modelo, String serie, Long fornecedorId) {
        String sql = "DELETE FROM contas_pagar WHERE nota_numero = ? AND nota_modelo = ? AND nota_serie = ? AND fornecedor_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, fornecedorId);
            stmt.executeUpdate();
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar contas da nota", e);
        }
    }
    
    private void setContaParameters(PreparedStatement stmt, ContaPagar conta) throws SQLException {
        stmt.setString(1, conta.getNotaNumero());
        stmt.setString(2, conta.getNotaModelo());
        stmt.setString(3, conta.getNotaSerie());
        stmt.setLong(4, conta.getFornecedorId());
        stmt.setInt(5, conta.getNumeroParcela());
        stmt.setInt(6, conta.getTotalParcelas());
        stmt.setBigDecimal(7, conta.getValorOriginal());
        stmt.setBigDecimal(8, conta.getValorPago());
        stmt.setBigDecimal(9, conta.getValorDesconto());
        stmt.setBigDecimal(10, conta.getValorJuros());
        stmt.setBigDecimal(11, conta.getValorMulta());
        stmt.setBigDecimal(12, conta.getValorTotal());
        stmt.setDate(13, Date.valueOf(conta.getDataEmissao()));
        stmt.setDate(14, Date.valueOf(conta.getDataVencimento()));
        stmt.setDate(15, conta.getDataPagamento() != null ? Date.valueOf(conta.getDataPagamento()) : null);
        stmt.setObject(16, conta.getFormaPagamentoId());
        stmt.setString(17, conta.getSituacao());
        stmt.setString(18, conta.getObservacoes());
    }
    
    private ContaPagar mapRowToContaPagar(ResultSet rs) throws SQLException {
        ContaPagar conta = new ContaPagar();
        conta.setId(rs.getLong("id"));
        conta.setNotaNumero(rs.getString("nota_numero"));
        conta.setNotaModelo(rs.getString("nota_modelo"));
        conta.setNotaSerie(rs.getString("nota_serie"));
        conta.setFornecedorId(rs.getLong("fornecedor_id"));
        conta.setNumeroParcela(rs.getInt("numero_parcela"));
        conta.setTotalParcelas(rs.getInt("total_parcelas"));
        conta.setValorOriginal(rs.getBigDecimal("valor_original"));
        conta.setValorPago(rs.getBigDecimal("valor_pago"));
        conta.setValorDesconto(rs.getBigDecimal("valor_desconto"));
        conta.setValorJuros(rs.getBigDecimal("valor_juros"));
        conta.setValorMulta(rs.getBigDecimal("valor_multa"));
        conta.setValorTotal(rs.getBigDecimal("valor_total"));
        
        Date dataEmissao = rs.getDate("data_emissao");
        conta.setDataEmissao(dataEmissao != null ? dataEmissao.toLocalDate() : null);
        
        Date dataVencimento = rs.getDate("data_vencimento");
        conta.setDataVencimento(dataVencimento != null ? dataVencimento.toLocalDate() : null);
        
        Date dataPagamento = rs.getDate("data_pagamento");
        conta.setDataPagamento(dataPagamento != null ? dataPagamento.toLocalDate() : null);
        
        Long formaPagamentoId = rs.getObject("forma_pagamento_id", Long.class);
        conta.setFormaPagamentoId(formaPagamentoId);
        
        conta.setSituacao(rs.getString("situacao"));
        conta.setObservacoes(rs.getString("observacoes"));
        
        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        conta.setDataCriacao(dataCriacao != null ? dataCriacao.toLocalDateTime() : null);
        
        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        conta.setDataAlteracao(dataAlteracao != null ? dataAlteracao.toLocalDateTime() : null);
        
        // Carregar fornecedor
        fornecedorRepository.findById(conta.getFornecedorId()).ifPresent(conta::setFornecedor);
        
        // Carregar forma de pagamento
        if (formaPagamentoId != null) {
            formaPagamentoRepository.findById(formaPagamentoId).ifPresent(conta::setFormaPagamento);
        }
        
        return conta;
    }
}

