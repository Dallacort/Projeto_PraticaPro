package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.FuncaoFuncionario;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FuncaoFuncionarioRepository {
    
    private final DatabaseConnection databaseConnection;
    
    public FuncaoFuncionarioRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }
    
    public List<FuncaoFuncionario> findAll() {
        List<FuncaoFuncionario> funcoes = new ArrayList<>();
        String sql = "SELECT * FROM funcao_funcionario ORDER BY descricao ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                funcoes.add(mapResultSetToFuncaoFuncionario(rs));
            }
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar funções de funcionário", e);
        }
        
        return funcoes;
    }
    
    public Optional<FuncaoFuncionario> findById(Long id) {
        String sql = "SELECT * FROM funcao_funcionario WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToFuncaoFuncionario(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar função de funcionário por ID", e);
        }
        
        return Optional.empty();
    }
    
    public List<FuncaoFuncionario> findByAtivo(Boolean ativo) {
        List<FuncaoFuncionario> funcoes = new ArrayList<>();
        String sql = "SELECT * FROM funcao_funcionario WHERE ativo = ? ORDER BY descricao ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setBoolean(1, ativo);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                funcoes.add(mapResultSetToFuncaoFuncionario(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar funções por status ativo", e);
        }
        
        return funcoes;
    }
    
    public FuncaoFuncionario save(FuncaoFuncionario funcao) {
        if (funcao.getId() == null) {
            return insert(funcao);
        } else {
            return update(funcao);
        }
    }
    
    private FuncaoFuncionario insert(FuncaoFuncionario funcao) {
        String sql = "INSERT INTO funcao_funcionario (descricao, salario_base, ativo, data_cadastro, ultima_modificacao) VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, funcao.getDescricao());
            stmt.setDouble(2, funcao.getSalarioBase() != null ? funcao.getSalarioBase() : 0.0);
            stmt.setBoolean(3, funcao.getAtivo() != null ? funcao.getAtivo() : true);
            stmt.setTimestamp(4, Timestamp.valueOf(now));
            stmt.setTimestamp(5, Timestamp.valueOf(now));
            
            stmt.executeUpdate();
            
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                funcao.setId(rs.getLong(1));
            }
            
            funcao.setDataCadastro(now);
            funcao.setUltimaModificacao(now);
            
            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir função de funcionário", e);
        }
        
        return funcao;
    }
    
    private FuncaoFuncionario update(FuncaoFuncionario funcao) {
        String sql = "UPDATE funcao_funcionario SET descricao = ?, salario_base = ?, ativo = ?, ultima_modificacao = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, funcao.getDescricao());
            stmt.setDouble(2, funcao.getSalarioBase() != null ? funcao.getSalarioBase() : 0.0);
            stmt.setBoolean(3, funcao.getAtivo() != null ? funcao.getAtivo() : true);
            stmt.setTimestamp(4, Timestamp.valueOf(now));
            stmt.setLong(5, funcao.getId());
            
            stmt.executeUpdate();
            
            funcao.setUltimaModificacao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar função de funcionário", e);
        }
        
        return funcao;
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM funcao_funcionario WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar função de funcionário", e);
        }
    }
    
    private FuncaoFuncionario mapResultSetToFuncaoFuncionario(ResultSet rs) throws SQLException {
        FuncaoFuncionario funcao = new FuncaoFuncionario();
        funcao.setId(rs.getLong("id"));
        funcao.setDescricao(rs.getString("descricao"));
        funcao.setSalarioBase(rs.getDouble("salario_base"));
        funcao.setAtivo(rs.getBoolean("ativo"));
        
        Timestamp dataCadastro = rs.getTimestamp("data_cadastro");
        if (dataCadastro != null) {
            funcao.setDataCadastro(dataCadastro.toLocalDateTime());
        }
        
        Timestamp ultimaModificacao = rs.getTimestamp("ultima_modificacao");
        if (ultimaModificacao != null) {
            funcao.setUltimaModificacao(ultimaModificacao.toLocalDateTime());
        }
        
        return funcao;
    }
} 