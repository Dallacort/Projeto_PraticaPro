package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.repository.DatabaseConnection;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Funcionario;
import com.example.PizzariaGraff.model.FuncaoFuncionario;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FuncionarioRepository {

    private final DatabaseConnection databaseConnection;
    private final CidadeRepository cidadeRepository;
    private final FuncaoFuncionarioRepository funcaoFuncionarioRepository;
    
    public FuncionarioRepository(DatabaseConnection databaseConnection, CidadeRepository cidadeRepository, FuncaoFuncionarioRepository funcaoFuncionarioRepository) {
        this.databaseConnection = databaseConnection;
        this.cidadeRepository = cidadeRepository;
        this.funcaoFuncionarioRepository = funcaoFuncionarioRepository;
    }

    public List<Funcionario> findAll() {
        List<Funcionario> funcionarios = new ArrayList<>();
        String sql = "SELECT * FROM funcionario ORDER BY funcionario";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                funcionarios.add(mapResultSetToFuncionario(rs));
            }
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar funcionários", e);
        }
        
        return funcionarios;
    }

    public Optional<Funcionario> findById(Long id) {
        String sql = "SELECT * FROM funcionario WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToFuncionario(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar funcionário por ID", e);
        }
        
        return Optional.empty();
    }

    public List<Funcionario> findByFuncionario(String funcionario) {
        List<Funcionario> funcionarios = new ArrayList<>();
        String sql = "SELECT * FROM funcionario WHERE funcionario LIKE ? ORDER BY funcionario";
        String searchTerm = "%" + funcionario + "%";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, searchTerm);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                funcionarios.add(mapResultSetToFuncionario(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar funcionários por nome", e);
        }
        
        return funcionarios;
    }

    public List<Funcionario> findByCpfCpnj(String cpfCpnj) {
        List<Funcionario> funcionarios = new ArrayList<>();
        String sql = "SELECT * FROM funcionario WHERE cpf_cpnj LIKE ? ORDER BY funcionario";
        String searchTerm = "%" + cpfCpnj + "%";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, searchTerm);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                funcionarios.add(mapResultSetToFuncionario(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar funcionários por CPF/CNPJ", e);
        }
        
        return funcionarios;
    }

    public Optional<Funcionario> findByEmail(String email) {
        String sql = "SELECT * FROM funcionario WHERE email = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToFuncionario(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar funcionário por email", e);
        }
        
        return Optional.empty();
    }

    public List<Funcionario> findByFuncaoFuncionarioId(Long funcaoId) {
        List<Funcionario> funcionarios = new ArrayList<>();
        String sql = "SELECT * FROM funcionario WHERE funcao_funcionario_id = ? ORDER BY funcionario";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, funcaoId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                funcionarios.add(mapResultSetToFuncionario(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar funcionários por função", e);
        }
        
        return funcionarios;
    }

    public Funcionario save(Funcionario funcionario) {
        if (funcionario.getId() == null) {
            return insert(funcionario);
        } else {
            return update(funcionario);
        }
    }

    private Funcionario insert(Funcionario funcionario) {
        String sql = "INSERT INTO funcionario (funcionario, apelido, telefone, email, endereco, numero, " +
                     "complemento, bairro, cep, cidade_id, data_admissao, data_demissao, " +
                     "rg_inscricao_estadual, cnh, data_validade_cnh, sexo, observacao, estado_civil, " +
                     "id_brasileiro, salario, situacao, nacionalidade, data_nascimento, " +
                     "funcao_funcionario_id, cpf_cpnj, data_criacao, data_alteracao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, funcionario.getFuncionario());
            stmt.setString(2, funcionario.getApelido());
            stmt.setString(3, funcionario.getTelefone());
            stmt.setString(4, funcionario.getEmail());
            stmt.setString(5, funcionario.getEndereco());
            stmt.setString(6, funcionario.getNumero());
            stmt.setString(7, funcionario.getComplemento());
            stmt.setString(8, funcionario.getBairro());
            stmt.setString(9, funcionario.getCep());
            stmt.setObject(10, funcionario.getCidadeId());
            stmt.setDate(11, funcionario.getDataAdmissao() != null ? Date.valueOf(funcionario.getDataAdmissao()) : null);
            stmt.setDate(12, funcionario.getDataDemissao() != null ? Date.valueOf(funcionario.getDataDemissao()) : null);
            stmt.setString(13, funcionario.getRgInscricaoEstadual());
            stmt.setString(14, funcionario.getCnh());
            stmt.setDate(15, funcionario.getDataValidadeCnh() != null ? Date.valueOf(funcionario.getDataValidadeCnh()) : null);
            stmt.setObject(16, funcionario.getSexo());
            stmt.setString(17, funcionario.getObservacao());
            stmt.setObject(18, funcionario.getEstadoCivil());
            stmt.setObject(19, funcionario.getIdBrasileiro());
            stmt.setObject(20, funcionario.getSalario());
            stmt.setDate(21, funcionario.getSituacao() != null ? Date.valueOf(funcionario.getSituacao()) : null);
            stmt.setObject(22, funcionario.getNacionalidade());
            stmt.setObject(23, funcionario.getDataNascimento());
            stmt.setObject(24, funcionario.getFuncaoFuncionarioId());
            stmt.setString(25, funcionario.getCpfCpnj());
            stmt.setTimestamp(26, funcionario.getDataCriacao() != null ? Timestamp.valueOf(funcionario.getDataCriacao()) : Timestamp.valueOf(now));
            stmt.setTimestamp(27, funcionario.getDataAlteracao() != null ? Timestamp.valueOf(funcionario.getDataAlteracao()) : Timestamp.valueOf(now));
            
            stmt.executeUpdate();
            
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                funcionario.setId(rs.getLong(1));
            }
            
            if (funcionario.getDataCriacao() == null) {
                funcionario.setDataCriacao(now);
            }
            if (funcionario.getDataAlteracao() == null) {
                funcionario.setDataAlteracao(now);
            }
            
            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir funcionário", e);
        }
        
        return funcionario;
    }

    private Funcionario update(Funcionario funcionario) {
        String sql = "UPDATE funcionario SET funcionario = ?, apelido = ?, telefone = ?, email = ?, endereco = ?, " +
                     "numero = ?, complemento = ?, bairro = ?, cep = ?, cidade_id = ?, data_admissao = ?, " +
                     "data_demissao = ?, rg_inscricao_estadual = ?, cnh = ?, data_validade_cnh = ?, sexo = ?, " +
                     "observacao = ?, estado_civil = ?, id_brasileiro = ?, salario = ?, situacao = ?, " +
                     "nacionalidade = ?, data_nascimento = ?, funcao_funcionario_id = ?, cpf_cpnj = ?, " +
                     "data_alteracao = ? WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, funcionario.getFuncionario());
            stmt.setString(2, funcionario.getApelido());
            stmt.setString(3, funcionario.getTelefone());
            stmt.setString(4, funcionario.getEmail());
            stmt.setString(5, funcionario.getEndereco());
            stmt.setString(6, funcionario.getNumero());
            stmt.setString(7, funcionario.getComplemento());
            stmt.setString(8, funcionario.getBairro());
            stmt.setString(9, funcionario.getCep());
            stmt.setObject(10, funcionario.getCidadeId());
            stmt.setDate(11, funcionario.getDataAdmissao() != null ? Date.valueOf(funcionario.getDataAdmissao()) : null);
            stmt.setDate(12, funcionario.getDataDemissao() != null ? Date.valueOf(funcionario.getDataDemissao()) : null);
            stmt.setString(13, funcionario.getRgInscricaoEstadual());
            stmt.setString(14, funcionario.getCnh());
            stmt.setDate(15, funcionario.getDataValidadeCnh() != null ? Date.valueOf(funcionario.getDataValidadeCnh()) : null);
            stmt.setObject(16, funcionario.getSexo());
            stmt.setString(17, funcionario.getObservacao());
            stmt.setObject(18, funcionario.getEstadoCivil());
            stmt.setObject(19, funcionario.getIdBrasileiro());
            stmt.setObject(20, funcionario.getSalario());
            stmt.setDate(21, funcionario.getSituacao() != null ? Date.valueOf(funcionario.getSituacao()) : null);
            stmt.setObject(22, funcionario.getNacionalidade());
            stmt.setObject(23, funcionario.getDataNascimento());
            stmt.setObject(24, funcionario.getFuncaoFuncionarioId());
            stmt.setString(25, funcionario.getCpfCpnj());
            stmt.setTimestamp(26, Timestamp.valueOf(now));
            stmt.setLong(27, funcionario.getId());
            
            stmt.executeUpdate();
            
            funcionario.setDataAlteracao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar funcionário", e);
        }
        
        return funcionario;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM funcionario WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar funcionário", e);
        }
    }

    private Funcionario mapResultSetToFuncionario(ResultSet rs) throws SQLException {
        Funcionario funcionario = new Funcionario();
        funcionario.setId(rs.getLong("id"));
        funcionario.setFuncionario(rs.getString("funcionario"));
        funcionario.setApelido(rs.getString("apelido"));
        funcionario.setTelefone(rs.getString("telefone"));
        funcionario.setEmail(rs.getString("email"));
        funcionario.setEndereco(rs.getString("endereco"));
        funcionario.setNumero(rs.getString("numero"));
        funcionario.setComplemento(rs.getString("complemento"));
        funcionario.setBairro(rs.getString("bairro"));
        funcionario.setCep(rs.getString("cep"));
        funcionario.setCidadeId(rs.getObject("cidade_id", Long.class));
        funcionario.setRgInscricaoEstadual(rs.getString("rg_inscricao_estadual"));
        funcionario.setCnh(rs.getString("cnh"));
        funcionario.setSexo(rs.getObject("sexo", Integer.class));
        funcionario.setObservacao(rs.getString("observacao"));
        funcionario.setEstadoCivil(rs.getObject("estado_civil", Integer.class));
        funcionario.setIdBrasileiro(rs.getObject("id_brasileiro", Integer.class));
        funcionario.setSalario(rs.getObject("salario", Integer.class));
        funcionario.setNacionalidade(rs.getObject("nacionalidade", Integer.class));
        funcionario.setDataNascimento(rs.getObject("data_nascimento", Integer.class));
        funcionario.setFuncaoFuncionarioId(rs.getObject("funcao_funcionario_id", Long.class));
        funcionario.setCpfCpnj(rs.getString("cpf_cpnj"));
        
        Date dataAdmissao = rs.getDate("data_admissao");
        if (dataAdmissao != null) {
            funcionario.setDataAdmissao(dataAdmissao.toLocalDate());
        }
        
        Date dataDemissao = rs.getDate("data_demissao");
        if (dataDemissao != null) {
            funcionario.setDataDemissao(dataDemissao.toLocalDate());
        }
        
        Date dataValidadeCnh = rs.getDate("data_validade_cnh");
        if (dataValidadeCnh != null) {
            funcionario.setDataValidadeCnh(dataValidadeCnh.toLocalDate());
        }
        
        Date situacao = rs.getDate("situacao");
        if (situacao != null) {
            funcionario.setSituacao(situacao.toLocalDate());
        }
        
        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        if (dataCriacao != null) {
            funcionario.setDataCriacao(dataCriacao.toLocalDateTime());
        }
        
        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        if (dataAlteracao != null) {
            funcionario.setDataAlteracao(dataAlteracao.toLocalDateTime());
        }

        // Carregar a cidade se o ID estiver presente
        Long cidadeId = rs.getObject("cidade_id", Long.class);
        if (cidadeId != null) {
            try {
                Optional<Cidade> cidade = cidadeRepository.findById(cidadeId);
                cidade.ifPresent(funcionario::setCidade);
            } catch (Exception e) {
                System.err.println("Erro ao buscar cidade: " + e.getMessage());
            }
        }

        // Carregar a função do funcionário se o ID estiver presente
        Long funcaoId = rs.getObject("funcao_funcionario_id", Long.class);
        if (funcaoId != null) {
            try {
                Optional<FuncaoFuncionario> funcao = funcaoFuncionarioRepository.findById(funcaoId);
                funcao.ifPresent(funcionario::setFuncaoFuncionario);
            } catch (Exception e) {
                System.err.println("Erro ao buscar função: " + e.getMessage());
            }
        }

        return funcionario;
    }
} 