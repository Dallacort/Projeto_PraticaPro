package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.FornecedorEmail;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FornecedorEmailRepository {

    private final DatabaseConnection databaseConnection;

    public FornecedorEmailRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public List<FornecedorEmail> findByFornecedorId(Long fornecedorId) {
        List<FornecedorEmail> emails = new ArrayList<>();
        String sql = "SELECT * FROM fornecedor_email WHERE fornecedor_id = ? AND ativo = 1 ORDER BY principal DESC, id";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, fornecedorId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                emails.add(mapResultSetToFornecedorEmail(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar emails do fornecedor", e);
        }

        return emails;
    }

    public Optional<FornecedorEmail> findById(Long id) {
        String sql = "SELECT * FROM fornecedor_email WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return Optional.of(mapResultSetToFornecedorEmail(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar email por ID", e);
        }

        return Optional.empty();
    }

    public FornecedorEmail save(FornecedorEmail email) {
        if (email.getId() == null) {
            return insert(email);
        } else {
            return update(email);
        }
    }

    private FornecedorEmail insert(FornecedorEmail email) {
        String sql = "INSERT INTO fornecedor_email (fornecedor_id, email, tipo, principal, ativo, data_criacao, data_alteracao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setLong(1, email.getFornecedorId());
            stmt.setString(2, email.getEmail());
            stmt.setString(3, email.getTipo() != null ? email.getTipo() : "COMERCIAL");
            stmt.setBoolean(4, email.getPrincipal() != null ? email.getPrincipal() : false);
            stmt.setBoolean(5, email.getAtivo() != null ? email.getAtivo() : true);
            stmt.setTimestamp(6, Timestamp.valueOf(now));
            stmt.setTimestamp(7, Timestamp.valueOf(now));

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                email.setId(rs.getLong(1));
            }

            email.setDataCriacao(now);
            email.setDataAlteracao(now);

            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir email", e);
        }

        return email;
    }

    private FornecedorEmail update(FornecedorEmail email) {
        String sql = "UPDATE fornecedor_email SET email = ?, tipo = ?, principal = ?, ativo = ?, data_alteracao = ? WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setString(1, email.getEmail());
            stmt.setString(2, email.getTipo());
            stmt.setBoolean(3, email.getPrincipal());
            stmt.setBoolean(4, email.getAtivo());
            stmt.setTimestamp(5, Timestamp.valueOf(now));
            stmt.setLong(6, email.getId());

            stmt.executeUpdate();
            email.setDataAlteracao(now);

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar email", e);
        }

        return email;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM fornecedor_email WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar email", e);
        }
    }

    public void deleteByFornecedorId(Long fornecedorId) {
        String sql = "UPDATE fornecedor_email SET ativo = 0 WHERE fornecedor_id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, fornecedorId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao desativar emails do fornecedor", e);
        }
    }

    // Garantir que apenas um email seja principal por fornecedor
    public void setPrincipal(Long fornecedorId, Long emailId) {
        String sql = "UPDATE fornecedor_email SET principal = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE fornecedor_id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, emailId);
            stmt.setLong(2, fornecedorId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao definir email principal", e);
        }
    }

    private FornecedorEmail mapResultSetToFornecedorEmail(ResultSet rs) throws SQLException {
        FornecedorEmail email = new FornecedorEmail();
        email.setId(rs.getLong("id"));
        email.setFornecedorId(rs.getLong("fornecedor_id"));
        email.setEmail(rs.getString("email"));
        email.setTipo(rs.getString("tipo"));
        email.setPrincipal(rs.getBoolean("principal"));
        email.setAtivo(rs.getBoolean("ativo"));

        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        if (dataCriacao != null) {
            email.setDataCriacao(dataCriacao.toLocalDateTime());
        }

        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        if (dataAlteracao != null) {
            email.setDataAlteracao(dataAlteracao.toLocalDateTime());
        }

        return email;
    }
} 