package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.*;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class NotaSaidaRepository {
    
    private final DatabaseConnection databaseConnection;
    private final ClienteRepository clienteRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;
    private final ProdutoRepository produtoRepository;
    private final TransportadoraRepository transportadoraRepository;
    
    public NotaSaidaRepository(DatabaseConnection databaseConnection,
                               ClienteRepository clienteRepository,
                               CondicaoPagamentoRepository condicaoPagamentoRepository,
                               ProdutoRepository produtoRepository,
                               TransportadoraRepository transportadoraRepository) {
        this.databaseConnection = databaseConnection;
        this.clienteRepository = clienteRepository;
        this.condicaoPagamentoRepository = condicaoPagamentoRepository;
        this.produtoRepository = produtoRepository;
        this.transportadoraRepository = transportadoraRepository;
    }
    
    public List<NotaSaida> findAll() {
        List<NotaSaida> notas = new ArrayList<>();
        String sql = "SELECT * FROM nota_saida ORDER BY data_emissao DESC, numero DESC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                NotaSaida nota = mapRowToNotaSaida(rs);
                carregarProdutos(nota);
                notas.add(nota);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar notas de saída", e);
        }
        
        return notas;
    }
    
    public Optional<NotaSaida> findByChave(String numero, String modelo, String serie, Long clienteId) {
        String sql = "SELECT * FROM nota_saida WHERE numero = ? AND modelo = ? AND serie = ? AND cliente_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, clienteId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    NotaSaida nota = mapRowToNotaSaida(rs);
                    carregarProdutos(nota);
                    return Optional.of(nota);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar nota de saída", e);
        }
        
        return Optional.empty();
    }
    
    public List<NotaSaida> findByClienteId(Long clienteId) {
        List<NotaSaida> notas = new ArrayList<>();
        String sql = "SELECT * FROM nota_saida WHERE cliente_id = ? ORDER BY data_emissao DESC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, clienteId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    NotaSaida nota = mapRowToNotaSaida(rs);
                    carregarProdutos(nota);
                    notas.add(nota);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar notas por cliente", e);
        }
        
        return notas;
    }
    
    public List<NotaSaida> findBySituacao(String situacao) {
        List<NotaSaida> notas = new ArrayList<>();
        String sql = "SELECT * FROM nota_saida WHERE situacao = ? ORDER BY data_emissao DESC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, situacao);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    NotaSaida nota = mapRowToNotaSaida(rs);
                    carregarProdutos(nota);
                    notas.add(nota);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar notas por situação", e);
        }
        
        return notas;
    }
    
    public NotaSaida save(NotaSaida nota) {
        if (existeNota(nota.getNumero(), nota.getModelo(), nota.getSerie(), nota.getClienteId())) {
            return update(nota);
        } else {
            return insert(nota);
        }
    }
    
    private NotaSaida insert(NotaSaida nota) {
        String sql = "INSERT INTO nota_saida (numero, modelo, serie, cliente_id, data_emissao, data_saida, " +
                     "tipo_frete, valor_produtos, valor_frete, valor_seguro, outras_despesas, valor_desconto, " +
                     "valor_total, condicao_pagamento_id, transportadora_id, placa_veiculo, observacoes, situacao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            setNotaParameters(stmt, nota);
            stmt.executeUpdate();
            
            // Inserir produtos
            if (nota.getProdutos() != null && !nota.getProdutos().isEmpty()) {
                salvarProdutos(nota);
            }
            
            return findByChave(nota.getNumero(), nota.getModelo(), nota.getSerie(), nota.getClienteId())
                    .orElseThrow(() -> new RuntimeException("Erro ao recuperar nota inserida"));
                    
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir nota de saída: " + e.getMessage(), e);
        }
    }
    
    private NotaSaida update(NotaSaida nota) {
        String sql = "UPDATE nota_saida SET data_emissao = ?, data_saida = ?, tipo_frete = ?, " +
                     "valor_produtos = ?, valor_frete = ?, valor_seguro = ?, outras_despesas = ?, " +
                     "valor_desconto = ?, valor_total = ?, condicao_pagamento_id = ?, transportadora_id = ?, " +
                     "placa_veiculo = ?, observacoes = ?, situacao = ? WHERE numero = ? AND modelo = ? AND serie = ? AND cliente_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setDate(1, nota.getDataEmissao() != null ? Date.valueOf(nota.getDataEmissao()) : null);
            stmt.setDate(2, nota.getDataSaida() != null ? Date.valueOf(nota.getDataSaida()) : null);
            stmt.setString(3, nota.getTipoFrete());
            stmt.setBigDecimal(4, nota.getValorProdutos());
            stmt.setBigDecimal(5, nota.getValorFrete());
            stmt.setBigDecimal(6, nota.getValorSeguro());
            stmt.setBigDecimal(7, nota.getOutrasDespesas());
            stmt.setBigDecimal(8, nota.getValorDesconto());
            stmt.setBigDecimal(9, nota.getValorTotal());
            stmt.setObject(10, nota.getCondicaoPagamentoId());
            stmt.setObject(11, nota.getTransportadoraId());
            stmt.setString(12, nota.getPlacaVeiculo());
            stmt.setString(13, nota.getObservacoes());
            stmt.setString(14, nota.getSituacao());
            stmt.setString(15, nota.getNumero());
            stmt.setString(16, nota.getModelo());
            stmt.setString(17, nota.getSerie());
            stmt.setLong(18, nota.getClienteId());
            
            stmt.executeUpdate();
            
            // Deletar e reinserir produtos
            deletarProdutos(nota.getNumero(), nota.getModelo(), nota.getSerie(), nota.getClienteId());
            if (nota.getProdutos() != null && !nota.getProdutos().isEmpty()) {
                salvarProdutos(nota);
            }
            
            return findByChave(nota.getNumero(), nota.getModelo(), nota.getSerie(), nota.getClienteId())
                    .orElseThrow(() -> new RuntimeException("Erro ao recuperar nota atualizada"));
                    
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar nota de saída: " + e.getMessage(), e);
        }
    }
    
    public void deleteByChave(String numero, String modelo, String serie, Long clienteId) {
        String sql = "DELETE FROM nota_saida WHERE numero = ? AND modelo = ? AND serie = ? AND cliente_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, clienteId);
            
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar nota de saída", e);
        }
    }
    
    private boolean existeNota(String numero, String modelo, String serie, Long clienteId) {
        String sql = "SELECT COUNT(*) FROM nota_saida WHERE numero = ? AND modelo = ? AND serie = ? AND cliente_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, clienteId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao verificar existência da nota", e);
        }
        
        return false;
    }
    
    private void salvarProdutos(NotaSaida nota) {
        String sql = "INSERT INTO produto_nota_saida (nota_numero, nota_modelo, nota_serie, cliente_id, produto_id, " +
                     "sequencia, quantidade, valor_unitario, valor_desconto, percentual_desconto, valor_total, " +
                     "rateio_frete, rateio_seguro, rateio_outras, custo_preco_final) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            for (ProdutoNotaSaida produto : nota.getProdutos()) {
                produto.setNotaNumero(nota.getNumero());
                produto.setNotaModelo(nota.getModelo());
                produto.setNotaSerie(nota.getSerie());
                produto.setClienteId(nota.getClienteId());
                
                stmt.setString(1, produto.getNotaNumero());
                stmt.setString(2, produto.getNotaModelo());
                stmt.setString(3, produto.getNotaSerie());
                stmt.setLong(4, produto.getClienteId());
                stmt.setLong(5, produto.getProdutoId());
                stmt.setInt(6, produto.getSequencia());
                stmt.setBigDecimal(7, produto.getQuantidade());
                stmt.setBigDecimal(8, produto.getValorUnitario());
                stmt.setBigDecimal(9, produto.getValorDesconto());
                stmt.setBigDecimal(10, produto.getPercentualDesconto());
                stmt.setBigDecimal(11, produto.getValorTotal());
                stmt.setBigDecimal(12, produto.getRateioFrete());
                stmt.setBigDecimal(13, produto.getRateioSeguro());
                stmt.setBigDecimal(14, produto.getRateioOutras());
                stmt.setBigDecimal(15, produto.getCustoPrecoFinal());
                
                stmt.executeUpdate();
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar produtos da nota: " + e.getMessage(), e);
        }
    }
    
    private void deletarProdutos(String numero, String modelo, String serie, Long clienteId) {
        String sql = "DELETE FROM produto_nota_saida WHERE nota_numero = ? AND nota_modelo = ? AND nota_serie = ? AND cliente_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, clienteId);
            
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar produtos da nota", e);
        }
    }
    
    private void carregarProdutos(NotaSaida nota) {
        String sql = "SELECT * FROM produto_nota_saida WHERE nota_numero = ? AND nota_modelo = ? AND nota_serie = ? AND cliente_id = ? ORDER BY sequencia";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, nota.getNumero());
            stmt.setString(2, nota.getModelo());
            stmt.setString(3, nota.getSerie());
            stmt.setLong(4, nota.getClienteId());
            
            try (ResultSet rs = stmt.executeQuery()) {
                List<ProdutoNotaSaida> produtos = new ArrayList<>();
                while (rs.next()) {
                    ProdutoNotaSaida produto = mapRowToProdutoNotaSaida(rs);
                    
                    // Carregar informações do produto
                    produtoRepository.findById(produto.getProdutoId()).ifPresent(produto::setProduto);
                    
                    produtos.add(produto);
                }
                nota.setProdutos(produtos);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao carregar produtos da nota", e);
        }
    }
    
    private void setNotaParameters(PreparedStatement stmt, NotaSaida nota) throws SQLException {
        stmt.setString(1, nota.getNumero());
        stmt.setString(2, nota.getModelo());
        stmt.setString(3, nota.getSerie());
        stmt.setLong(4, nota.getClienteId());
        stmt.setDate(5, nota.getDataEmissao() != null ? Date.valueOf(nota.getDataEmissao()) : Date.valueOf(LocalDate.now()));
        stmt.setDate(6, nota.getDataSaida() != null ? Date.valueOf(nota.getDataSaida()) : null);
        stmt.setString(7, nota.getTipoFrete());
        stmt.setBigDecimal(8, nota.getValorProdutos());
        stmt.setBigDecimal(9, nota.getValorFrete());
        stmt.setBigDecimal(10, nota.getValorSeguro());
        stmt.setBigDecimal(11, nota.getOutrasDespesas());
        stmt.setBigDecimal(12, nota.getValorDesconto());
        stmt.setBigDecimal(13, nota.getValorTotal());
        stmt.setObject(14, nota.getCondicaoPagamentoId());
        stmt.setObject(15, nota.getTransportadoraId());
        stmt.setString(16, nota.getPlacaVeiculo());
        stmt.setString(17, nota.getObservacoes());
        stmt.setString(18, nota.getSituacao());
    }
    
    private NotaSaida mapRowToNotaSaida(ResultSet rs) throws SQLException {
        NotaSaida nota = new NotaSaida();
        nota.setNumero(rs.getString("numero"));
        nota.setModelo(rs.getString("modelo"));
        nota.setSerie(rs.getString("serie"));
        nota.setClienteId(rs.getLong("cliente_id"));
        
        Date dataEmissao = rs.getDate("data_emissao");
        nota.setDataEmissao(dataEmissao != null ? dataEmissao.toLocalDate() : null);
        
        Date dataSaida = rs.getDate("data_saida");
        nota.setDataSaida(dataSaida != null ? dataSaida.toLocalDate() : null);
        
        nota.setTipoFrete(rs.getString("tipo_frete"));
        nota.setValorProdutos(rs.getBigDecimal("valor_produtos"));
        nota.setValorFrete(rs.getBigDecimal("valor_frete"));
        nota.setValorSeguro(rs.getBigDecimal("valor_seguro"));
        nota.setOutrasDespesas(rs.getBigDecimal("outras_despesas"));
        nota.setValorDesconto(rs.getBigDecimal("valor_desconto"));
        nota.setValorTotal(rs.getBigDecimal("valor_total"));
        
        Long condicaoPagamentoId = rs.getObject("condicao_pagamento_id", Long.class);
        nota.setCondicaoPagamentoId(condicaoPagamentoId);
        
        Long transportadoraId = rs.getObject("transportadora_id", Long.class);
        nota.setTransportadoraId(transportadoraId);
        
        nota.setPlacaVeiculo(rs.getString("placa_veiculo"));
        nota.setObservacoes(rs.getString("observacoes"));
        nota.setSituacao(rs.getString("situacao"));
        
        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        nota.setDataCriacao(dataCriacao != null ? dataCriacao.toLocalDateTime() : null);
        
        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        nota.setDataAlteracao(dataAlteracao != null ? dataAlteracao.toLocalDateTime() : null);
        
        // Carregar cliente
        clienteRepository.findById(nota.getClienteId()).ifPresent(nota::setCliente);
        
        // Carregar condição de pagamento
        if (condicaoPagamentoId != null) {
            condicaoPagamentoRepository.findById(condicaoPagamentoId).ifPresent(nota::setCondicaoPagamento);
        }
        
        // Carregar transportadora
        if (transportadoraId != null) {
            transportadoraRepository.findById(transportadoraId).ifPresent(nota::setTransportadora);
        }
        
        return nota;
    }
    
    private ProdutoNotaSaida mapRowToProdutoNotaSaida(ResultSet rs) throws SQLException {
        ProdutoNotaSaida produto = new ProdutoNotaSaida();
        produto.setNotaNumero(rs.getString("nota_numero"));
        produto.setNotaModelo(rs.getString("nota_modelo"));
        produto.setNotaSerie(rs.getString("nota_serie"));
        produto.setClienteId(rs.getLong("cliente_id"));
        produto.setProdutoId(rs.getLong("produto_id"));
        produto.setSequencia(rs.getInt("sequencia"));
        produto.setQuantidade(rs.getBigDecimal("quantidade"));
        produto.setValorUnitario(rs.getBigDecimal("valor_unitario"));
        produto.setValorDesconto(rs.getBigDecimal("valor_desconto"));
        produto.setPercentualDesconto(rs.getBigDecimal("percentual_desconto"));
        produto.setValorTotal(rs.getBigDecimal("valor_total"));
        produto.setRateioFrete(rs.getBigDecimal("rateio_frete"));
        produto.setRateioSeguro(rs.getBigDecimal("rateio_seguro"));
        produto.setRateioOutras(rs.getBigDecimal("rateio_outras"));
        produto.setCustoPrecoFinal(rs.getBigDecimal("custo_preco_final"));
        
        return produto;
    }
}

