package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.*;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class NotaEntradaRepository {
    
    private final DatabaseConnection databaseConnection;
    private final FornecedorRepository fornecedorRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;
    private final ProdutoRepository produtoRepository;
    
    public NotaEntradaRepository(DatabaseConnection databaseConnection,
                                  FornecedorRepository fornecedorRepository,
                                  CondicaoPagamentoRepository condicaoPagamentoRepository,
                                  ProdutoRepository produtoRepository) {
        this.databaseConnection = databaseConnection;
        this.fornecedorRepository = fornecedorRepository;
        this.condicaoPagamentoRepository = condicaoPagamentoRepository;
        this.produtoRepository = produtoRepository;
    }
    
    public List<NotaEntrada> findAll() {
        List<NotaEntrada> notas = new ArrayList<>();
        String sql = "SELECT * FROM nota_entrada ORDER BY data_emissao DESC, numero DESC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                NotaEntrada nota = mapRowToNotaEntrada(rs);
                carregarProdutos(nota);
                notas.add(nota);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar notas de entrada", e);
        }
        
        return notas;
    }
    
    public Optional<NotaEntrada> findByChave(String numero, String modelo, String serie, Long fornecedorId) {
        String sql = "SELECT * FROM nota_entrada WHERE numero = ? AND modelo = ? AND serie = ? AND fornecedor_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, fornecedorId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    NotaEntrada nota = mapRowToNotaEntrada(rs);
                    carregarProdutos(nota);
                    return Optional.of(nota);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar nota de entrada", e);
        }
        
        return Optional.empty();
    }
    
    public List<NotaEntrada> findByFornecedorId(Long fornecedorId) {
        List<NotaEntrada> notas = new ArrayList<>();
        String sql = "SELECT * FROM nota_entrada WHERE fornecedor_id = ? ORDER BY data_emissao DESC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, fornecedorId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    NotaEntrada nota = mapRowToNotaEntrada(rs);
                    carregarProdutos(nota);
                    notas.add(nota);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar notas por fornecedor", e);
        }
        
        return notas;
    }
    
    public List<NotaEntrada> findBySituacao(String situacao) {
        List<NotaEntrada> notas = new ArrayList<>();
        String sql = "SELECT * FROM nota_entrada WHERE situacao = ? ORDER BY data_emissao DESC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, situacao);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    NotaEntrada nota = mapRowToNotaEntrada(rs);
                    carregarProdutos(nota);
                    notas.add(nota);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar notas por situação", e);
        }
        
        return notas;
    }
    
    public NotaEntrada save(NotaEntrada nota) {
        if (existeNota(nota.getNumero(), nota.getModelo(), nota.getSerie(), nota.getFornecedorId())) {
            return update(nota);
        } else {
            return insert(nota);
        }
    }
    
    private NotaEntrada insert(NotaEntrada nota) {
        String sql = "INSERT INTO nota_entrada (numero, modelo, serie, fornecedor_id, data_emissao, data_chegada, " +
                     "tipo_frete, valor_produtos, valor_frete, valor_seguro, outras_despesas, valor_desconto, " +
                     "valor_total, condicao_pagamento_id, observacoes, situacao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            setNotaParameters(stmt, nota);
            stmt.executeUpdate();
            
            // Inserir produtos
            if (nota.getProdutos() != null && !nota.getProdutos().isEmpty()) {
                salvarProdutos(nota);
            }
            
            return findByChave(nota.getNumero(), nota.getModelo(), nota.getSerie(), nota.getFornecedorId())
                    .orElseThrow(() -> new RuntimeException("Erro ao recuperar nota inserida"));
                    
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir nota de entrada: " + e.getMessage(), e);
        }
    }
    
    private NotaEntrada update(NotaEntrada nota) {
        String sql = "UPDATE nota_entrada SET data_emissao = ?, data_chegada = ?, tipo_frete = ?, " +
                     "valor_produtos = ?, valor_frete = ?, valor_seguro = ?, outras_despesas = ?, " +
                     "valor_desconto = ?, valor_total = ?, condicao_pagamento_id = ?, observacoes = ?, " +
                     "situacao = ? WHERE numero = ? AND modelo = ? AND serie = ? AND fornecedor_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setDate(1, nota.getDataEmissao() != null ? Date.valueOf(nota.getDataEmissao()) : null);
            stmt.setDate(2, nota.getDataChegada() != null ? Date.valueOf(nota.getDataChegada()) : null);
            stmt.setString(3, nota.getTipoFrete());
            stmt.setBigDecimal(4, nota.getValorProdutos());
            stmt.setBigDecimal(5, nota.getValorFrete());
            stmt.setBigDecimal(6, nota.getValorSeguro());
            stmt.setBigDecimal(7, nota.getOutrasDespesas());
            stmt.setBigDecimal(8, nota.getValorDesconto());
            stmt.setBigDecimal(9, nota.getValorTotal());
            stmt.setObject(10, nota.getCondicaoPagamentoId());
            stmt.setString(11, nota.getObservacoes());
            stmt.setString(12, nota.getSituacao());
            stmt.setString(13, nota.getNumero());
            stmt.setString(14, nota.getModelo());
            stmt.setString(15, nota.getSerie());
            stmt.setLong(16, nota.getFornecedorId());
            
            stmt.executeUpdate();
            
            // Deletar e reinserir produtos
            deletarProdutos(nota.getNumero(), nota.getModelo(), nota.getSerie(), nota.getFornecedorId());
            if (nota.getProdutos() != null && !nota.getProdutos().isEmpty()) {
                salvarProdutos(nota);
            }
            
            return findByChave(nota.getNumero(), nota.getModelo(), nota.getSerie(), nota.getFornecedorId())
                    .orElseThrow(() -> new RuntimeException("Erro ao recuperar nota atualizada"));
                    
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar nota de entrada: " + e.getMessage(), e);
        }
    }
    
    public void deleteByChave(String numero, String modelo, String serie, Long fornecedorId) {
        String sql = "DELETE FROM nota_entrada WHERE numero = ? AND modelo = ? AND serie = ? AND fornecedor_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, fornecedorId);
            
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar nota de entrada", e);
        }
    }
    
    private boolean existeNota(String numero, String modelo, String serie, Long fornecedorId) {
        String sql = "SELECT COUNT(*) FROM nota_entrada WHERE numero = ? AND modelo = ? AND serie = ? AND fornecedor_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, fornecedorId);
            
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
    
    private void salvarProdutos(NotaEntrada nota) {
        String sql = "INSERT INTO produtos_nota (nota_numero, nota_modelo, nota_serie, fornecedor_id, produto_id, " +
                     "sequencia, quantidade, valor_unitario, valor_desconto, percentual_desconto, valor_total, " +
                     "rateio_frete, rateio_seguro, rateio_outras, custo_preco_final) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            for (ProdutoNota produto : nota.getProdutos()) {
                produto.setNotaNumero(nota.getNumero());
                produto.setNotaModelo(nota.getModelo());
                produto.setNotaSerie(nota.getSerie());
                produto.setFornecedorId(nota.getFornecedorId());
                
                stmt.setString(1, produto.getNotaNumero());
                stmt.setString(2, produto.getNotaModelo());
                stmt.setString(3, produto.getNotaSerie());
                stmt.setLong(4, produto.getFornecedorId());
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
    
    private void deletarProdutos(String numero, String modelo, String serie, Long fornecedorId) {
        String sql = "DELETE FROM produtos_nota WHERE nota_numero = ? AND nota_modelo = ? AND nota_serie = ? AND fornecedor_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, numero);
            stmt.setString(2, modelo);
            stmt.setString(3, serie);
            stmt.setLong(4, fornecedorId);
            
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar produtos da nota", e);
        }
    }
    
    private void carregarProdutos(NotaEntrada nota) {
        String sql = "SELECT * FROM produtos_nota WHERE nota_numero = ? AND nota_modelo = ? AND nota_serie = ? AND fornecedor_id = ? ORDER BY sequencia";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, nota.getNumero());
            stmt.setString(2, nota.getModelo());
            stmt.setString(3, nota.getSerie());
            stmt.setLong(4, nota.getFornecedorId());
            
            try (ResultSet rs = stmt.executeQuery()) {
                List<ProdutoNota> produtos = new ArrayList<>();
                while (rs.next()) {
                    ProdutoNota produto = mapRowToProdutoNota(rs);
                    
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
    
    private void setNotaParameters(PreparedStatement stmt, NotaEntrada nota) throws SQLException {
        stmt.setString(1, nota.getNumero());
        stmt.setString(2, nota.getModelo());
        stmt.setString(3, nota.getSerie());
        stmt.setLong(4, nota.getFornecedorId());
        stmt.setDate(5, nota.getDataEmissao() != null ? Date.valueOf(nota.getDataEmissao()) : Date.valueOf(LocalDate.now()));
        stmt.setDate(6, nota.getDataChegada() != null ? Date.valueOf(nota.getDataChegada()) : null);
        stmt.setString(7, nota.getTipoFrete());
        stmt.setBigDecimal(8, nota.getValorProdutos());
        stmt.setBigDecimal(9, nota.getValorFrete());
        stmt.setBigDecimal(10, nota.getValorSeguro());
        stmt.setBigDecimal(11, nota.getOutrasDespesas());
        stmt.setBigDecimal(12, nota.getValorDesconto());
        stmt.setBigDecimal(13, nota.getValorTotal());
        stmt.setObject(14, nota.getCondicaoPagamentoId());
        stmt.setString(15, nota.getObservacoes());
        stmt.setString(16, nota.getSituacao());
    }
    
    private NotaEntrada mapRowToNotaEntrada(ResultSet rs) throws SQLException {
        NotaEntrada nota = new NotaEntrada();
        nota.setNumero(rs.getString("numero"));
        nota.setModelo(rs.getString("modelo"));
        nota.setSerie(rs.getString("serie"));
        nota.setFornecedorId(rs.getLong("fornecedor_id"));
        
        Date dataEmissao = rs.getDate("data_emissao");
        nota.setDataEmissao(dataEmissao != null ? dataEmissao.toLocalDate() : null);
        
        Date dataChegada = rs.getDate("data_chegada");
        nota.setDataChegada(dataChegada != null ? dataChegada.toLocalDate() : null);
        
        nota.setTipoFrete(rs.getString("tipo_frete"));
        nota.setValorProdutos(rs.getBigDecimal("valor_produtos"));
        nota.setValorFrete(rs.getBigDecimal("valor_frete"));
        nota.setValorSeguro(rs.getBigDecimal("valor_seguro"));
        nota.setOutrasDespesas(rs.getBigDecimal("outras_despesas"));
        nota.setValorDesconto(rs.getBigDecimal("valor_desconto"));
        nota.setValorTotal(rs.getBigDecimal("valor_total"));
        
        Long condicaoPagamentoId = rs.getObject("condicao_pagamento_id", Long.class);
        nota.setCondicaoPagamentoId(condicaoPagamentoId);
        
        nota.setObservacoes(rs.getString("observacoes"));
        nota.setSituacao(rs.getString("situacao"));
        
        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        nota.setDataCriacao(dataCriacao != null ? dataCriacao.toLocalDateTime() : null);
        
        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        nota.setDataAlteracao(dataAlteracao != null ? dataAlteracao.toLocalDateTime() : null);
        
        // Carregar fornecedor
        fornecedorRepository.findById(nota.getFornecedorId()).ifPresent(nota::setFornecedor);
        
        // Carregar condição de pagamento
        if (condicaoPagamentoId != null) {
            condicaoPagamentoRepository.findById(condicaoPagamentoId).ifPresent(nota::setCondicaoPagamento);
        }
        
        return nota;
    }
    
    private ProdutoNota mapRowToProdutoNota(ResultSet rs) throws SQLException {
        ProdutoNota produto = new ProdutoNota();
        produto.setNotaNumero(rs.getString("nota_numero"));
        produto.setNotaModelo(rs.getString("nota_modelo"));
        produto.setNotaSerie(rs.getString("nota_serie"));
        produto.setFornecedorId(rs.getLong("fornecedor_id"));
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
        
        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        produto.setDataCriacao(dataCriacao != null ? dataCriacao.toLocalDateTime() : null);
        
        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        produto.setDataAlteracao(dataAlteracao != null ? dataAlteracao.toLocalDateTime() : null);
        
        return produto;
    }
}

