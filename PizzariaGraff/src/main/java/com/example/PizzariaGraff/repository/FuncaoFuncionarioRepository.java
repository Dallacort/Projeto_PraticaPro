package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.FuncaoFuncionario;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FuncaoFuncionarioRepository {
    
    private final DatabaseConnection databaseConnection;
    
    public FuncaoFuncionarioRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
        verificarEstruturaBanco();
    }

    private void verificarEstruturaBanco() {
        try (Connection conn = databaseConnection.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            
            String[] newColumns = {"funcao_funcionario", "requer_cnh", "carga_horaria", "observacao", "data_criacao", "data_alteracao"};
            
            for (String columnName : newColumns) {
                ResultSet columns = metaData.getColumns(null, null, "funcao_funcionario", columnName);
                if (!columns.next()) {
                    System.out.println("Aviso: Coluna '" + columnName + "' não encontrada na tabela funcao_funcionario. Execute o script de migração.");
                }
                columns.close();
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/criar estrutura do banco para funcao_funcionario: " + e.getMessage());
        }
    }
    
    public List<FuncaoFuncionario> findAll() {
        List<FuncaoFuncionario> funcoes = new ArrayList<>();
        String sql = "SELECT * FROM funcao_funcionario ORDER BY " +
                     "COALESCE(funcao_funcionario, descricao) ASC";
        
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
        String sql = "SELECT * FROM funcao_funcionario WHERE ativo = ? ORDER BY " +
                     "COALESCE(funcao_funcionario, descricao) ASC";
        
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

    public List<FuncaoFuncionario> findByAtivoTrue() {
        return findByAtivo(true);
    }
    
    public FuncaoFuncionario save(FuncaoFuncionario funcao) {
        if (funcao.getId() == null) {
            return insert(funcao);
        } else {
            return update(funcao);
        }
    }
    
    private FuncaoFuncionario insert(FuncaoFuncionario funcao) {
        String sql = "INSERT INTO funcao_funcionario (funcao_funcionario, requer_cnh, carga_horaria, " +
                     "descricao, observacao, ativo, data_criacao, data_alteracao, " +
                     "salario_base, data_cadastro, ultima_modificacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime now = LocalDateTime.now();
            
                stmt.setString(1, funcao.getFuncaoFuncionario());
                stmt.setBoolean(2, funcao.getRequerCNH() != null ? funcao.getRequerCNH() : false);
                stmt.setBigDecimal(3, funcao.getCargaHoraria());
                stmt.setString(4, funcao.getDescricao());
                stmt.setString(5, funcao.getObservacao());
            stmt.setBoolean(6, funcao.getAtivo() != null ? funcao.getAtivo() : true);
            stmt.setTimestamp(7, funcao.getDataCriacao() != null ? Timestamp.valueOf(funcao.getDataCriacao()) : Timestamp.valueOf(now));
            stmt.setTimestamp(8, funcao.getDataAlteracao() != null ? Timestamp.valueOf(funcao.getDataAlteracao()) : Timestamp.valueOf(now));
            
            // Campos legados
            stmt.setDouble(9, funcao.getSalarioBase() != null ? funcao.getSalarioBase() : 0.0);
            stmt.setTimestamp(10, funcao.getDataCadastro() != null ? Timestamp.valueOf(funcao.getDataCadastro()) : Timestamp.valueOf(now));
            stmt.setTimestamp(11, funcao.getUltimaModificacao() != null ? Timestamp.valueOf(funcao.getUltimaModificacao()) : Timestamp.valueOf(now));
                
                stmt.executeUpdate();
                
                ResultSet rs = stmt.getGeneratedKeys();
                if (rs.next()) {
                    funcao.setId(rs.getLong(1));
                }

            if (funcao.getDataCriacao() == null) {
                funcao.setDataCriacao(now);
            }
            if (funcao.getDataAlteracao() == null) {
                funcao.setDataAlteracao(now);
            }

            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir função funcionário", e);
        }
        
        return funcao;
    }
    
    private FuncaoFuncionario update(FuncaoFuncionario funcao) {
        String sql = "UPDATE funcao_funcionario SET funcao_funcionario = ?, requer_cnh = ?, " +
                     "carga_horaria = ?, descricao = ?, observacao = ?, ativo = ?, data_alteracao = ?, " +
                         "salario_base = ?, ultima_modificacao = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
        
            LocalDateTime now = LocalDateTime.now();
            
                stmt.setString(1, funcao.getFuncaoFuncionario());
                stmt.setBoolean(2, funcao.getRequerCNH() != null ? funcao.getRequerCNH() : false);
                stmt.setBigDecimal(3, funcao.getCargaHoraria());
                stmt.setString(4, funcao.getDescricao());
                stmt.setString(5, funcao.getObservacao());
            stmt.setBoolean(6, funcao.getAtivo() != null ? funcao.getAtivo() : true);
            stmt.setTimestamp(7, Timestamp.valueOf(now));
            
            // Campos legados
            stmt.setDouble(8, funcao.getSalarioBase() != null ? funcao.getSalarioBase() : 0.0);
            stmt.setTimestamp(9, Timestamp.valueOf(now));
            stmt.setLong(10, funcao.getId());
                
                stmt.executeUpdate();
            
            funcao.setDataAlteracao(now);
            funcao.setUltimaModificacao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar função funcionário", e);
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
        
        // Novos campos (com fallback)
        try {
            funcao.setFuncaoFuncionario(rs.getString("funcao_funcionario"));
        } catch (SQLException e) {
            // Campo não existe, usar descrição como fallback temporário
            // TODO: Este é um fallback temporário - deve ser migrado para usar campo correto
            funcao.setFuncaoFuncionario(rs.getString("descricao"));
        }
        
        try {
            funcao.setRequerCNH(rs.getBoolean("requer_cnh"));
        } catch (SQLException e) {
            funcao.setRequerCNH(false);
        }
        
        try {
            BigDecimal cargaHoraria = rs.getBigDecimal("carga_horaria");
            funcao.setCargaHoraria(cargaHoraria);
        } catch (SQLException e) {
            funcao.setCargaHoraria(null);
        }
        
        funcao.setDescricao(rs.getString("descricao"));
        
        try {
            funcao.setObservacao(rs.getString("observacao"));
        } catch (SQLException e) {
            funcao.setObservacao(null);
        }
        
        // Campos legados
        funcao.setSalarioBase(rs.getDouble("salario_base"));
        funcao.setAtivo(rs.getBoolean("ativo"));
        
        // Datas (com fallback)
        try {
            Timestamp dataCriacao = rs.getTimestamp("data_criacao");
            if (dataCriacao != null) {
                funcao.setDataCriacao(dataCriacao.toLocalDateTime());
            }
        } catch (SQLException e) {
            // Campo não existe, usar data_cadastro
            Timestamp dataCadastro = rs.getTimestamp("data_cadastro");
            if (dataCadastro != null) {
                funcao.setDataCriacao(dataCadastro.toLocalDateTime());
            }
        }
        
        try {
            Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
            if (dataAlteracao != null) {
                funcao.setDataAlteracao(dataAlteracao.toLocalDateTime());
            }
        } catch (SQLException e) {
            // Campo não existe, usar ultima_modificacao
            Timestamp ultimaModificacao = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacao != null) {
                funcao.setDataAlteracao(ultimaModificacao.toLocalDateTime());
            }
        }
        
        // Campos legados (com fallback se os novos campos não existirem)
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