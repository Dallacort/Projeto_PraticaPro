package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.repository.DatabaseConnection;
import com.example.PizzariaGraff.model.Produto;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ProdutoRepository {
    
    private final DatabaseConnection databaseConnection;
    
    public ProdutoRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }
    
    public List<Produto> findAll() {
        List<Produto> produtos = new ArrayList<>();
        
        // Verificar se as colunas de data existem
        try (Connection conn = databaseConnection.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            
            // Verificar se a tabela existe
            boolean tabelaExiste = false;
            try (ResultSet rs = metaData.getTables(null, null, null, new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    System.out.println("Tabela encontrada: " + tableName);
                    if ("produto".equalsIgnoreCase(tableName)) {
                        tabelaExiste = true;
                        break;
                    }
                }
            }
            
            if (tabelaExiste) {
                // Verificar se as colunas de data existem
                boolean temDataCadastro = false;
                boolean temUltimaModificacao = false;
                
                try (ResultSet colunas = metaData.getColumns(null, null, "produto", null)) {
                    System.out.println("Verificando colunas da tabela produto:");
                    while (colunas.next()) {
                        String colName = colunas.getString("COLUMN_NAME");
                        String colType = colunas.getString("TYPE_NAME");
                        System.out.println("  - Coluna: " + colName + ", Tipo: " + colType);
                        
                        if ("data_cadastro".equalsIgnoreCase(colName)) {
                            temDataCadastro = true;
                        } else if ("ultima_modificacao".equalsIgnoreCase(colName)) {
                            temUltimaModificacao = true;
                        }
                    }
                }
                
                if (!temDataCadastro || !temUltimaModificacao) {
                    System.out.println("Adicionando colunas de data à tabela produto");
                    try (Statement stmt = conn.createStatement()) {
                        if (!temDataCadastro) {
                            stmt.execute("ALTER TABLE produto ADD COLUMN data_cadastro TIMESTAMP");
                            System.out.println("Coluna data_cadastro adicionada à tabela produto");
                        }
                        
                        if (!temUltimaModificacao) {
                            stmt.execute("ALTER TABLE produto ADD COLUMN ultima_modificacao TIMESTAMP");
                            System.out.println("Coluna ultima_modificacao adicionada à tabela produto");
                        }
                        
                        // Se adicionamos as colunas, atualizar registros existentes com a data atual
                        if (!temDataCadastro || !temUltimaModificacao) {
                            LocalDateTime now = LocalDateTime.now();
                            stmt.execute("UPDATE produto SET " + 
                                        (!temDataCadastro ? "data_cadastro = '" + Timestamp.valueOf(now) + "'" : "") +
                                        (!temDataCadastro && !temUltimaModificacao ? ", " : "") +
                                        (!temUltimaModificacao ? "ultima_modificacao = '" + Timestamp.valueOf(now) + "'" : ""));
                            System.out.println("Registros existentes atualizados com datas");
                        }
                    }
                }
            } else {
                System.out.println("Tabela 'produto' não existe, será criada quando necessário");
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/modificar estrutura da tabela produto: " + e.getMessage());
            e.printStackTrace();
        }
        
        String sql = "SELECT * FROM produto ORDER BY descricao ASC";
        
        System.out.println("ProdutoRepository.findAll() - Executando SQL: " + sql);
        
        try (Connection conn = databaseConnection.getConnection()) {
            System.out.println("ProdutoRepository.findAll() - Conexão obtida com sucesso");
            
            try (Statement stmt = conn.createStatement()) {
                System.out.println("ProdutoRepository.findAll() - Statement criado com sucesso");
                
                try (ResultSet rs = stmt.executeQuery(sql)) {
                    System.out.println("ProdutoRepository.findAll() - Query executada com sucesso");
                    
                    while (rs.next()) {
                        try {
                            Produto produto = mapResultSetToProduto(rs);
                            System.out.println("ProdutoRepository.findAll() - Produto carregado: " + produto.getDescricao() + 
                                             ", Data cadastro: " + produto.getDataCadastro() + 
                                             ", Última modificação: " + produto.getUltimaModificacao());
                            produtos.add(produto);
                        } catch (SQLException e) {
                            System.err.println("Erro ao mapear produto do ResultSet: " + e.getMessage());
                            e.printStackTrace();
                            // Continua para o próximo registro
                        }
                    }
                    
                    System.out.println("ProdutoRepository.findAll() - " + produtos.size() + " produtos encontrados");
                }
            }
        } catch (SQLException e) {
            System.err.println("ProdutoRepository.findAll() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar produtos", e);
        }
        
        return produtos;
    }
    
    public List<Produto> findByAtivoTrue() {
        List<Produto> produtos = new ArrayList<>();
        String sql = "SELECT * FROM produto WHERE ativo = true ORDER BY descricao ASC";
        
        System.out.println("ProdutoRepository.findByAtivoTrue() - Executando SQL: " + sql);
        
        try (Connection conn = databaseConnection.getConnection()) {
            try (Statement stmt = conn.createStatement()) {
                try (ResultSet rs = stmt.executeQuery(sql)) {
                    while (rs.next()) {
                        try {
                            produtos.add(mapResultSetToProduto(rs));
                        } catch (SQLException e) {
                            System.err.println("Erro ao mapear produto do ResultSet: " + e.getMessage());
                            e.printStackTrace();
                        }
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("ProdutoRepository.findByAtivoTrue() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar produtos ativos", e);
        }
        
        return produtos;
    }
    
    public Optional<Produto> findById(Long id) {
        String sql = "SELECT * FROM produto WHERE id = ?";
        
        System.out.println("ProdutoRepository.findById() - Buscando produto com ID: " + id);
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            System.out.println("ProdutoRepository.findById() - Executando SQL: " + sql.replace("?", id.toString()));
            
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                try {
                    Produto produto = mapResultSetToProduto(rs);
                    System.out.println("ProdutoRepository.findById() - Produto encontrado: " + produto.getDescricao() + 
                                     ", Data cadastro: " + produto.getDataCadastro() + 
                                     ", Última modificação: " + produto.getUltimaModificacao());
                    return Optional.of(produto);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear produto do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("ProdutoRepository.findById() - Nenhum produto encontrado com ID: " + id);
            }
            rs.close();
        } catch (SQLException e) {
            System.err.println("ProdutoRepository.findById() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar produto por ID", e);
        }
        
        return Optional.empty();
    }
    
    public Optional<Produto> findByCodigo(String codigo) {
        String sql = "SELECT * FROM produto WHERE codigo = ?";
        
        System.out.println("ProdutoRepository.findByCodigo() - Buscando produto com código: " + codigo);
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, codigo);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                try {
                    Produto produto = mapResultSetToProduto(rs);
                    System.out.println("ProdutoRepository.findByCodigo() - Produto encontrado: " + produto.getDescricao());
                    return Optional.of(produto);
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear produto do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            rs.close();
        } catch (SQLException e) {
            System.err.println("ProdutoRepository.findByCodigo() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar produto por código", e);
        }
        
        return Optional.empty();
    }
    
    public Produto save(Produto produto) {
        if (produto.getId() == null) {
            return insert(produto);
        } else {
            return update(produto);
        }
    }
    
    private Produto insert(Produto produto) {
        String sql = "INSERT INTO produto (codigo, nome, descricao, preco, ativo, data_cadastro, ultima_modificacao) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, produto.getCodigo());
            stmt.setString(2, produto.getNome());
            stmt.setString(3, produto.getDescricao());
            stmt.setBigDecimal(4, produto.getPreco());
            stmt.setBoolean(5, produto.getAtivo() != null ? produto.getAtivo() : true);
            stmt.setTimestamp(6, Timestamp.valueOf(now));
            stmt.setTimestamp(7, Timestamp.valueOf(now));
            
            System.out.println("ProdutoRepository.insert() - Inserindo produto com data_cadastro: " + now);
            System.out.println("ProdutoRepository.insert() - Inserindo produto com ultima_modificacao: " + now);
            
            stmt.executeUpdate();
            
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                produto.setId(rs.getLong(1));
            }
            
            // Atualiza o objeto após a inserção
            produto.setDataCadastro(now);
            produto.setUltimaModificacao(now);
            
            rs.close();
        } catch (SQLException e) {
            System.err.println("ProdutoRepository.insert() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao inserir produto", e);
        }
        
        return produto;
    }
    
    private Produto update(Produto produto) {
        String sql = "UPDATE produto SET codigo = ?, nome = ?, descricao = ?, preco = ?, ativo = ?, ultima_modificacao = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, produto.getCodigo());
            stmt.setString(2, produto.getNome());
            stmt.setString(3, produto.getDescricao());
            stmt.setBigDecimal(4, produto.getPreco());
            stmt.setBoolean(5, produto.getAtivo() != null ? produto.getAtivo() : true);
            stmt.setTimestamp(6, Timestamp.valueOf(now));
            stmt.setLong(7, produto.getId());
            
            System.out.println("ProdutoRepository.update() - Atualizando produto com ultima_modificacao: " + now);
            
            stmt.executeUpdate();
            
            // Atualiza o objeto após a atualização no banco
            produto.setUltimaModificacao(now);
        } catch (SQLException e) {
            System.err.println("ProdutoRepository.update() - Erro: " + e.getMessage());
            e.printStackTrace();
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
            
            System.out.println("ProdutoRepository.deleteById() - Produto ID " + id + " excluído com sucesso");
        } catch (SQLException e) {
            System.err.println("ProdutoRepository.deleteById() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao deletar produto", e);
        }
    }
    
    public List<Produto> findByDescricaoContainingIgnoreCase(String termo) {
        List<Produto> produtos = new ArrayList<>();
        String sql = "SELECT * FROM produto WHERE LOWER(descricao) LIKE LOWER(?) ORDER BY descricao ASC";
        
        System.out.println("ProdutoRepository.findByDescricaoContainingIgnoreCase() - Pesquisando termo: " + termo);
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, "%" + termo + "%");
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                try {
                    produtos.add(mapResultSetToProduto(rs));
                } catch (SQLException e) {
                    System.err.println("Erro ao mapear produto do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            rs.close();
        } catch (SQLException e) {
            System.err.println("ProdutoRepository.findByDescricaoContainingIgnoreCase() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao pesquisar produtos", e);
        }
        
        return produtos;
    }
    
    private Produto mapResultSetToProduto(ResultSet rs) throws SQLException {
        Produto produto = new Produto();
        produto.setId(rs.getLong("id"));
        produto.setCodigo(rs.getString("codigo"));
        
        try {
            produto.setNome(rs.getString("nome"));
        } catch (SQLException e) {
            // Se o campo "nome" não existir, apenas ignoramos e continuamos
            System.err.println("Coluna 'nome' não encontrada: " + e.getMessage());
        }
        
        produto.setDescricao(rs.getString("descricao"));
        produto.setPreco(rs.getBigDecimal("preco"));
        produto.setAtivo(rs.getBoolean("ativo"));
        
        // Carregar data de cadastro
        try {
            Timestamp dataCadastro = rs.getTimestamp("data_cadastro");
            if (dataCadastro != null) {
                produto.setDataCadastro(dataCadastro.toLocalDateTime());
                System.out.println("ProdutoRepository: Data de cadastro carregada: " + produto.getDataCadastro());
            } else {
                System.out.println("ProdutoRepository: Timestamp de data_cadastro é null");
            }
        } catch (SQLException e) {
            System.err.println("Coluna 'data_cadastro' não encontrada ou erro ao ler: " + e.getMessage());
        }
        
        // Carregar última modificação
        try {
            Timestamp ultimaModificacao = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacao != null) {
                produto.setUltimaModificacao(ultimaModificacao.toLocalDateTime());
                System.out.println("ProdutoRepository: Última modificação carregada: " + produto.getUltimaModificacao());
            } else {
                System.out.println("ProdutoRepository: Timestamp de ultima_modificacao é null");
            }
        } catch (SQLException e) {
            System.err.println("Coluna 'ultima_modificacao' não encontrada ou erro ao ler: " + e.getMessage());
        }
        
        return produto;
    }
} 