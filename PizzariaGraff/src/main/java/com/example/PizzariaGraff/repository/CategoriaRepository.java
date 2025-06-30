package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.Categoria;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public class CategoriaRepository {

    private final DatabaseConnection databaseConnection;

    public CategoriaRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
        verificarEstruturaBanco();
    }

    private void verificarEstruturaBanco() {
        try (Connection conn = databaseConnection.getConnection()) {
            // Verifica se as novas colunas existem e as adiciona se necessário
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet columns = metaData.getColumns(null, null, "categoria", null);
            
            Set<String> existingColumns = new HashSet<>();
            while (columns.next()) {
                existingColumns.add(columns.getString("COLUMN_NAME").toLowerCase());
            }
            
            // Adiciona coluna ativo se não existir
            if (!existingColumns.contains("ativo")) {
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("ALTER TABLE categoria ADD COLUMN ativo TINYINT(1) DEFAULT 1 COMMENT 'Status da categoria: 1=Ativo, 0=Inativo'");
                    // Define todos como ativos por padrão
                    stmt.execute("UPDATE categoria SET ativo = TRUE");
                }
            }
            columns.close();
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/criar estrutura do banco para categoria: " + e.getMessage());
        }
    }

    public List<Categoria> findAll() {
        List<Categoria> categorias = new ArrayList<>();
        String sql = "SELECT * FROM categoria ORDER BY categoria";

        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                categorias.add(mapResultSetToCategoria(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar categorias", e);
        }

        return categorias;
    }

    public List<Categoria> findByAtivoTrue() {
        List<Categoria> categorias = new ArrayList<>();
        String sql = "SELECT * FROM categoria WHERE ativo = TRUE ORDER BY categoria";

        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                categorias.add(mapResultSetToCategoria(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar categorias ativas", e);
        }

        return categorias;
    }

    public Optional<Categoria> findById(Long id) {
        String sql = "SELECT * FROM categoria WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return Optional.of(mapResultSetToCategoria(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar categoria por ID", e);
        }

        return Optional.empty();
    }

    public List<Categoria> findByCategoria(String nome) {
        List<Categoria> categorias = new ArrayList<>();
        String sql = "SELECT * FROM categoria WHERE categoria LIKE ? ORDER BY categoria";
        String searchTerm = "%" + nome + "%";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, searchTerm);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                categorias.add(mapResultSetToCategoria(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar categorias por nome", e);
        }

        return categorias;
    }

    public Categoria save(Categoria categoria) {
        if (categoria.getId() == null) {
            return insert(categoria);
        } else {
            return update(categoria);
        }
    }

    private Categoria insert(Categoria categoria) {
        String sql = "INSERT INTO categoria (categoria, ativo, data_criacao, data_alteracao) VALUES (?, ?, ?, ?)";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setString(1, categoria.getCategoria());
            stmt.setBoolean(2, categoria.getAtivo() != null ? categoria.getAtivo() : true);
            stmt.setTimestamp(3, categoria.getDataCriacao() != null ? Timestamp.valueOf(categoria.getDataCriacao()) : Timestamp.valueOf(now));
            stmt.setTimestamp(4, categoria.getDataAlteracao() != null ? Timestamp.valueOf(categoria.getDataAlteracao()) : Timestamp.valueOf(now));

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                categoria.setId(rs.getLong(1));
            }

            if (categoria.getDataCriacao() == null) {
                categoria.setDataCriacao(now);
            }
            if (categoria.getDataAlteracao() == null) {
                categoria.setDataAlteracao(now);
            }

            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir categoria", e);
        }

        return categoria;
    }

    private Categoria update(Categoria categoria) {
        String sql = "UPDATE categoria SET categoria = ?, ativo = ?, data_alteracao = ? WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setString(1, categoria.getCategoria());
            stmt.setBoolean(2, categoria.getAtivo() != null ? categoria.getAtivo() : true);
            stmt.setTimestamp(3, Timestamp.valueOf(now));
            stmt.setLong(4, categoria.getId());

            stmt.executeUpdate();

            categoria.setDataAlteracao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar categoria", e);
        }

        return categoria;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM categoria WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar categoria", e);
        }
    }

    private Categoria mapResultSetToCategoria(ResultSet rs) throws SQLException {
        Categoria categoria = new Categoria();
        categoria.setId(rs.getLong("id"));
        categoria.setCategoria(rs.getString("categoria"));

        // Carregar campo ativo do banco
        categoria.setAtivo(rs.getBoolean("ativo"));

        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        if (dataCriacao != null) {
            categoria.setDataCriacao(dataCriacao.toLocalDateTime());
        }

        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        if (dataAlteracao != null) {
            categoria.setDataAlteracao(dataAlteracao.toLocalDateTime());
        }

        return categoria;
    }
} 