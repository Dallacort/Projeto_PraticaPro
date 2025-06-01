package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.ProdutoFornecedor;
import com.example.PizzariaGraff.model.Produto;
import com.example.PizzariaGraff.model.Fornecedor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ProdutoFornecedorRepository {
    
    private final DatabaseConnection databaseConnection;
    private final ProdutoRepository produtoRepository;
    private final FornecedorRepository fornecedorRepository;
    
    public ProdutoFornecedorRepository(DatabaseConnection databaseConnection, 
                                     ProdutoRepository produtoRepository, 
                                     FornecedorRepository fornecedorRepository) {
        this.databaseConnection = databaseConnection;
        this.produtoRepository = produtoRepository;
        this.fornecedorRepository = fornecedorRepository;
    }
    
    
    public List<ProdutoFornecedor> findAll() {
        List<ProdutoFornecedor> produtosFornecedores = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT pf.*, p.nome as produto_nome, p.codigo as produto_codigo, " +
                "f.razao_social as fornecedor_nome FROM produto_fornecedor pf " +
                "LEFT JOIN produto p ON pf.produto_id = p.id " +
                "LEFT JOIN fornecedores f ON pf.fornecedor_id = f.id")) {
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                produtosFornecedores.add(mapRowToProdutoFornecedor(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produtos de fornecedores", e);
        }
        return produtosFornecedores;
    }
    
    public List<ProdutoFornecedor> findByAtivoTrue() {
        List<ProdutoFornecedor> produtosFornecedores = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT pf.*, p.nome as produto_nome, p.codigo as produto_codigo, " +
                "f.razao_social as fornecedor_nome FROM produto_fornecedor pf " +
                "LEFT JOIN produto p ON pf.produto_id = p.id " +
                "LEFT JOIN fornecedores f ON pf.fornecedor_id = f.id " +
                "WHERE pf.ativo = true")) {
            
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                produtosFornecedores.add(mapRowToProdutoFornecedor(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produtos de fornecedores ativos", e);
        }
        return produtosFornecedores;
    }
    
    public Optional<ProdutoFornecedor> findById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT pf.*, p.nome as produto_nome, p.codigo as produto_codigo, " +
                "f.razao_social as fornecedor_nome FROM produto_fornecedor pf " +
                "LEFT JOIN produto p ON pf.produto_id = p.id " +
                "LEFT JOIN fornecedores f ON pf.fornecedor_id = f.id " +
                "WHERE pf.id = ?")) {
            
            statement.setLong(1, id);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return Optional.of(mapRowToProdutoFornecedor(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produto de fornecedor por ID", e);
        }
        return Optional.empty();
    }
    
    public List<ProdutoFornecedor> findByProdutoId(Long produtoId) {
        List<ProdutoFornecedor> produtosFornecedores = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT pf.*, p.nome as produto_nome, p.codigo as produto_codigo, " +
                "f.razao_social as fornecedor_nome FROM produto_fornecedor pf " +
                "LEFT JOIN produto p ON pf.produto_id = p.id " +
                "LEFT JOIN fornecedores f ON pf.fornecedor_id = f.id " +
                "WHERE pf.produto_id = ?")) {
            
            statement.setLong(1, produtoId);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                produtosFornecedores.add(mapRowToProdutoFornecedor(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produtos de fornecedores por produto", e);
        }
        return produtosFornecedores;
    }
    
    public List<ProdutoFornecedor> findByFornecedorId(Long fornecedorId) {
        List<ProdutoFornecedor> produtosFornecedores = new ArrayList<>();
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "SELECT pf.*, p.nome as produto_nome, p.codigo as produto_codigo, " +
                "f.razao_social as fornecedor_nome FROM produto_fornecedor pf " +
                "LEFT JOIN produto p ON pf.produto_id = p.id " +
                "LEFT JOIN fornecedores f ON pf.fornecedor_id = f.id " +
                "WHERE pf.fornecedor_id = ?")) {
            
            statement.setLong(1, fornecedorId);
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                produtosFornecedores.add(mapRowToProdutoFornecedor(resultSet));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produtos de fornecedores por fornecedor", e);
        }
        return produtosFornecedores;
    }
    
    public ProdutoFornecedor save(ProdutoFornecedor produtoFornecedor) {
        if (produtoFornecedor.getId() == null) {
            return insert(produtoFornecedor);
        } else {
            return update(produtoFornecedor);
        }
    }
    
    private ProdutoFornecedor insert(ProdutoFornecedor produtoFornecedor) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO produto_fornecedor (produto_id, fornecedor_id, codigo_prod, custo, ativo, data_cadastro, ultima_modificacao) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            if (produtoFornecedor.getProduto() != null && produtoFornecedor.getProduto().getId() != null) {
                statement.setLong(1, produtoFornecedor.getProduto().getId());
            } else {
                statement.setNull(1, Types.BIGINT);
            }
            
            if (produtoFornecedor.getFornecedor() != null && produtoFornecedor.getFornecedor().getId() != null) {
                statement.setLong(2, produtoFornecedor.getFornecedor().getId());
            } else {
                statement.setNull(2, Types.BIGINT);
            }
            
            statement.setString(3, produtoFornecedor.getCodigoProd());
            
            if (produtoFornecedor.getCusto() != null) {
                statement.setBigDecimal(4, produtoFornecedor.getCusto());
            } else {
                statement.setNull(4, Types.DECIMAL);
            }
            
            statement.setBoolean(5, produtoFornecedor.getAtivo() != null ? produtoFornecedor.getAtivo() : true);
            statement.setTimestamp(6, Timestamp.valueOf(now));
            statement.setTimestamp(7, Timestamp.valueOf(now));
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao criar produto de fornecedor, nenhuma linha afetada.");
            }
            
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    produtoFornecedor.setId(generatedKeys.getLong(1));
                    produtoFornecedor.setDataCadastro(now);
                    produtoFornecedor.setUltimaModificacao(now);
                } else {
                    throw new SQLException("Falha ao criar produto de fornecedor, nenhum ID obtido.");
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir produto de fornecedor", e);
        }
        return produtoFornecedor;
    }
    
    private ProdutoFornecedor update(ProdutoFornecedor produtoFornecedor) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "UPDATE produto_fornecedor SET produto_id = ?, fornecedor_id = ?, " +
                "codigo_prod = ?, custo = ?, ativo = ?, ultima_modificacao = ? WHERE id = ?")) {
            
            LocalDateTime now = LocalDateTime.now();
            
            if (produtoFornecedor.getProduto() != null && produtoFornecedor.getProduto().getId() != null) {
                statement.setLong(1, produtoFornecedor.getProduto().getId());
            } else {
                statement.setNull(1, Types.BIGINT);
            }
            
            if (produtoFornecedor.getFornecedor() != null && produtoFornecedor.getFornecedor().getId() != null) {
                statement.setLong(2, produtoFornecedor.getFornecedor().getId());
            } else {
                statement.setNull(2, Types.BIGINT);
            }
            
            statement.setString(3, produtoFornecedor.getCodigoProd());
            
            if (produtoFornecedor.getCusto() != null) {
                statement.setBigDecimal(4, produtoFornecedor.getCusto());
            } else {
                statement.setNull(4, Types.DECIMAL);
            }
            
            statement.setBoolean(5, produtoFornecedor.getAtivo() != null ? produtoFornecedor.getAtivo() : true);
            statement.setTimestamp(6, Timestamp.valueOf(now));
            statement.setLong(7, produtoFornecedor.getId());
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Falha ao atualizar produto de fornecedor, nenhuma linha afetada.");
            }
            
            produtoFornecedor.setUltimaModificacao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar produto de fornecedor", e);
        }
        return produtoFornecedor;
    }
    
    public void deleteById(Long id) {
        try (Connection connection = databaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                "DELETE FROM produto_fornecedor WHERE id = ?")) {
            
            statement.setLong(1, id);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao excluir produto de fornecedor", e);
        }
    }
    
    private ProdutoFornecedor mapRowToProdutoFornecedor(ResultSet rs) throws SQLException {
        ProdutoFornecedor produtoFornecedor = new ProdutoFornecedor();
        produtoFornecedor.setId(rs.getLong("id"));
        produtoFornecedor.setCodigoProd(rs.getString("codigo_prod"));
        produtoFornecedor.setCusto(rs.getBigDecimal("custo"));
        produtoFornecedor.setAtivo(rs.getBoolean("ativo"));
        
        // Carregar campos de data
        try {
            Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
            if (dataCadastroTimestamp != null) {
                produtoFornecedor.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
            }
            
            Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacaoTimestamp != null) {
                produtoFornecedor.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
            }
        } catch (SQLException e) {
            System.err.println("Erro ao carregar campos de data: " + e.getMessage());
        }
        
        // Carregar informações básicas do produto
        Long produtoId = rs.getLong("produto_id");
        if (produtoId > 0) {
            Produto produto = new Produto();
            produto.setId(produtoId);
            produto.setProduto(rs.getString("produto_nome"));
            produto.setCodigoBarras(rs.getString("produto_codigo"));
            produtoFornecedor.setProduto(produto);
        }
        
        // Carregar informações básicas do fornecedor
        Long fornecedorId = rs.getLong("fornecedor_id");
        if (fornecedorId > 0) {
            Fornecedor fornecedor = new Fornecedor();
            fornecedor.setId(fornecedorId);
            fornecedor.setFornecedor(rs.getString("fornecedor_nome"));
            produtoFornecedor.setFornecedor(fornecedor);
        }
        
        return produtoFornecedor;
    }
} 