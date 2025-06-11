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
            
            // Verificar se as novas colunas existem
            String[] newColumns = {"funcao_funcionario", "requer_cnh", "carga_horaria", "observacao", "situacao", "data_criacao", "data_alteracao"};
            
            for (String columnName : newColumns) {
                ResultSet columns = metaData.getColumns(null, null, "funcao_funcionario", columnName);
                if (!columns.next()) {
                    System.out.println("Aviso: Coluna '" + columnName + "' não encontrada na tabela funcao_funcionario. Execute o script de migração.");
                }
                columns.close();
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar estrutura do banco para funcao_funcionario: " + e.getMessage());
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
        // Tentar inserção com novos campos primeiro
        String sqlNovo = "INSERT INTO funcao_funcionario (funcao_funcionario, requer_cnh, carga_horaria, " +
                         "descricao, observacao, situacao, ativo, data_criacao, data_alteracao, " +
                         "salario_base, data_cadastro, ultima_modificacao) " +
                         "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        // Fallback para estrutura antiga
        String sqlLegado = "INSERT INTO funcao_funcionario (descricao, salario_base, ativo, data_cadastro, ultima_modificacao) " +
                          "VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection()) {
            LocalDateTime now = LocalDateTime.now();
            
            try (PreparedStatement stmt = conn.prepareStatement(sqlNovo, Statement.RETURN_GENERATED_KEYS)) {
                // Tentar com estrutura nova
                stmt.setString(1, funcao.getFuncaoFuncionario());
                stmt.setBoolean(2, funcao.getRequerCNH() != null ? funcao.getRequerCNH() : false);
                stmt.setBigDecimal(3, funcao.getCargaHoraria());
                stmt.setString(4, funcao.getDescricao());
                stmt.setString(5, funcao.getObservacao());
                stmt.setDate(6, funcao.getSituacao() != null ? Date.valueOf(funcao.getSituacao()) : null);
                stmt.setBoolean(7, funcao.getAtivo() != null ? funcao.getAtivo() : true);
                stmt.setTimestamp(8, funcao.getDataCriacao() != null ? Timestamp.valueOf(funcao.getDataCriacao()) : Timestamp.valueOf(now));
                stmt.setTimestamp(9, funcao.getDataAlteracao() != null ? Timestamp.valueOf(funcao.getDataAlteracao()) : Timestamp.valueOf(now));
                stmt.setDouble(10, funcao.getSalarioBase() != null ? funcao.getSalarioBase() : 0.0);
                stmt.setTimestamp(11, funcao.getDataCadastro() != null ? Timestamp.valueOf(funcao.getDataCadastro()) : Timestamp.valueOf(now));
                stmt.setTimestamp(12, funcao.getUltimaModificacao() != null ? Timestamp.valueOf(funcao.getUltimaModificacao()) : Timestamp.valueOf(now));
                
                stmt.executeUpdate();
                
                ResultSet rs = stmt.getGeneratedKeys();
                if (rs.next()) {
                    funcao.setId(rs.getLong(1));
                }
                rs.close();
                
            } catch (SQLException e) {
                // Fallback para estrutura antiga
                System.out.println("Usando estrutura legada para inserção: " + e.getMessage());
                try (PreparedStatement stmtLegado = conn.prepareStatement(sqlLegado, Statement.RETURN_GENERATED_KEYS)) {
                    stmtLegado.setString(1, funcao.getDescricao());
                    stmtLegado.setDouble(2, funcao.getSalarioBase() != null ? funcao.getSalarioBase() : 0.0);
                    stmtLegado.setBoolean(3, funcao.getAtivo() != null ? funcao.getAtivo() : true);
                    stmtLegado.setTimestamp(4, Timestamp.valueOf(now));
                    stmtLegado.setTimestamp(5, Timestamp.valueOf(now));
                    
                    stmtLegado.executeUpdate();
                    
                    ResultSet rs = stmtLegado.getGeneratedKeys();
                    if (rs.next()) {
                        funcao.setId(rs.getLong(1));
                    }
                    rs.close();
                }
            }
            
            // Atualizar campos de data se não foram definidos
            if (funcao.getDataCriacao() == null) {
                funcao.setDataCriacao(now);
            }
            if (funcao.getDataAlteracao() == null) {
                funcao.setDataAlteracao(now);
            }
            if (funcao.getDataCadastro() == null) {
                funcao.setDataCadastro(now);
            }
            if (funcao.getUltimaModificacao() == null) {
                funcao.setUltimaModificacao(now);
            }
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir função de funcionário", e);
        }
        
        return funcao;
    }
    
    private FuncaoFuncionario update(FuncaoFuncionario funcao) {
        // Tentar atualização com novos campos
        String sqlNovo = "UPDATE funcao_funcionario SET funcao_funcionario = ?, requer_cnh = ?, carga_horaria = ?, " +
                         "descricao = ?, observacao = ?, situacao = ?, ativo = ?, data_alteracao = ?, " +
                         "salario_base = ?, ultima_modificacao = ? WHERE id = ?";
        
        // Fallback para estrutura antiga
        String sqlLegado = "UPDATE funcao_funcionario SET descricao = ?, salario_base = ?, ativo = ?, ultima_modificacao = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection()) {
            LocalDateTime now = LocalDateTime.now();
            
            try (PreparedStatement stmt = conn.prepareStatement(sqlNovo)) {
                // Tentar com estrutura nova
                stmt.setString(1, funcao.getFuncaoFuncionario());
                stmt.setBoolean(2, funcao.getRequerCNH() != null ? funcao.getRequerCNH() : false);
                stmt.setBigDecimal(3, funcao.getCargaHoraria());
                stmt.setString(4, funcao.getDescricao());
                stmt.setString(5, funcao.getObservacao());
                stmt.setDate(6, funcao.getSituacao() != null ? Date.valueOf(funcao.getSituacao()) : null);
                stmt.setBoolean(7, funcao.getAtivo() != null ? funcao.getAtivo() : true);
                stmt.setTimestamp(8, Timestamp.valueOf(now));
                stmt.setDouble(9, funcao.getSalarioBase() != null ? funcao.getSalarioBase() : 0.0);
                stmt.setTimestamp(10, Timestamp.valueOf(now));
                stmt.setLong(11, funcao.getId());
                
                stmt.executeUpdate();
                
            } catch (SQLException e) {
                // Fallback para estrutura antiga
                System.out.println("Usando estrutura legada para atualização: " + e.getMessage());
                try (PreparedStatement stmtLegado = conn.prepareStatement(sqlLegado)) {
                    stmtLegado.setString(1, funcao.getDescricao());
                    stmtLegado.setDouble(2, funcao.getSalarioBase() != null ? funcao.getSalarioBase() : 0.0);
                    stmtLegado.setBoolean(3, funcao.getAtivo() != null ? funcao.getAtivo() : true);
                    stmtLegado.setTimestamp(4, Timestamp.valueOf(now));
                    stmtLegado.setLong(5, funcao.getId());
                    
                    stmtLegado.executeUpdate();
                }
            }
            
            funcao.setDataAlteracao(now);
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
        
        // Novos campos (com fallback)
        try {
            funcao.setFuncaoFuncionario(rs.getString("funcao_funcionario"));
        } catch (SQLException e) {
            // Campo não existe, usar descrição como fallback
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
        
        try {
            Date situacao = rs.getDate("situacao");
            if (situacao != null) {
                funcao.setSituacao(situacao.toLocalDate());
            }
        } catch (SQLException e) {
            funcao.setSituacao(null);
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
            // Usar data_cadastro como fallback
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
            // Usar ultima_modificacao como fallback
            Timestamp ultimaModificacao = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacao != null) {
                funcao.setDataAlteracao(ultimaModificacao.toLocalDateTime());
            }
        }
        
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