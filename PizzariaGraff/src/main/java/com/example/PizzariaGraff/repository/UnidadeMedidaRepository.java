package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.UnidadeMedida;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class UnidadeMedidaRepository {

    private final DatabaseConnection databaseConnection;

    public UnidadeMedidaRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
        verificarEstruturaBanco();
    }

    private void verificarEstruturaBanco() {
        try (Connection conn = databaseConnection.getConnection()) {
            // Verificar se a coluna 'ativo' existe na tabela unidade_medida
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet columns = metaData.getColumns(null, null, "unidade_medida", "ativo");
            
            if (!columns.next()) {
                // Coluna 'ativo' não existe, vamos criá-la
                System.out.println("Adicionando coluna 'ativo' na tabela unidade_medida");
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("ALTER TABLE unidade_medida ADD COLUMN ativo BOOLEAN DEFAULT TRUE");
                    // Atualizar registros existentes
                    stmt.execute("UPDATE unidade_medida SET ativo = TRUE WHERE situacao IS NOT NULL");
                    stmt.execute("UPDATE unidade_medida SET ativo = FALSE WHERE situacao IS NULL");
                }
            }
            columns.close();
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/criar estrutura do banco para unidade_medida: " + e.getMessage());
        }
    }

    public List<UnidadeMedida> findAll() {
        List<UnidadeMedida> unidades = new ArrayList<>();
        String sql = "SELECT * FROM unidade_medida ORDER BY unidade_medida";

        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                unidades.add(mapResultSetToUnidadeMedida(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar unidades de medida", e);
        }

        return unidades;
    }

    public List<UnidadeMedida> findByAtivoTrue() {
        List<UnidadeMedida> unidades = new ArrayList<>();
        String sql = "SELECT * FROM unidade_medida WHERE ativo = TRUE ORDER BY unidade_medida";

        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                unidades.add(mapResultSetToUnidadeMedida(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar unidades de medida ativas", e);
        }

        return unidades;
    }

    public Optional<UnidadeMedida> findById(Long id) {
        String sql = "SELECT * FROM unidade_medida WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return Optional.of(mapResultSetToUnidadeMedida(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar unidade de medida por ID", e);
        }

        return Optional.empty();
    }

    public List<UnidadeMedida> findByUnidadeMedida(String nome) {
        List<UnidadeMedida> unidades = new ArrayList<>();
        String sql = "SELECT * FROM unidade_medida WHERE unidade_medida LIKE ? ORDER BY unidade_medida";
        String searchTerm = "%" + nome + "%";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, searchTerm);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                unidades.add(mapResultSetToUnidadeMedida(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar unidades de medida por nome", e);
        }

        return unidades;
    }

    public UnidadeMedida save(UnidadeMedida unidadeMedida) {
        if (unidadeMedida.getId() == null) {
            return insert(unidadeMedida);
        } else {
            return update(unidadeMedida);
        }
    }

    private UnidadeMedida insert(UnidadeMedida unidadeMedida) {
        String sql = "INSERT INTO unidade_medida (unidade_medida, situacao, ativo, data_criacao, data_alteracao) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setString(1, unidadeMedida.getUnidadeMedida());
            stmt.setDate(2, unidadeMedida.getSituacao() != null ? Date.valueOf(unidadeMedida.getSituacao()) : null);
            stmt.setBoolean(3, unidadeMedida.getAtivo() != null ? unidadeMedida.getAtivo() : true);
            stmt.setTimestamp(4, unidadeMedida.getDataCriacao() != null ? Timestamp.valueOf(unidadeMedida.getDataCriacao()) : Timestamp.valueOf(now));
            stmt.setTimestamp(5, unidadeMedida.getDataAlteracao() != null ? Timestamp.valueOf(unidadeMedida.getDataAlteracao()) : Timestamp.valueOf(now));

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                unidadeMedida.setId(rs.getLong(1));
            }

            if (unidadeMedida.getDataCriacao() == null) {
                unidadeMedida.setDataCriacao(now);
            }
            if (unidadeMedida.getDataAlteracao() == null) {
                unidadeMedida.setDataAlteracao(now);
            }

            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir unidade de medida", e);
        }

        return unidadeMedida;
    }

    private UnidadeMedida update(UnidadeMedida unidadeMedida) {
        String sql = "UPDATE unidade_medida SET unidade_medida = ?, situacao = ?, ativo = ?, data_alteracao = ? WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setString(1, unidadeMedida.getUnidadeMedida());
            stmt.setDate(2, unidadeMedida.getSituacao() != null ? Date.valueOf(unidadeMedida.getSituacao()) : null);
            stmt.setBoolean(3, unidadeMedida.getAtivo() != null ? unidadeMedida.getAtivo() : true);
            stmt.setTimestamp(4, Timestamp.valueOf(now));
            stmt.setLong(5, unidadeMedida.getId());

            stmt.executeUpdate();

            unidadeMedida.setDataAlteracao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar unidade de medida", e);
        }

        return unidadeMedida;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM unidade_medida WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar unidade de medida", e);
        }
    }

    private UnidadeMedida mapResultSetToUnidadeMedida(ResultSet rs) throws SQLException {
        UnidadeMedida unidadeMedida = new UnidadeMedida();
        unidadeMedida.setId(rs.getLong("id"));
        unidadeMedida.setUnidadeMedida(rs.getString("unidade_medida"));

        Date situacao = rs.getDate("situacao");
        if (situacao != null) {
            unidadeMedida.setSituacao(situacao.toLocalDate());
        }

        // Carregar campo ativo do banco, com fallback para situacao se não existir
        try {
            unidadeMedida.setAtivo(rs.getBoolean("ativo"));
        } catch (SQLException e) {
            // Se a coluna ativo não existir, usar fallback baseado na situacao
            unidadeMedida.setAtivo(situacao != null);
        }

        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        if (dataCriacao != null) {
            unidadeMedida.setDataCriacao(dataCriacao.toLocalDateTime());
        }

        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        if (dataAlteracao != null) {
            unidadeMedida.setDataAlteracao(dataAlteracao.toLocalDateTime());
        }

        return unidadeMedida;
    }
} 