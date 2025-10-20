package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.ContaReceber;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ContaReceberRepository {
    
    private final DatabaseConnection databaseConnection;
    private final ClienteRepository clienteRepository;
    private final FormaPagamentoRepository formaPagamentoRepository;
    
    public ContaReceberRepository(DatabaseConnection databaseConnection,
                                  ClienteRepository clienteRepository,
                                  FormaPagamentoRepository formaPagamentoRepository) {
        this.databaseConnection = databaseConnection;
        this.clienteRepository = clienteRepository;
        this.formaPagamentoRepository = formaPagamentoRepository;
    }
    
    public List<ContaReceber> findAll() {
        List<ContaReceber> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_receber ORDER BY data_vencimento ASC, numero_parcela ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                contas.add(mapRowToContaReceber(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas a receber", e);
        }
        
        return contas;
    }
    
    public Optional<ContaReceber> findById(Long id) {
        String sql = "SELECT * FROM contas_receber WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToContaReceber(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar conta a receber", e);
        }
        
        return Optional.empty();
    }
    
    public List<ContaReceber> findByClienteId(Long clienteId) {
        List<ContaReceber> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_receber WHERE cliente_id = ? ORDER BY data_vencimento ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, clienteId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contas.add(mapRowToContaReceber(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas por cliente", e);
        }
        
        return contas;
    }
    
    public List<ContaReceber> findBySituacao(String situacao) {
        List<ContaReceber> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_receber WHERE situacao = ? ORDER BY data_vencimento ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, situacao);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contas.add(mapRowToContaReceber(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas por situação", e);
        }
        
        return contas;
    }
    
    public List<ContaReceber> findByNota(String numero, String modelo, String serie, Long clienteId) {
        List<ContaReceber> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_receber WHERE nota_numero = ? AND nota_modelo = ? AND nota_serie = ? AND cliente_id = ? ORDER BY numero_parcela ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, clienteId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contas.add(mapRowToContaReceber(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas por nota", e);
        }
        
        return contas;
    }
    
    public List<ContaReceber> findVencidas() {
        List<ContaReceber> contas = new ArrayList<>();
        String sql = "SELECT * FROM contas_receber WHERE situacao = 'PENDENTE' AND data_vencimento < CURDATE() ORDER BY data_vencimento ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                contas.add(mapRowToContaReceber(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar contas vencidas", e);
        }
        
        return contas;
    }
    
    public ContaReceber save(ContaReceber conta) {
        if (conta.getId() != null && conta.getId() > 0) {
            return update(conta);
        } else {
            return insert(conta);
        }
    }
    
    private ContaReceber insert(ContaReceber conta) {
        String sql = "INSERT INTO contas_receber (nota_numero, nota_modelo, nota_serie, cliente_id, " +
                     "numero_parcela, total_parcelas, valor_original, valor_recebido, valor_desconto, " +
                     "valor_juros, valor_multa, valor_total, data_emissao, data_vencimento, " +
                     "data_recebimento, forma_pagamento_id, situacao, observacoes) " +
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
            throw new RuntimeException("Erro ao inserir conta a receber: " + e.getMessage(), e);
        }
    }
    
    private ContaReceber update(ContaReceber conta) {
        String sql = "UPDATE contas_receber SET valor_recebido = ?, valor_desconto = ?, valor_juros = ?, " +
                     "valor_multa = ?, valor_total = ?, data_recebimento = ?, forma_pagamento_id = ?, " +
                     "situacao = ?, observacoes = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setBigDecimal(1, conta.getValorRecebido());
            stmt.setBigDecimal(2, conta.getValorDesconto());
            stmt.setBigDecimal(3, conta.getValorJuros());
            stmt.setBigDecimal(4, conta.getValorMulta());
            stmt.setBigDecimal(5, conta.getValorTotal());
            stmt.setDate(6, conta.getDataRecebimento() != null ? Date.valueOf(conta.getDataRecebimento()) : null);
            stmt.setObject(7, conta.getFormaPagamentoId());
            stmt.setString(8, conta.getSituacao());
            stmt.setString(9, conta.getObservacoes());
            stmt.setLong(10, conta.getId());
            
            stmt.executeUpdate();
            
            return findById(conta.getId()).orElseThrow(() -> new RuntimeException("Erro ao recuperar conta atualizada"));
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar conta a receber: " + e.getMessage(), e);
        }
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM contas_receber WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar conta a receber", e);
        }
    }
    
    public void deleteByNota(String numero, String modelo, String serie, Long clienteId) {
        String sql = "DELETE FROM contas_receber WHERE nota_numero = ? AND nota_modelo = ? AND nota_serie = ? AND cliente_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, clienteId);
            stmt.executeUpdate();
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar contas da nota", e);
        }
    }
    
    private void setContaParameters(PreparedStatement stmt, ContaReceber conta) throws SQLException {
        stmt.setString(1, conta.getNotaNumero());
        stmt.setString(2, conta.getNotaModelo());
        stmt.setString(3, conta.getNotaSerie());
        stmt.setLong(4, conta.getClienteId());
        stmt.setInt(5, conta.getNumeroParcela());
        stmt.setInt(6, conta.getTotalParcelas());
        stmt.setBigDecimal(7, conta.getValorOriginal());
        stmt.setBigDecimal(8, conta.getValorRecebido());
        stmt.setBigDecimal(9, conta.getValorDesconto());
        stmt.setBigDecimal(10, conta.getValorJuros());
        stmt.setBigDecimal(11, conta.getValorMulta());
        stmt.setBigDecimal(12, conta.getValorTotal());
        stmt.setDate(13, Date.valueOf(conta.getDataEmissao()));
        stmt.setDate(14, Date.valueOf(conta.getDataVencimento()));
        stmt.setDate(15, conta.getDataRecebimento() != null ? Date.valueOf(conta.getDataRecebimento()) : null);
        stmt.setObject(16, conta.getFormaPagamentoId());
        stmt.setString(17, conta.getSituacao());
        stmt.setString(18, conta.getObservacoes());
    }
    
    private ContaReceber mapRowToContaReceber(ResultSet rs) throws SQLException {
        ContaReceber conta = new ContaReceber();
        conta.setId(rs.getLong("id"));
        conta.setNotaNumero(rs.getString("nota_numero"));
        conta.setNotaModelo(rs.getString("nota_modelo"));
        conta.setNotaSerie(rs.getString("nota_serie"));
        conta.setClienteId(rs.getLong("cliente_id"));
        conta.setNumeroParcela(rs.getInt("numero_parcela"));
        conta.setTotalParcelas(rs.getInt("total_parcelas"));
        conta.setValorOriginal(rs.getBigDecimal("valor_original"));
        conta.setValorRecebido(rs.getBigDecimal("valor_recebido"));
        conta.setValorDesconto(rs.getBigDecimal("valor_desconto"));
        conta.setValorJuros(rs.getBigDecimal("valor_juros"));
        conta.setValorMulta(rs.getBigDecimal("valor_multa"));
        conta.setValorTotal(rs.getBigDecimal("valor_total"));
        
        Date dataEmissao = rs.getDate("data_emissao");
        conta.setDataEmissao(dataEmissao != null ? dataEmissao.toLocalDate() : null);
        
        Date dataVencimento = rs.getDate("data_vencimento");
        conta.setDataVencimento(dataVencimento != null ? dataVencimento.toLocalDate() : null);
        
        Date dataRecebimento = rs.getDate("data_recebimento");
        conta.setDataRecebimento(dataRecebimento != null ? dataRecebimento.toLocalDate() : null);
        
        Long formaPagamentoId = rs.getObject("forma_pagamento_id", Long.class);
        conta.setFormaPagamentoId(formaPagamentoId);
        
        conta.setSituacao(rs.getString("situacao"));
        conta.setObservacoes(rs.getString("observacoes"));
        
        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        conta.setDataCriacao(dataCriacao != null ? dataCriacao.toLocalDateTime() : null);
        
        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        conta.setDataAlteracao(dataAlteracao != null ? dataAlteracao.toLocalDateTime() : null);
        
        // Carregar cliente
        clienteRepository.findById(conta.getClienteId()).ifPresent(conta::setCliente);
        
        // Carregar forma de pagamento
        if (formaPagamentoId != null) {
            formaPagamentoRepository.findById(formaPagamentoId).ifPresent(conta::setFormaPagamento);
        }
        
        return conta;
    }
}

