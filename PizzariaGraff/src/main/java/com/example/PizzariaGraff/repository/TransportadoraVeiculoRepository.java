package com.example.PizzariaGraff.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@Repository
public class TransportadoraVeiculoRepository {

    @Autowired
    private DatabaseConnection databaseConnection;

    public void deleteByTransportadoraId(Long transportadoraId) {
        String sql = "DELETE FROM transportadora_veiculo WHERE transportadora_id = ?";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, transportadoraId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar veículos da transportadora", e);
        }
    }

    public void save(Long transportadoraId, Long veiculoId) {
        String sql = "INSERT INTO transportadora_veiculo (transportadora_id, veiculo_id) VALUES (?, ?)";
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, transportadoraId);
            stmt.setLong(2, veiculoId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar associação de veículo", e);
        }
    }
}