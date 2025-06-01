package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.repository.DatabaseConnection;
import com.example.PizzariaGraff.model.ItemNfe;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ItemNfeRepository {
    
    private final DatabaseConnection databaseConnection;
    
    public ItemNfeRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }
    
    public List<ItemNfe> findAll() {
        List<ItemNfe> itens = new ArrayList<>();
        String sql = "SELECT * FROM itemnfe ORDER BY id ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                itens.add(mapResultSetToItemNfe(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar itens de nota fiscal", e);
        }
        
        return itens;
    }
    
    public Optional<ItemNfe> findById(String id) {
        String sql = "SELECT * FROM itemnfe WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToItemNfe(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar item de nota fiscal por ID", e);
        }
        
        return Optional.empty();
    }
    
    public List<ItemNfe> findByNfeChaveAcesso(String chaveAcesso) {
        List<ItemNfe> itens = new ArrayList<>();
        String sql = "SELECT * FROM itemnfe WHERE chave_acesso_nfe = ? ORDER BY id ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, chaveAcesso);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                itens.add(mapResultSetToItemNfe(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar itens de nota fiscal por chave de acesso", e);
        }
        
        return itens;
    }
    
    public ItemNfe save(ItemNfe item) {
        if (item.getId() == null) {
            return insert(item);
        } else {
            return update(item);
        }
    }
    
    private ItemNfe insert(ItemNfe item) {
        String sql = "INSERT INTO itemnfe (id, chave_acesso_nfe, codigo_produto, quantidade, valor_unitario, valor_total) VALUES (?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, item.getId());
            stmt.setString(2, item.getNfe().getChaveAcesso());
            stmt.setString(3, item.getProduto().getCodigoBarras());
            stmt.setBigDecimal(4, item.getQuantidade());
            stmt.setBigDecimal(5, item.getValorUnitario());
            stmt.setBigDecimal(6, item.getValorTotal());
            
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir item de nota fiscal", e);
        }
        
        return item;
    }
    
    private ItemNfe update(ItemNfe item) {
        String sql = "UPDATE itemnfe SET chave_acesso_nfe = ?, codigo_produto = ?, quantidade = ?, valor_unitario = ?, valor_total = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, item.getNfe().getChaveAcesso());
            stmt.setString(2, item.getProduto().getCodigoBarras());
            stmt.setBigDecimal(3, item.getQuantidade());
            stmt.setBigDecimal(4, item.getValorUnitario());
            stmt.setBigDecimal(5, item.getValorTotal());
            stmt.setString(6, item.getId());
            
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar item de nota fiscal", e);
        }
        
        return item;
    }
    
    public void deleteById(String id) {
        String sql = "DELETE FROM itemnfe WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar item de nota fiscal", e);
        }
    }
    
    private ItemNfe mapResultSetToItemNfe(ResultSet rs) throws SQLException {
        ItemNfe item = new ItemNfe();
        item.setId(rs.getString("id"));
        // TODO: Carregar Nfe e Produto relacionados
        item.setQuantidade(rs.getBigDecimal("quantidade"));
        item.setValorUnitario(rs.getBigDecimal("valor_unitario"));
        item.setValorTotal(rs.getBigDecimal("valor_total"));
        return item;
    }
} 