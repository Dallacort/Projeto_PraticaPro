package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.TransportadoraEmail;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class TransportadoraEmailRepository {

    private final DatabaseConnection databaseConnection;

    public TransportadoraEmailRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public List<TransportadoraEmail> findByTransportadoraId(Long transportadoraId) {
        List<TransportadoraEmail> emails = new ArrayList<>();
        String sql = "SELECT * FROM transportadora_emails WHERE cod_trans = ? ORDER BY id_email";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, transportadoraId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                emails.add(mapResultSetToTransportadoraEmail(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar emails da transportadora", e);
        }

        return emails;
    }

    public Optional<TransportadoraEmail> findById(Long id) {
        String sql = "SELECT * FROM transportadora_emails WHERE id_email = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return Optional.of(mapResultSetToTransportadoraEmail(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar email por ID", e);
        }

        return Optional.empty();
    }

    public TransportadoraEmail save(TransportadoraEmail email) {
        if (email.getId() == null) {
            return insert(email);
        } else {
            return update(email);
        }
    }

    private TransportadoraEmail insert(TransportadoraEmail email) {
        String sql = "INSERT INTO transportadora_emails (cod_trans, email) VALUES (?, ?)";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setLong(1, email.getTransportadoraId());
            stmt.setString(2, email.getEmail());

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                email.setId(rs.getLong(1));
            }

            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir email", e);
        }

        return email;
    }

    private TransportadoraEmail update(TransportadoraEmail email) {
        String sql = "UPDATE transportadora_emails SET email = ? WHERE id_email = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email.getEmail());
            stmt.setLong(2, email.getId());

            stmt.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar email", e);
        }

        return email;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM transportadora_emails WHERE id_email = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar email", e);
        }
    }

    public void deleteByTransportadoraId(Long transportadoraId) {
        String sql = "DELETE FROM transportadora_emails WHERE cod_trans = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, transportadoraId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar emails da transportadora", e);
        }
    }

    private TransportadoraEmail mapResultSetToTransportadoraEmail(ResultSet rs) throws SQLException {
        TransportadoraEmail email = new TransportadoraEmail();
        email.setId(rs.getLong("id_email"));
        email.setTransportadoraId(rs.getLong("cod_trans"));
        email.setEmail(rs.getString("email"));
        email.setAtivo(true); // Como a tabela não tem campo ativo, sempre true

        return email;
    }
} 