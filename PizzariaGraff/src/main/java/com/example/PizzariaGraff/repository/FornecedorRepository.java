package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.Fornecedor;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FornecedorRepository {

    private final DatabaseConnection databaseConnection;

    public FornecedorRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public List<Fornecedor> findAll() {
        List<Fornecedor> fornecedores = new ArrayList<>();
        String sql = "SELECT * FROM fornecedor ORDER BY fornecedor";

        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                fornecedores.add(mapResultSetToFornecedor(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar fornecedores", e);
        }

        return fornecedores;
    }

    public Optional<Fornecedor> findById(Long id) {
        String sql = "SELECT * FROM fornecedor WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return Optional.of(mapResultSetToFornecedor(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar fornecedor por ID", e);
        }

        return Optional.empty();
    }

    public List<Fornecedor> findByFornecedor(String nome) {
        List<Fornecedor> fornecedores = new ArrayList<>();
        String sql = "SELECT * FROM fornecedor WHERE fornecedor LIKE ? ORDER BY fornecedor";
        String searchTerm = "%" + nome + "%";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, searchTerm);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                fornecedores.add(mapResultSetToFornecedor(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar fornecedores por nome", e);
        }

        return fornecedores;
    }

    public List<Fornecedor> findByCpfCnpj(String cpfCnpj) {
        List<Fornecedor> fornecedores = new ArrayList<>();
        String sql = "SELECT * FROM fornecedor WHERE cpf_cnpj = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cpfCnpj);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                fornecedores.add(mapResultSetToFornecedor(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar fornecedores por CPF/CNPJ", e);
        }

        return fornecedores;
    }

    public Fornecedor save(Fornecedor fornecedor) {
        if (fornecedor.getId() == null) {
            return insert(fornecedor);
        } else {
            return update(fornecedor);
        }
    }

    private Fornecedor insert(Fornecedor fornecedor) {
        String sql = "INSERT INTO fornecedor (fornecedor, apelido, bairro, cep, complemento, endereco, numero, " +
                     "cidade_id, rg_inscricao_estadual, cpf_cnpj, email, telefone, tipo, observacoes, " +
                     "condicao_pagamento_id, limite_credito, data_criacao, data_alteracao, " +
                     "ativo, nacionalidade_id, transportadora_id) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setString(1, fornecedor.getFornecedor());
            stmt.setString(2, fornecedor.getApelido());
            stmt.setString(3, fornecedor.getBairro());
            stmt.setString(4, fornecedor.getCep());
            stmt.setString(5, fornecedor.getComplemento());
            stmt.setString(6, fornecedor.getEndereco());
            stmt.setString(7, fornecedor.getNumero());
            stmt.setObject(8, fornecedor.getCidadeId());
            stmt.setObject(9, fornecedor.getRgInscricaoEstadual());
            stmt.setString(10, fornecedor.getCpfCnpj());
            stmt.setString(11, fornecedor.getEmail());
            stmt.setString(12, fornecedor.getTelefone());
            stmt.setInt(13, fornecedor.getTipo());
            stmt.setString(14, fornecedor.getObservacoes());
            stmt.setObject(15, fornecedor.getCondicaoPagamentoId());
            stmt.setBigDecimal(16, fornecedor.getLimiteCredito());
            stmt.setTimestamp(17, fornecedor.getDataCriacao() != null ? Timestamp.valueOf(fornecedor.getDataCriacao()) : Timestamp.valueOf(now));
            stmt.setTimestamp(18, fornecedor.getDataAlteracao() != null ? Timestamp.valueOf(fornecedor.getDataAlteracao()) : Timestamp.valueOf(now));
            stmt.setBoolean(19, fornecedor.getAtivo() != null ? fornecedor.getAtivo() : true);
            stmt.setObject(20, fornecedor.getNacionalidadeId());
            stmt.setObject(21, fornecedor.getTransportadoraId());

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                fornecedor.setId(rs.getLong(1));
            }

            if (fornecedor.getDataCriacao() == null) {
                fornecedor.setDataCriacao(now);
            }
            if (fornecedor.getDataAlteracao() == null) {
                fornecedor.setDataAlteracao(now);
            }

            rs.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao inserir fornecedor", e);
        }

        return fornecedor;
    }

    private Fornecedor update(Fornecedor fornecedor) {
        String sql = "UPDATE fornecedor SET fornecedor = ?, apelido = ?, bairro = ?, cep = ?, complemento = ?, " +
                     "endereco = ?, numero = ?, cidade_id = ?, rg_inscricao_estadual = ?, cpf_cnpj = ?, " +
                     "email = ?, telefone = ?, tipo = ?, observacoes = ?, condicao_pagamento_id = ?, " +
                     "limite_credito = ?, data_alteracao = ?, ativo = ?, nacionalidade_id = ?, " +
                     "transportadora_id = ? WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            LocalDateTime now = LocalDateTime.now();

            stmt.setString(1, fornecedor.getFornecedor());
            stmt.setString(2, fornecedor.getApelido());
            stmt.setString(3, fornecedor.getBairro());
            stmt.setString(4, fornecedor.getCep());
            stmt.setString(5, fornecedor.getComplemento());
            stmt.setString(6, fornecedor.getEndereco());
            stmt.setString(7, fornecedor.getNumero());
            stmt.setObject(8, fornecedor.getCidadeId());
            stmt.setObject(9, fornecedor.getRgInscricaoEstadual());
            stmt.setString(10, fornecedor.getCpfCnpj());
            stmt.setString(11, fornecedor.getEmail());
            stmt.setString(12, fornecedor.getTelefone());
            stmt.setInt(13, fornecedor.getTipo());
            stmt.setString(14, fornecedor.getObservacoes());
            stmt.setObject(15, fornecedor.getCondicaoPagamentoId());
            stmt.setBigDecimal(16, fornecedor.getLimiteCredito());
            stmt.setTimestamp(17, Timestamp.valueOf(now));
            stmt.setBoolean(18, fornecedor.getAtivo() != null ? fornecedor.getAtivo() : true);
            stmt.setObject(19, fornecedor.getNacionalidadeId());
            stmt.setObject(20, fornecedor.getTransportadoraId());
            stmt.setLong(21, fornecedor.getId());

            stmt.executeUpdate();

            fornecedor.setDataAlteracao(now);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar fornecedor", e);
        }

        return fornecedor;
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM fornecedor WHERE id = ?";

        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar fornecedor", e);
        }
    }

    private Fornecedor mapResultSetToFornecedor(ResultSet rs) throws SQLException {
        Fornecedor fornecedor = new Fornecedor();
        fornecedor.setId(rs.getLong("id"));
        fornecedor.setFornecedor(rs.getString("fornecedor"));
        fornecedor.setApelido(rs.getString("apelido"));
        fornecedor.setBairro(rs.getString("bairro"));
        fornecedor.setCep(rs.getString("cep"));
        fornecedor.setComplemento(rs.getString("complemento"));
        fornecedor.setEndereco(rs.getString("endereco"));
        fornecedor.setNumero(rs.getString("numero"));
        fornecedor.setCidadeId(rs.getObject("cidade_id", Long.class));
        fornecedor.setRgInscricaoEstadual(rs.getString("rg_inscricao_estadual"));
        fornecedor.setCpfCnpj(rs.getString("cpf_cnpj"));
        fornecedor.setEmail(rs.getString("email"));
        fornecedor.setTelefone(rs.getString("telefone"));
        fornecedor.setTipo(rs.getInt("tipo"));
        fornecedor.setObservacoes(rs.getString("observacoes"));
        fornecedor.setCondicaoPagamentoId(rs.getObject("condicao_pagamento_id", Long.class));
        fornecedor.setLimiteCredito(rs.getBigDecimal("limite_credito"));

        // Carregar campo ativo do banco
        fornecedor.setAtivo(rs.getBoolean("ativo"));

        Timestamp dataCriacao = rs.getTimestamp("data_criacao");
        if (dataCriacao != null) {
            fornecedor.setDataCriacao(dataCriacao.toLocalDateTime());
        }

        Timestamp dataAlteracao = rs.getTimestamp("data_alteracao");
        if (dataAlteracao != null) {
            fornecedor.setDataAlteracao(dataAlteracao.toLocalDateTime());
        }

        fornecedor.setNacionalidadeId(rs.getObject("nacionalidade_id", Long.class));
        fornecedor.setTransportadoraId(rs.getObject("transportadora_id", Long.class));

        return fornecedor;
    }
} 