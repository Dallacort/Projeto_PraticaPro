package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.FornecedorTelefone;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FornecedorTelefoneRepository {

    private final DatabaseConnection databaseConnection;

    public FornecedorTelefoneRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public List<FornecedorTelefone> findByFornecedorId(Long fornecedorId) {
        List<FornecedorTelefone> telefones = new ArrayList<>();
        String sql = "SELECT * FROM fornecedor_telefone WHERE fornecedor_id = ? AND ativo = 1 ORDER BY principal DESC, id";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, fornecedorId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                telefones.add(mapResultSetToFornecedorTelefone(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar telefones do fornecedor", e);
        }

        return telefones;
    }

    public Optional<FornecedorTelefone> findById(Long id) {
        String sql = "SELECT * FROM fornecedor_telefone WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return Optional.of(mapResultSetToFornecedorTelefone(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar telefone por ID", e);
        }

        return Optional.empty();
    }

    public FornecedorTelefone save(FornecedorTelefone telefone) {
        if (telefone.getId() == null) {
            return insert(telefone);
        } else {
            return update(telefone);
        }
    }

    private FornecedorTelefone insert(FornecedorTelefone telefone) {
        String sql = "INSERT INTO fornecedor_telefone (fornecedor_id, telefone, tipo, principal, ativo, data_criacao, data_alteracao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setLong(1, telefone.getFornecedorId());
            stmt.setString(2, telefone.getTelefone());
            stmt.setString(3, telefone.getTipo() != null ? telefone.getTipo() : "COMERCIAL");
            stmt.setBoolean(4, telefone.getPrincipal() != null ? telefone.getPrincipal() : false);
            stmt.setBoolean(5, telefone.getAtivo() != null ? telefone.getAtivo() : true);
            stmt.setTimestamp(6, Timestamp.valueOf(now));
            stmt.setTimestamp(7, Timestamp.valueOf(now));

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                telefone.setId(rs.getLong(1));
            }

            telefone.setDataCriacao(now);
            telefone.setDataAlteracao(now);

            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir telefone", e);
        }

        return telefone;
    }

    private FornecedorTelefone update(FornecedorTelefone telefone) {
        String sql = "UPDATE fornecedor_telefone SET telefone = ?, tipo = ?, principal = ?, ativo = ?, data_alteracao = ? WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setString(1, telefone.getTelefone());
            stmt.setString(2, telefone.getTipo());
            stmt.setBoolean(3, telefone.getPrincipal());
            stmt.setBoolean(4, telefone.getAtivo());
            stmt.setTimestamp(5, Timestamp.valueOf(now));
            stmt.setLong(6, telefone.getId());

            stmt.executeUpdate();
            telefone.setDataAlteracao(now);

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar telefone", e);
        }

        return telefone;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM fornecedor_telefone WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar telefone", e);
        }
    }

    public void deleteByFornecedorId(Long fornecedorId) {
        String sql = "UPDATE fornecedor_telefone SET ativo = 0 WHERE fornecedor_id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, fornecedorId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao desativar telefones do fornecedor", e);
        }
    }

    // Garantir que apenas um telefone seja principal por fornecedor
    public void setPrincipal(Long fornecedorId, Long telefoneId) {
        String sql = "UPDATE fornecedor_telefone SET principal = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE fornecedor_id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, telefoneId);
            stmt.setLong(2, fornecedorId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao definir telefone principal", e);
        }
    }

    private FornecedorTelefone mapResultSetToFornecedorTelefone(ResultSet rs) throws SQLException {
        FornecedorTelefone telefone = new FornecedorTelefone();
        telefone.setId(rs.getLong("id"));
        telefone.setFornecedorId(rs.getLong("fornecedor_id"));
        telefone.setTelefone(rs.getString("telefone"));
        telefone.setTipo(rs.getString("tipo"));
        telefone.setPrincipal(rs.getBoolean("principal"));
        telefone.setAtivo(rs.getBoolean("ativo"));

        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        if (dataCriacao != null) {
            telefone.setDataCriacao(dataCriacao.toLocalDateTime());
        }

        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        if (dataAlteracao != null) {
            telefone.setDataAlteracao(dataAlteracao.toLocalDateTime());
        }

        return telefone;
    }
} 