package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Funcionario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class FuncionarioRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private CidadeRepository cidadeRepository;
    
    public FuncionarioRepository() {
        // Chamar este método após a injeção completa das dependências
    }
    
    @Autowired
    public void init() {
    }
    
    

    public List<Funcionario> findAll() {
        String sql = "SELECT * FROM funcionario ORDER BY nome";
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapResultSetToFuncionario(rs));
    }

    public List<Funcionario> findAllAtivos() {
        String sql = "SELECT * FROM funcionario WHERE ativo = true ORDER BY nome";
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapResultSetToFuncionario(rs));
    }

    public Optional<Funcionario> findById(Long id) {
        String sql = "SELECT * FROM funcionario WHERE id = ?";
        List<Funcionario> funcionarios = jdbcTemplate.query(sql, new Object[]{id}, (rs, rowNum) -> mapResultSetToFuncionario(rs));
        return funcionarios.isEmpty() ? Optional.empty() : Optional.of(funcionarios.get(0));
    }

    public List<Funcionario> findByNome(String nome) {
        String sql = "SELECT * FROM funcionario WHERE nome LIKE ? ORDER BY nome";
        String searchTerm = "%" + nome + "%";
        return jdbcTemplate.query(sql, new Object[]{searchTerm}, (rs, rowNum) -> mapResultSetToFuncionario(rs));
    }

    public List<Funcionario> findByCpf(String cpf) {
        String sql = "SELECT * FROM funcionario WHERE cpf LIKE ? ORDER BY nome";
        String searchTerm = "%" + cpf + "%";
        return jdbcTemplate.query(sql, new Object[]{searchTerm}, (rs, rowNum) -> mapResultSetToFuncionario(rs));
    }

    public Optional<Funcionario> findByEmail(String email) {
        String sql = "SELECT * FROM funcionario WHERE email = ?";
        List<Funcionario> funcionarios = jdbcTemplate.query(sql, new Object[]{email}, (rs, rowNum) -> mapResultSetToFuncionario(rs));
        return funcionarios.isEmpty() ? Optional.empty() : Optional.of(funcionarios.get(0));
    }

    public Funcionario save(Funcionario funcionario) {
        if (funcionario.getId() == null) {
            return insert(funcionario);
        } else {
            return update(funcionario);
        }
    }

    private Funcionario insert(Funcionario funcionario) {
        LocalDateTime now = LocalDateTime.now();
        funcionario.setDataCadastro(now);
        funcionario.setUltimaModificacao(now);
        
        String sql = "INSERT INTO funcionario (nome, cpf, rg, data_nascimento, telefone, email, endereco, " +
                     "numero, complemento, bairro, cep, cidade_id, cargo, data_admissao, data_demissao, ativo, " +
                     "data_cadastro, ultima_modificacao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, funcionario.getNome());
            ps.setString(2, funcionario.getCpf());
            ps.setString(3, funcionario.getRg());
            ps.setObject(4, funcionario.getDataNascimento());
            ps.setString(5, funcionario.getTelefone());
            ps.setString(6, funcionario.getEmail());
            ps.setString(7, funcionario.getEndereco());
            ps.setString(8, funcionario.getNumero());
            ps.setString(9, funcionario.getComplemento());
            ps.setString(10, funcionario.getBairro());
            ps.setString(11, funcionario.getCep());
            ps.setObject(12, funcionario.getCidade() != null ? funcionario.getCidade().getId() : null);
            ps.setString(13, funcionario.getCargo());
            ps.setObject(14, funcionario.getDataAdmissao());
            ps.setObject(15, funcionario.getDataDemissao());
            ps.setBoolean(16, funcionario.getAtivo() != null ? funcionario.getAtivo() : true);
            ps.setTimestamp(17, Timestamp.valueOf(now));
            ps.setTimestamp(18, Timestamp.valueOf(now));
            return ps;
        }, keyHolder);

        funcionario.setId(keyHolder.getKey().longValue());
        return funcionario;
    }

    private Funcionario update(Funcionario funcionario) {
        LocalDateTime now = LocalDateTime.now();
        funcionario.setUltimaModificacao(now);
        
        String sql = "UPDATE funcionario SET nome = ?, cpf = ?, rg = ?, data_nascimento = ?, telefone = ?, " +
                     "email = ?, endereco = ?, numero = ?, complemento = ?, bairro = ?, cep = ?, cidade_id = ?, " +
                     "cargo = ?, data_admissao = ?, data_demissao = ?, ativo = ?, ultima_modificacao = ? WHERE id = ?";

        jdbcTemplate.update(sql,
            funcionario.getNome(),
            funcionario.getCpf(),
            funcionario.getRg(),
            funcionario.getDataNascimento(),
            funcionario.getTelefone(),
            funcionario.getEmail(),
            funcionario.getEndereco(),
            funcionario.getNumero(),
            funcionario.getComplemento(),
            funcionario.getBairro(),
            funcionario.getCep(),
            funcionario.getCidade() != null ? funcionario.getCidade().getId() : null,
            funcionario.getCargo(),
            funcionario.getDataAdmissao(),
            funcionario.getDataDemissao(),
            funcionario.getAtivo(),
            Timestamp.valueOf(now),
            funcionario.getId()
        );

        return funcionario;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM funcionario WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public void softDeleteById(Long id) {
        String sql = "UPDATE funcionario SET ativo = false WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    private Funcionario mapResultSetToFuncionario(ResultSet rs) throws SQLException {
        Funcionario funcionario = new Funcionario();
        funcionario.setId(rs.getLong("id"));
        funcionario.setNome(rs.getString("nome"));
        funcionario.setCpf(rs.getString("cpf"));
        funcionario.setRg(rs.getString("rg"));
        funcionario.setDataNascimento(rs.getDate("data_nascimento") != null ? rs.getDate("data_nascimento").toLocalDate() : null);
        funcionario.setTelefone(rs.getString("telefone"));
        funcionario.setEmail(rs.getString("email"));
        funcionario.setEndereco(rs.getString("endereco"));
        funcionario.setNumero(rs.getString("numero"));
        funcionario.setComplemento(rs.getString("complemento"));
        funcionario.setBairro(rs.getString("bairro"));
        funcionario.setCep(rs.getString("cep"));
        funcionario.setCargo(rs.getString("cargo"));
        funcionario.setDataAdmissao(rs.getDate("data_admissao") != null ? rs.getDate("data_admissao").toLocalDate() : null);
        funcionario.setDataDemissao(rs.getDate("data_demissao") != null ? rs.getDate("data_demissao").toLocalDate() : null);
        funcionario.setAtivo(rs.getBoolean("ativo"));
        
        // Carregar campos de data
        try {
            Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
            if (dataCadastroTimestamp != null) {
                funcionario.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
            }
            
            Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacaoTimestamp != null) {
                funcionario.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
            }
        } catch (SQLException e) {
            System.err.println("Erro ao carregar campos de data: " + e.getMessage());
        }

        // Carregar a cidade se o ID estiver presente
        Long cidadeId = rs.getObject("cidade_id", Long.class);
        if (cidadeId != null) {
            Optional<Cidade> cidade = cidadeRepository.findById(cidadeId);
            cidade.ifPresent(funcionario::setCidade);
        }

        return funcionario;
    }
} 