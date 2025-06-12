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
        String sql = "SELECT p.*, m.marca as marca_nome, u.unidade_medida as unidade_nome " +
                     "FROM produto p " +
                     "LEFT JOIN marca m ON p.marca_id = m.id " +
                     "LEFT JOIN unidade_medida u ON p.unidade_medida_id = u.id " +
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
        String sql = "SELECT p.*, m.marca as marca_nome, u.unidade_medida as unidade_nome " +
                     "FROM produto p " +
                     "LEFT JOIN marca m ON p.marca_id = m.id " +
                     "LEFT JOIN unidade_medida u ON p.unidade_medida_id = u.id " +
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
        String sql = "SELECT p.*, m.marca as marca_nome, u.unidade_medida as unidade_nome " +
                     "FROM produto p " +
                     "LEFT JOIN marca m ON p.marca_id = m.id " +
                     "LEFT JOIN unidade_medida u ON p.unidade_medida_id = u.id " +
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
        String sql = "INSERT INTO produto (produto, unidade_medida_id, codigo_barras, referencia, marca_id, " +
                     "quantidade_minima, valor_compra, valor_venda, quantidade, percentual_lucro, descricao, " +
                     "observacoes, ativo, data_criacao, ultima_modificacao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, produto.getProduto());
            stmt.setObject(2, produto.getUnidadeMedidaId());
            stmt.setString(3, produto.getCodigoBarras());
            stmt.setString(4, produto.getReferencia());
            stmt.setObject(5, produto.getMarcaId());
            stmt.setObject(6, produto.getQuantidadeMinima());
            stmt.setBigDecimal(7, produto.getValorCompra());
            stmt.setBigDecimal(8, produto.getValorVenda());
            stmt.setObject(9, produto.getQuantidade());
            stmt.setBigDecimal(10, produto.getPercentualLucro());
            stmt.setString(11, produto.getDescricao());
            stmt.setString(12, produto.getObservacoes());
            stmt.setBoolean(13, produto.getAtivo() != null ? produto.getAtivo() : true);
            stmt.setTimestamp(14, produto.getDataCriacao() != null ? Timestamp.valueOf(produto.getDataCriacao()) : Timestamp.valueOf(now));
            stmt.setTimestamp(15, produto.getDataAlteracao() != null ? Timestamp.valueOf(produto.getDataAlteracao()) : Timestamp.valueOf(now));
            
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
                     "marca_id = ?, quantidade_minima = ?, valor_compra = ?, valor_venda = ?, quantidade = ?, " +
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
            stmt.setObject(6, produto.getQuantidadeMinima());
            stmt.setBigDecimal(7, produto.getValorCompra());
            stmt.setBigDecimal(8, produto.getValorVenda());
            stmt.setObject(9, produto.getQuantidade());
            stmt.setBigDecimal(10, produto.getPercentualLucro());
            stmt.setString(11, produto.getDescricao());
            stmt.setString(12, produto.getObservacoes());
            stmt.setBoolean(13, produto.getAtivo() != null ? produto.getAtivo() : true);
            stmt.setTimestamp(14, Timestamp.valueOf(now));
            stmt.setLong(15, produto.getId());
            
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
    
    private Produto mapResultSetToProduto(ResultSet rs) throws SQLException {
        Produto produto = new Produto();
        produto.setId(rs.getLong("id"));
        produto.setProduto(rs.getString("produto"));
        produto.setUnidadeMedidaId(rs.getObject("unidade_medida_id", Long.class));
        produto.setCodigoBarras(rs.getString("codigo_barras"));
        produto.setReferencia(rs.getString("referencia"));
        produto.setMarcaId(rs.getObject("marca_id", Long.class));
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
        
        return produto;
    }
} 