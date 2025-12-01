package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.repository.DatabaseConnection;
import com.example.PizzariaGraff.model.Produto;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public class ProdutoRepository {
    
    private final DatabaseConnection databaseConnection;
    
    public ProdutoRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
        verificarEstruturaBanco();
    }
    
    private void verificarEstruturaBanco() {
        try (Connection conn = databaseConnection.getConnection()) {
            // Verifica se as novas colunas existem e as adiciona se necessário
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet columns = metaData.getColumns(null, null, "produto", null);
            
            Set<String> existingColumns = new HashSet<>();
            while (columns.next()) {
                existingColumns.add(columns.getString("COLUMN_NAME").toLowerCase());
            }
            
            // Adiciona coluna ativo se não existir
            if (!existingColumns.contains("ativo")) {
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("ALTER TABLE produto ADD COLUMN ativo TINYINT(1) DEFAULT 1 COMMENT 'Status do produto: 1=Ativo, 0=Inativo'");
                    // Define todos como ativos por padrão
                    stmt.execute("UPDATE produto SET ativo = TRUE");
                }
            }
            columns.close();
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/criar estrutura do banco para produto: " + e.getMessage());
        }
    }
    
    public List<Produto> findAll() {
        List<Produto> produtos = new ArrayList<>();
        String sql = "SELECT p.*, m.marca as marca_nome, u.unidade_medida as unidade_nome, c.categoria as categoria_nome " +
                     "FROM produto p " +
                     "LEFT JOIN marca m ON p.marca_id = m.id " +
                     "LEFT JOIN unidade_medida u ON p.unidade_medida_id = u.id " +
                     "LEFT JOIN categoria c ON p.categoria_id = c.id " +
                     "ORDER BY p.produto";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                produtos.add(mapResultSetToProdutoWithNames(rs));
            }
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produtos", e);
        }
        
        return produtos;
    }
    
    public List<Produto> findByAtivoTrue() {
        List<Produto> produtos = new ArrayList<>();
        String sql = "SELECT p.*, m.marca as marca_nome, u.unidade_medida as unidade_nome, c.categoria as categoria_nome " +
                     "FROM produto p " +
                     "LEFT JOIN marca m ON p.marca_id = m.id " +
                     "LEFT JOIN unidade_medida u ON p.unidade_medida_id = u.id " +
                     "LEFT JOIN categoria c ON p.categoria_id = c.id " +
                     "WHERE p.ativo = TRUE " +
                     "ORDER BY p.produto";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                produtos.add(mapResultSetToProdutoWithNames(rs));
            }
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produtos ativos", e);
        }
        
        return produtos;
    }
    
    public Optional<Produto> findById(Long id) {
        String sql = "SELECT p.*, m.marca as marca_nome, u.unidade_medida as unidade_nome, c.categoria as categoria_nome " +
                     "FROM produto p " +
                     "LEFT JOIN marca m ON p.marca_id = m.id " +
                     "LEFT JOIN unidade_medida u ON p.unidade_medida_id = u.id " +
                     "LEFT JOIN categoria c ON p.categoria_id = c.id " +
                     "WHERE p.id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToProdutoWithNames(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produto por ID", e);
        }
        
        return Optional.empty();
    }
    
    public List<Produto> findByProduto(String nome) {
        List<Produto> produtos = new ArrayList<>();
        String sql = "SELECT * FROM produto WHERE produto LIKE ? ORDER BY produto";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, "%" + nome + "%");
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                produtos.add(mapResultSetToProduto(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produtos por nome", e);
        }
        
        return produtos;
    }
    
    public Optional<Produto> findByCodigoBarras(String codigoBarras) {
        String sql = "SELECT * FROM produto WHERE codigo_barras = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, codigoBarras);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToProduto(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produto por código de barras", e);
        }
        
        return Optional.empty();
    }
    
    public Optional<Produto> findByReferencia(String referencia) {
        String sql = "SELECT * FROM produto WHERE referencia = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, referencia);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToProduto(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produto por referência", e);
        }
        
        return Optional.empty();
    }
    
    public Produto save(Produto produto) {
        Produto savedProduto;
        if (produto.getId() == null) {
            savedProduto = insert(produto);
        } else {
            savedProduto = update(produto);
        }
        
        // Buscar o produto completo com os nomes das relações
        return findById(savedProduto.getId()).orElse(savedProduto);
    }
    
    private Produto insert(Produto produto) {
        String sql = "INSERT INTO produto (produto, unidade_medida_id, codigo_barras, referencia, marca_id, categoria_id, " +
                     "quantidade_minima, valor_compra, valor_venda, quantidade, percentual_lucro, descricao, " +
                     "observacoes, ativo, data_criacao, ultima_modificacao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, produto.getProduto());
            stmt.setObject(2, produto.getUnidadeMedidaId());
            stmt.setString(3, produto.getCodigoBarras());
            stmt.setString(4, produto.getReferencia());
            stmt.setObject(5, produto.getMarcaId());
            stmt.setObject(6, produto.getCategoriaId());
            stmt.setObject(7, produto.getQuantidadeMinima());
            stmt.setBigDecimal(8, produto.getValorCompra());
            stmt.setBigDecimal(9, produto.getValorVenda());
            stmt.setObject(10, produto.getQuantidade());
            stmt.setBigDecimal(11, produto.getPercentualLucro());
            stmt.setString(12, produto.getDescricao());
            stmt.setString(13, produto.getObservacoes());
            stmt.setBoolean(14, produto.getAtivo() != null ? produto.getAtivo() : true);
            stmt.setTimestamp(15, produto.getDataCriacao() != null ? Timestamp.valueOf(produto.getDataCriacao()) : Timestamp.valueOf(now));
            stmt.setTimestamp(16, produto.getDataAlteracao() != null ? Timestamp.valueOf(produto.getDataAlteracao()) : Timestamp.valueOf(now));
            
            stmt.executeUpdate();
            
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                produto.setId(rs.getLong(1));
            }
            
            if (produto.getDataCriacao() == null) {
                produto.setDataCriacao(now);
            }
            if (produto.getDataAlteracao() == null) {
                produto.setDataAlteracao(now);
            }
            
            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir produto", e);
        }
        
        return produto;
    }
    
    private Produto update(Produto produto) {
        String sql = "UPDATE produto SET produto = ?, unidade_medida_id = ?, codigo_barras = ?, referencia = ?, " +
                     "marca_id = ?, categoria_id = ?, quantidade_minima = ?, valor_compra = ?, valor_venda = ?, quantidade = ?, " +
                     "percentual_lucro = ?, descricao = ?, observacoes = ?, ativo = ?, ultima_modificacao = ? " +
                     "WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, produto.getProduto());
            stmt.setObject(2, produto.getUnidadeMedidaId());
            stmt.setString(3, produto.getCodigoBarras());
            stmt.setString(4, produto.getReferencia());
            stmt.setObject(5, produto.getMarcaId());
            stmt.setObject(6, produto.getCategoriaId());
            stmt.setObject(7, produto.getQuantidadeMinima());
            stmt.setBigDecimal(8, produto.getValorCompra());
            stmt.setBigDecimal(9, produto.getValorVenda());
            stmt.setObject(10, produto.getQuantidade());
            stmt.setBigDecimal(11, produto.getPercentualLucro());
            stmt.setString(12, produto.getDescricao());
            stmt.setString(13, produto.getObservacoes());
            stmt.setBoolean(14, produto.getAtivo() != null ? produto.getAtivo() : true);
            stmt.setTimestamp(15, Timestamp.valueOf(now));
            stmt.setLong(16, produto.getId());
            
            stmt.executeUpdate();
            
            produto.setDataAlteracao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar produto", e);
        }
        
        return produto;
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM produto WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar produto", e);
        }
    }
    
    /**
     * Aumenta a quantidade em estoque de um produto
     * @param produtoId ID do produto
     * @param quantidade Quantidade a adicionar (pode ser decimal, será convertida para int)
     */
    public void aumentarEstoque(Long produtoId, java.math.BigDecimal quantidade) {
        // Converter BigDecimal para int (arredondando)
        int quantidadeInt = quantidade.setScale(0, java.math.RoundingMode.HALF_UP).intValue();
        
        String sql = "UPDATE produto SET quantidade = quantidade + ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, quantidadeInt);
            stmt.setLong(2, produtoId);
            
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new RuntimeException("Produto não encontrado para atualizar estoque: ID " + produtoId);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao aumentar estoque do produto", e);
        }
    }
    
    /**
     * Diminui a quantidade em estoque de um produto
     * @param produtoId ID do produto
     * @param quantidade Quantidade a subtrair (pode ser decimal, será convertida para int)
     * @throws IllegalArgumentException se não houver estoque suficiente
     */
    public void diminuirEstoque(Long produtoId, java.math.BigDecimal quantidade) {
        // Converter BigDecimal para int (arredondando)
        int quantidadeInt = quantidade.setScale(0, java.math.RoundingMode.HALF_UP).intValue();
        
        // Primeiro verificar se há estoque suficiente
        Optional<Produto> produtoOpt = findById(produtoId);
        if (produtoOpt.isEmpty()) {
            throw new RuntimeException("Produto não encontrado: ID " + produtoId);
        }
        
        Produto produto = produtoOpt.get();
        Integer estoqueAtual = produto.getQuantidade() != null ? produto.getQuantidade() : 0;
        
        if (estoqueAtual < quantidadeInt) {
            throw new IllegalArgumentException(
                String.format("Estoque insuficiente para o produto '%s' (ID: %d). " +
                            "Estoque disponível: %d, Quantidade solicitada: %d",
                    produto.getProduto(), produtoId, estoqueAtual, quantidadeInt)
            );
        }
        
        String sql = "UPDATE produto SET quantidade = quantidade - ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, quantidadeInt);
            stmt.setLong(2, produtoId);
            
            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new RuntimeException("Produto não encontrado para atualizar estoque: ID " + produtoId);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao diminuir estoque do produto", e);
        }
    }
    
    /**
     * Verifica se há estoque suficiente para uma quantidade
     * @param produtoId ID do produto
     * @param quantidade Quantidade necessária (pode ser decimal, será convertida para int)
     * @return true se houver estoque suficiente, false caso contrário
     */
    public boolean verificarEstoqueDisponivel(Long produtoId, java.math.BigDecimal quantidade) {
        // Converter BigDecimal para int (arredondando)
        int quantidadeInt = quantidade.setScale(0, java.math.RoundingMode.HALF_UP).intValue();
        
        Optional<Produto> produtoOpt = findById(produtoId);
        if (produtoOpt.isEmpty()) {
            return false;
        }
        
        Produto produto = produtoOpt.get();
        Integer estoqueAtual = produto.getQuantidade() != null ? produto.getQuantidade() : 0;
        
        return estoqueAtual >= quantidadeInt;
    }
    
    private Produto mapResultSetToProduto(ResultSet rs) throws SQLException {
        Produto produto = new Produto();
        produto.setId(rs.getLong("id"));
        produto.setProduto(rs.getString("produto"));
        produto.setUnidadeMedidaId(rs.getObject("unidade_medida_id", Long.class));
        produto.setCodigoBarras(rs.getString("codigo_barras"));
        produto.setReferencia(rs.getString("referencia"));
        produto.setMarcaId(rs.getObject("marca_id", Long.class));
        produto.setCategoriaId(rs.getObject("categoria_id", Long.class));
        produto.setQuantidadeMinima(rs.getObject("quantidade_minima", Integer.class));
        produto.setValorCompra(rs.getBigDecimal("valor_compra"));
        produto.setValorVenda(rs.getBigDecimal("valor_venda"));
        produto.setQuantidade(rs.getObject("quantidade", Integer.class));
        produto.setPercentualLucro(rs.getBigDecimal("percentual_lucro"));
        produto.setDescricao(rs.getString("descricao"));
        produto.setObservacoes(rs.getString("observacoes"));

        // Carregar campo ativo do banco
        produto.setAtivo(rs.getBoolean("ativo"));

        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        if (dataCriacao != null) {
            produto.setDataCriacao(dataCriacao.toLocalDateTime());
        }

        Timestamp ultimaModificacao = rs.getTimestamp("ultima_modificacao");
        if (ultimaModificacao != null) {
            produto.setDataAlteracao(ultimaModificacao.toLocalDateTime());
        }

        return produto;
    }
    
    private Produto mapResultSetToProdutoWithNames(ResultSet rs) throws SQLException {
        Produto produto = new Produto();
        produto.setId(rs.getLong("id"));
        produto.setProduto(rs.getString("produto"));
        
        Long unidadeMedidaId = rs.getObject("unidade_medida_id", Long.class);
        produto.setUnidadeMedidaId(unidadeMedidaId);
        
        produto.setCodigoBarras(rs.getString("codigo_barras"));
        produto.setReferencia(rs.getString("referencia"));
        
        Long marcaId = rs.getObject("marca_id", Long.class);
        produto.setMarcaId(marcaId);
        
        Long categoriaId = rs.getObject("categoria_id", Long.class);
        produto.setCategoriaId(categoriaId);
        
        Integer quantidadeMinima = rs.getObject("quantidade_minima", Integer.class);
        produto.setQuantidadeMinima(quantidadeMinima);
        
        produto.setValorCompra(rs.getBigDecimal("valor_compra"));
        produto.setValorVenda(rs.getBigDecimal("valor_venda"));
        
        Integer quantidade = rs.getObject("quantidade", Integer.class);
        produto.setQuantidade(quantidade);
        
        produto.setPercentualLucro(rs.getBigDecimal("percentual_lucro"));
        produto.setDescricao(rs.getString("descricao"));
        produto.setObservacoes(rs.getString("observacoes"));
        
        // Carregar campo ativo do banco
        produto.setAtivo(rs.getBoolean("ativo"));
        
        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        if (dataCriacao != null) {
            produto.setDataCriacao(dataCriacao.toLocalDateTime());
        }
        
        Timestamp ultimaModificacao = rs.getTimestamp("ultima_modificacao");
        if (ultimaModificacao != null) {
            produto.setDataAlteracao(ultimaModificacao.toLocalDateTime());
        }
        
        produto.setMarcaNome(rs.getString("marca_nome"));
        produto.setUnidadeMedidaNome(rs.getString("unidade_nome"));
        produto.setCategoriaNome(rs.getString("categoria_nome"));
        
        return produto;
    }
} 