package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.repository.DatabaseConnection;
import com.example.PizzariaGraff.model.Cliente;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Estado;
import com.example.PizzariaGraff.model.Pais;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ClienteRepository {
    
    private final DatabaseConnection databaseConnection;
    private final CidadeRepository cidadeRepository;
    
    public ClienteRepository(DatabaseConnection databaseConnection, CidadeRepository cidadeRepository) {
        this.databaseConnection = databaseConnection;
        this.cidadeRepository = cidadeRepository;
    }
    
    public List<Cliente> findAll() {
        List<Cliente> clientes = new ArrayList<>();
        
        String sql = "SELECT c.*, " +
                     "cid.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM cliente c " +
                     "LEFT JOIN cidade cid ON c.cidade_id = cid.id " +
                     "LEFT JOIN estado e ON cid.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "ORDER BY c.cliente ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Cliente cliente = mapResultSetToCliente(rs);
                clientes.add(cliente);
            }
            
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar clientes", e);
        }
        
        return clientes;
    }
    
    public Optional<Cliente> findById(Long id) {
        String sql = "SELECT c.*, " +
                     "cid.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM cliente c " +
                     "LEFT JOIN cidade cid ON c.cidade_id = cid.id " +
                     "LEFT JOIN estado e ON cid.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE c.id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToCliente(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar cliente por ID", e);
        }
        
        return Optional.empty();
    }
    
    public Optional<Cliente> findByCpfCpnj(String cpfCpnj) {
        String sql = "SELECT c.*, " +
                     "cid.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM cliente c " +
                     "LEFT JOIN cidade cid ON c.cidade_id = cid.id " +
                     "LEFT JOIN estado e ON cid.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE c.cpf_cpnj = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, cpfCpnj);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToCliente(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar cliente por CPF/CNPJ", e);
        }
        
        return Optional.empty();
    }
    
    public List<Cliente> findByCidadeId(Long cidadeId) {
        List<Cliente> clientes = new ArrayList<>();
        String sql = "SELECT c.*, " +
                     "cid.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM cliente c " +
                     "LEFT JOIN cidade cid ON c.cidade_id = cid.id " +
                     "LEFT JOIN estado e ON cid.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE c.cidade_id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, cidadeId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                clientes.add(mapResultSetToCliente(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar clientes por cidade", e);
        }
        
        return clientes;
    }
    
    public Cliente save(Cliente cliente) {
        if (cliente.getId() == null) {
            return insert(cliente);
        } else {
            return update(cliente);
        }
    }
    
    private Cliente insert(Cliente cliente) {
        String sql = "INSERT INTO cliente (cliente, apelido, bairro, cep, numero, endereco, cidade_id, " +
                     "complemento, id_brasileiro, limite_credito, nacionalidade, rg_inscricao_estadual, " +
                     "cpf_cpnj, data_nascimento, email, telefone, estado_civil, tipo, sexo, " +
                     "condicao_pagamento_id, limite_credito2, observacao, situacao, data_criacao, data_alteracao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, cliente.getCliente());
            stmt.setString(2, cliente.getApelido());
            stmt.setString(3, cliente.getBairro());
            stmt.setString(4, cliente.getCep());
            stmt.setString(5, cliente.getNumero());
            stmt.setString(6, cliente.getEndereco());
            stmt.setObject(7, cliente.getCidadeId());
            stmt.setString(8, cliente.getComplemento());
            stmt.setObject(9, cliente.getIdBrasileiro());
            stmt.setBigDecimal(10, cliente.getLimiteCredito());
            stmt.setString(11, cliente.getNacionalidade());
            stmt.setString(12, cliente.getRgInscricaoEstadual());
            stmt.setString(13, cliente.getCpfCpnj());
            stmt.setDate(14, cliente.getDataNascimento() != null ? Date.valueOf(cliente.getDataNascimento()) : null);
            stmt.setString(15, cliente.getEmail());
            stmt.setString(16, cliente.getTelefone());
            stmt.setString(17, cliente.getEstadoCivil());
            stmt.setObject(18, cliente.getTipo());
            stmt.setString(19, cliente.getSexo());
            stmt.setObject(20, cliente.getCondicaoPagamentoId());
            stmt.setBigDecimal(21, cliente.getLimiteCredito2());
            stmt.setString(22, cliente.getObservacao());
            stmt.setDate(23, cliente.getSituacao() != null ? Date.valueOf(cliente.getSituacao()) : null);
            stmt.setTimestamp(24, cliente.getDataCriacao() != null ? Timestamp.valueOf(cliente.getDataCriacao()) : Timestamp.valueOf(now));
            stmt.setTimestamp(25, cliente.getDataAlteracao() != null ? Timestamp.valueOf(cliente.getDataAlteracao()) : Timestamp.valueOf(now));
            
            stmt.executeUpdate();
            
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                cliente.setId(rs.getLong(1));
            }
            
            if (cliente.getDataCriacao() == null) {
                cliente.setDataCriacao(now);
            }
            if (cliente.getDataAlteracao() == null) {
                cliente.setDataAlteracao(now);
            }
            
            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir cliente", e);
        }
        
        return cliente;
    }
    
    private Cliente update(Cliente cliente) {
        String sql = "UPDATE cliente SET cliente = ?, apelido = ?, bairro = ?, cep = ?, numero = ?, " +
                     "endereco = ?, cidade_id = ?, complemento = ?, id_brasileiro = ?, limite_credito = ?, " +
                     "nacionalidade = ?, rg_inscricao_estadual = ?, cpf_cpnj = ?, data_nascimento = ?, " +
                     "email = ?, telefone = ?, estado_civil = ?, tipo = ?, sexo = ?, " +
                     "condicao_pagamento_id = ?, limite_credito2 = ?, observacao = ?, situacao = ?, " +
                     "data_alteracao = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, cliente.getCliente());
            stmt.setString(2, cliente.getApelido());
            stmt.setString(3, cliente.getBairro());
            stmt.setString(4, cliente.getCep());
            stmt.setString(5, cliente.getNumero());
            stmt.setString(6, cliente.getEndereco());
            stmt.setObject(7, cliente.getCidadeId());
            stmt.setString(8, cliente.getComplemento());
            stmt.setObject(9, cliente.getIdBrasileiro());
            stmt.setBigDecimal(10, cliente.getLimiteCredito());
            stmt.setString(11, cliente.getNacionalidade());
            stmt.setString(12, cliente.getRgInscricaoEstadual());
            stmt.setString(13, cliente.getCpfCpnj());
            stmt.setDate(14, cliente.getDataNascimento() != null ? Date.valueOf(cliente.getDataNascimento()) : null);
            stmt.setString(15, cliente.getEmail());
            stmt.setString(16, cliente.getTelefone());
            stmt.setString(17, cliente.getEstadoCivil());
            stmt.setObject(18, cliente.getTipo());
            stmt.setString(19, cliente.getSexo());
            stmt.setObject(20, cliente.getCondicaoPagamentoId());
            stmt.setBigDecimal(21, cliente.getLimiteCredito2());
            stmt.setString(22, cliente.getObservacao());
            stmt.setDate(23, cliente.getSituacao() != null ? Date.valueOf(cliente.getSituacao()) : null);
            stmt.setTimestamp(24, Timestamp.valueOf(now));
            stmt.setLong(25, cliente.getId());
            
            stmt.executeUpdate();
            
            cliente.setDataAlteracao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar cliente", e);
        }
        
        return cliente;
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM cliente WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar cliente", e);
        }
    }
    
    private Cliente mapResultSetToCliente(ResultSet rs) throws SQLException {
        Cliente cliente = new Cliente();
        cliente.setId(rs.getLong("id"));
        cliente.setCliente(rs.getString("cliente"));
        cliente.setApelido(rs.getString("apelido"));
        cliente.setBairro(rs.getString("bairro"));
        cliente.setCep(rs.getString("cep"));
        cliente.setNumero(rs.getString("numero"));
        cliente.setEndereco(rs.getString("endereco"));
        cliente.setCidadeId(rs.getObject("cidade_id", Long.class));
        cliente.setComplemento(rs.getString("complemento"));
        cliente.setIdBrasileiro(rs.getObject("id_brasileiro", Integer.class));
        cliente.setLimiteCredito(rs.getBigDecimal("limite_credito"));
        cliente.setNacionalidade(rs.getString("nacionalidade"));
        cliente.setRgInscricaoEstadual(rs.getString("rg_inscricao_estadual"));
        cliente.setCpfCpnj(rs.getString("cpf_cpnj"));
        
        Date dataNascimento = rs.getDate("data_nascimento");
        if (dataNascimento != null) {
            cliente.setDataNascimento(dataNascimento.toLocalDate());
        }
        
        cliente.setEmail(rs.getString("email"));
        cliente.setTelefone(rs.getString("telefone"));
        cliente.setEstadoCivil(rs.getString("estado_civil"));
        cliente.setTipo(rs.getObject("tipo", Integer.class));
        cliente.setSexo(rs.getString("sexo"));
        cliente.setCondicaoPagamentoId(rs.getObject("condicao_pagamento_id", Long.class));
        cliente.setLimiteCredito2(rs.getBigDecimal("limite_credito2"));
        cliente.setObservacao(rs.getString("observacao"));
        
        Date situacao = rs.getDate("situacao");
        if (situacao != null) {
            cliente.setSituacao(situacao.toLocalDate());
        }
        
        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        if (dataCriacao != null) {
            cliente.setDataCriacao(dataCriacao.toLocalDateTime());
        }
        
        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        if (dataAlteracao != null) {
            cliente.setDataAlteracao(dataAlteracao.toLocalDateTime());
        }
        
        // Carregar a cidade associada
        Long cidadeId = rs.getLong("cidade_id");
        if (cidadeId > 0) {
            Cidade cidade = new Cidade();
            cidade.setId(cidadeId);
            
            try {
                cidade.setNome(rs.getString("cidade_nome"));
                
                // Carregar o estado associado à cidade
                Long estadoId = rs.getLong("estado_id");
                if (estadoId > 0) {
                    Estado estado = new Estado();
                    estado.setId(estadoId);
                    estado.setNome(rs.getString("estado_nome"));
                    estado.setUf(rs.getString("estado_uf"));
                    
                    // Carregar o país associado ao estado
                    Long paisId = rs.getLong("estado_pais_id");
                    if (paisId != null && paisId > 0) {
                        Pais pais = new Pais();
                        pais.setId(paisId);
                        pais.setNome(rs.getString("pais_nome"));
                        pais.setSigla(rs.getString("pais_sigla"));
                        pais.setCodigo(rs.getString("pais_codigo"));
                        estado.setPais(pais);
                    }
                    
                    cidade.setEstado(estado);
                }
            } catch (SQLException e) {
                // Se não conseguir obter as colunas do JOIN, buscar cidade do repositório
                try {
                    Optional<Cidade> cidadeOpt = cidadeRepository.findById(cidadeId);
                    if (cidadeOpt.isPresent()) {
                        cidade = cidadeOpt.get();
                    }
                } catch (Exception ex) {
                    System.err.println("Erro ao buscar cidade: " + ex.getMessage());
                }
            }
            
            cliente.setCidade(cidade);
        }
        
        return cliente;
    }
} 