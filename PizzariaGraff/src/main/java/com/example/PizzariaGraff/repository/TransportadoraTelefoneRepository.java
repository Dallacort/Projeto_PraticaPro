package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.TransportadoraTelefone;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class TransportadoraTelefoneRepository {

    private final DatabaseConnection databaseConnection;

    public TransportadoraTelefoneRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public List<TransportadoraTelefone> findByTransportadoraId(Long transportadoraId) {
        List<TransportadoraTelefone> telefones = new ArrayList<>();
        String sql = "SELECT * FROM transportadora_telefones WHERE cod_trans = ? ORDER BY id_telefone";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, transportadoraId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                telefones.add(mapResultSetToTransportadoraTelefone(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar telefones da transportadora", e);
        }

        return telefones;
    }

    public Optional<TransportadoraTelefone> findById(Long id) {
        String sql = "SELECT * FROM transportadora_telefones WHERE id_telefone = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return Optional.of(mapResultSetToTransportadoraTelefone(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar telefone por ID", e);
        }

        return Optional.empty();
    }

    public TransportadoraTelefone save(TransportadoraTelefone telefone) {
        if (telefone.getId() == null) {
            return insert(telefone);
        } else {
            return update(telefone);
        }
    }

    private TransportadoraTelefone insert(TransportadoraTelefone telefone) {
        String sql = "INSERT INTO transportadora_telefones (cod_trans, telefone) VALUES (?, ?)";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setLong(1, telefone.getTransportadoraId());
            stmt.setString(2, telefone.getTelefone());

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                telefone.setId(rs.getLong(1));
            }

            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir telefone", e);
        }

        return telefone;
    }

    private TransportadoraTelefone update(TransportadoraTelefone telefone) {
        String sql = "UPDATE transportadora_telefones SET telefone = ? WHERE id_telefone = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, telefone.getTelefone());
            stmt.setLong(2, telefone.getId());

            stmt.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar telefone", e);
        }

        return telefone;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM transportadora_telefones WHERE id_telefone = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar telefone", e);
        }
    }

    public void deleteByTransportadoraId(Long transportadoraId) {
        String sql = "DELETE FROM transportadora_telefones WHERE cod_trans = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, transportadoraId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar telefones da transportadora", e);
        }
    }

    private TransportadoraTelefone mapResultSetToTransportadoraTelefone(ResultSet rs) throws SQLException {
        TransportadoraTelefone telefone = new TransportadoraTelefone();
        telefone.setId(rs.getLong("id_telefone"));
        telefone.setTransportadoraId(rs.getLong("cod_trans"));
        telefone.setTelefone(rs.getString("telefone"));
        telefone.setAtivo(true); // Como a tabela não tem campo ativo, sempre true

        return telefone;
    }
} 