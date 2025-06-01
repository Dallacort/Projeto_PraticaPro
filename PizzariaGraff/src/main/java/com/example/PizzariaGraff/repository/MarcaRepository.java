package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.Marca;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class MarcaRepository {

    private final DatabaseConnection databaseConnection;

    public MarcaRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public List<Marca> findAll() {
        List<Marca> marcas = new ArrayList<>();
        String sql = "SELECT * FROM marca ORDER BY marca";

        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                marcas.add(mapResultSetToMarca(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar marcas", e);
        }

        return marcas;
    }

    public Optional<Marca> findById(Long id) {
        String sql = "SELECT * FROM marca WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return Optional.of(mapResultSetToMarca(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar marca por ID", e);
        }

        return Optional.empty();
    }

    public List<Marca> findByMarca(String nome) {
        List<Marca> marcas = new ArrayList<>();
        String sql = "SELECT * FROM marca WHERE marca LIKE ? ORDER BY marca";
        String searchTerm = "%" + nome + "%";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, searchTerm);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                marcas.add(mapResultSetToMarca(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar marcas por nome", e);
        }

        return marcas;
    }

    public Marca save(Marca marca) {
        if (marca.getId() == null) {
            return insert(marca);
        } else {
            return update(marca);
        }
    }

    private Marca insert(Marca marca) {
        String sql = "INSERT INTO marca (marca, situacao, data_criacao, data_alteracao) VALUES (?, ?, ?, ?)";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setString(1, marca.getMarca());
            stmt.setDate(2, marca.getSituacao() != null ? Date.valueOf(marca.getSituacao()) : null);
            stmt.setTimestamp(3, marca.getDataCriacao() != null ? Timestamp.valueOf(marca.getDataCriacao()) : Timestamp.valueOf(now));
            stmt.setTimestamp(4, marca.getDataAlteracao() != null ? Timestamp.valueOf(marca.getDataAlteracao()) : Timestamp.valueOf(now));

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                marca.setId(rs.getLong(1));
            }

            if (marca.getDataCriacao() == null) {
                marca.setDataCriacao(now);
            }
            if (marca.getDataAlteracao() == null) {
                marca.setDataAlteracao(now);
            }

            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir marca", e);
        }

        return marca;
    }

    private Marca update(Marca marca) {
        String sql = "UPDATE marca SET marca = ?, situacao = ?, data_alteracao = ? WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setString(1, marca.getMarca());
            stmt.setDate(2, marca.getSituacao() != null ? Date.valueOf(marca.getSituacao()) : null);
            stmt.setTimestamp(3, Timestamp.valueOf(now));
            stmt.setLong(4, marca.getId());

            stmt.executeUpdate();

            marca.setDataAlteracao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar marca", e);
        }

        return marca;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM marca WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar marca", e);
        }
    }

    private Marca mapResultSetToMarca(ResultSet rs) throws SQLException {
        Marca marca = new Marca();
        marca.setId(rs.getLong("id"));
        marca.setMarca(rs.getString("marca"));

        Date situacao = rs.getDate("situacao");
        if (situacao != null) {
            marca.setSituacao(situacao.toLocalDate());
        }

        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        if (dataCriacao != null) {
            marca.setDataCriacao(dataCriacao.toLocalDateTime());
        }

        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        if (dataAlteracao != null) {
            marca.setDataAlteracao(dataAlteracao.toLocalDateTime());
        }

        return marca;
    }
} 