package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.repository.DatabaseConnection;
import com.example.PizzariaGraff.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ClienteRepository {

    @Autowired
    private DatabaseConnection databaseConnection;

    public List<Cliente> findAll() {
        List<Cliente> clientes = new ArrayList<>();
        String sql = "SELECT c.*, " +
                     "cid.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo, " +
                     "cp.id as condicao_pagamento_id_rel, cp.condicao_pagamento as condicao_pagamento_nome " +
                     "FROM cliente c " +
                     "LEFT JOIN cidade cid ON c.cidade_id = cid.id " +
                     "LEFT JOIN estado e ON cid.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "LEFT JOIN condicao_pagamento cp ON c.condicao_pagamento_id = cp.id " +
                     "ORDER BY c.cliente";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                clientes.add(mapResultSetToCliente(rs));
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
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo, " +
                     "cp.id as condicao_pagamento_id_rel, cp.condicao_pagamento as condicao_pagamento_nome " +
                     "FROM cliente c " +
                     "LEFT JOIN cidade cid ON c.cidade_id = cid.id " +
                     "LEFT JOIN estado e ON cid.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "LEFT JOIN condicao_pagamento cp ON c.condicao_pagamento_id = cp.id " +
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

    public List<Cliente> findByNomeContaining(String nome) {
        List<Cliente> clientes = new ArrayList<>();
        String sql = "SELECT c.*, " +
                     "cid.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo, " +
                     "cp.id as condicao_pagamento_id_rel, cp.condicao_pagamento as condicao_pagamento_nome " +
                     "FROM cliente c " +
                     "LEFT JOIN cidade cid ON c.cidade_id = cid.id " +
                     "LEFT JOIN estado e ON cid.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "LEFT JOIN condicao_pagamento cp ON c.condicao_pagamento_id = cp.id " +
                     "WHERE UPPER(c.cliente) LIKE UPPER(?) " +
                     "ORDER BY c.cliente";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, "%" + nome + "%");
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                clientes.add(mapResultSetToCliente(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar clientes por nome", e);
        }
        
        return clientes;
    }
    
    public Optional<Cliente> findByCpfCpnj(String cpfCpnj) {
        String sql = "SELECT c.*, " +
                     "cid.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo, " +
                     "cp.id as condicao_pagamento_id_rel, cp.condicao_pagamento as condicao_pagamento_nome " +
                     "FROM cliente c " +
                     "LEFT JOIN cidade cid ON c.cidade_id = cid.id " +
                     "LEFT JOIN estado e ON cid.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "LEFT JOIN condicao_pagamento cp ON c.condicao_pagamento_id = cp.id " +
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

    public Cliente save(Cliente cliente) {
        if (cliente.getId() == null) {
            return insert(cliente);
        } else {
            return update(cliente);
        }
    }

    public boolean existsById(Long id) {
        String sql = "SELECT 1 FROM cliente WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();
            
            return rs.next();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao verificar existência do cliente", e);
        }
    }

    public boolean existsByCpfCpnjAndNotId(String cpfCpnj, Long id) {
        String sql = "SELECT 1 FROM cliente WHERE cpf_cpnj = ? AND id != ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, cpfCpnj);
            stmt.setLong(2, id);
            ResultSet rs = stmt.executeQuery();
            
            return rs.next();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao verificar CPF/CNPJ duplicado", e);
        }
    }
    
    private Cliente insert(Cliente cliente) {
        String sql = "INSERT INTO cliente (cliente, apelido, bairro, cep, numero, endereco, cidade_id, " +
                     "complemento, limite_credito, nacionalidade_id, rg_inscricao_estadual, " +
                     "cpf_cpnj, data_nascimento, email, telefone, estado_civil, tipo, sexo, " +
                     "condicao_pagamento_id, observacao, ativo, data_criacao, data_alteracao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
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
            stmt.setBigDecimal(9, cliente.getLimiteCredito());
            stmt.setObject(10, cliente.getNacionalidadeId());
            stmt.setObject(11, cliente.getRgInscricaoEstadual());
            stmt.setString(12, cliente.getCpfCpnj());
            stmt.setDate(13, cliente.getDataNascimento() != null ? Date.valueOf(cliente.getDataNascimento()) : null);
            stmt.setString(14, cliente.getEmail());
            stmt.setString(15, cliente.getTelefone());
            stmt.setString(16, cliente.getEstadoCivil());
            stmt.setObject(17, cliente.getTipo());
            stmt.setString(18, cliente.getSexo());
            stmt.setObject(19, cliente.getCondicaoPagamentoId());
            stmt.setString(20, cliente.getObservacao());
            stmt.setBoolean(21, cliente.getAtivo() != null ? cliente.getAtivo() : true);
            stmt.setTimestamp(22, cliente.getDataCriacao() != null ? Timestamp.valueOf(cliente.getDataCriacao()) : Timestamp.valueOf(now));
            stmt.setTimestamp(23, cliente.getDataAlteracao() != null ? Timestamp.valueOf(cliente.getDataAlteracao()) : Timestamp.valueOf(now));
            
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
                     "endereco = ?, cidade_id = ?, complemento = ?, limite_credito = ?, " +
                     "nacionalidade_id = ?, rg_inscricao_estadual = ?, cpf_cpnj = ?, data_nascimento = ?, " +
                     "email = ?, telefone = ?, estado_civil = ?, tipo = ?, sexo = ?, " +
                     "condicao_pagamento_id = ?, observacao = ?, ativo = ?, data_alteracao = ? WHERE id = ?";
        
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
            stmt.setBigDecimal(9, cliente.getLimiteCredito());
            stmt.setObject(10, cliente.getNacionalidadeId());
            stmt.setObject(11, cliente.getRgInscricaoEstadual());
            stmt.setString(12, cliente.getCpfCpnj());
            stmt.setDate(13, cliente.getDataNascimento() != null ? Date.valueOf(cliente.getDataNascimento()) : null);
            stmt.setString(14, cliente.getEmail());
            stmt.setString(15, cliente.getTelefone());
            stmt.setString(16, cliente.getEstadoCivil());
            stmt.setObject(17, cliente.getTipo());
            stmt.setString(18, cliente.getSexo());
            stmt.setObject(19, cliente.getCondicaoPagamentoId());
            stmt.setString(20, cliente.getObservacao());
            stmt.setBoolean(21, cliente.getAtivo() != null ? cliente.getAtivo() : true);
            stmt.setTimestamp(22, Timestamp.valueOf(now));
            stmt.setLong(23, cliente.getId());

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
        cliente.setLimiteCredito(rs.getBigDecimal("limite_credito"));
        cliente.setNacionalidadeId(rs.getObject("nacionalidade_id", Long.class));
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
        cliente.setObservacao(rs.getString("observacao"));
        cliente.setAtivo(rs.getBoolean("ativo"));
        
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
            } catch (SQLException ignored) {
                // Se não conseguir carregar os dados relacionados, mantém apenas o ID
            }
            
            cliente.setCidade(cidade);
        }
        
        // Carregar a condição de pagamento associada
        Long condicaoPagamentoId = rs.getLong("condicao_pagamento_id");
        if (condicaoPagamentoId > 0) {
            CondicaoPagamento condicaoPagamento = new CondicaoPagamento();
            condicaoPagamento.setId(condicaoPagamentoId);
            
            try {
                String nomeCondicaoPagamento = rs.getString("condicao_pagamento_nome");
                if (nomeCondicaoPagamento != null) {
                    condicaoPagamento.setCondicaoPagamento(nomeCondicaoPagamento);
                }
            } catch (SQLException ignored) {
                // Se não conseguir carregar o nome, mantém apenas o ID
            }
            
            cliente.setCondicaoPagamento(condicaoPagamento);
        }
        
        return cliente;
    }
} 