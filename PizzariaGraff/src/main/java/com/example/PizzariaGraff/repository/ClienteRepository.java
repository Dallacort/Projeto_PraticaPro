package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.repository.DatabaseConnection;
import com.example.PizzariaGraff.model.Cliente;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Estado;
import com.example.PizzariaGraff.model.Pais;
import org.springframework.stereotype.Repository;

import java.sql.*;
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
        
        // Verificar se as colunas de data existem
        try (Connection conn = databaseConnection.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            
            // Verificar se a tabela existe
            boolean tabelaExiste = false;
            try (ResultSet rs = metaData.getTables(null, null, null, new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    System.out.println("Tabela encontrada: " + tableName);
                    if ("cliente".equalsIgnoreCase(tableName)) {
                        tabelaExiste = true;
                        break;
                    }
                }
            }
            
            if (tabelaExiste) {
                // Verificar se as colunas de data existem
                boolean temDataCadastro = false;
                boolean temUltimaModificacao = false;
                
                try (ResultSet colunas = metaData.getColumns(null, null, "cliente", null)) {
                    System.out.println("Verificando colunas da tabela cliente:");
                    while (colunas.next()) {
                        String colName = colunas.getString("COLUMN_NAME");
                        String colType = colunas.getString("TYPE_NAME");
                        System.out.println("  - Coluna: " + colName + ", Tipo: " + colType);
                        
                        if ("data_cadastro".equalsIgnoreCase(colName)) {
                            temDataCadastro = true;
                        } else if ("ultima_modificacao".equalsIgnoreCase(colName)) {
                            temUltimaModificacao = true;
                        }
                    }
                }
                
                if (!temDataCadastro || !temUltimaModificacao) {
                    System.out.println("Adicionando colunas de data à tabela cliente");
                    try (Statement stmt = conn.createStatement()) {
                        if (!temDataCadastro) {
                            stmt.execute("ALTER TABLE cliente ADD COLUMN data_cadastro TIMESTAMP");
                            System.out.println("Coluna data_cadastro adicionada à tabela cliente");
                        }
                        
                        if (!temUltimaModificacao) {
                            stmt.execute("ALTER TABLE cliente ADD COLUMN ultima_modificacao TIMESTAMP");
                            System.out.println("Coluna ultima_modificacao adicionada à tabela cliente");
                        }
                        
                        // Se adicionamos as colunas, atualizar registros existentes com a data atual
                        if (!temDataCadastro || !temUltimaModificacao) {
                            LocalDateTime now = LocalDateTime.now();
                            stmt.execute("UPDATE cliente SET " + 
                                        (!temDataCadastro ? "data_cadastro = '" + Timestamp.valueOf(now) + "'" : "") +
                                        (!temDataCadastro && !temUltimaModificacao ? ", " : "") +
                                        (!temUltimaModificacao ? "ultima_modificacao = '" + Timestamp.valueOf(now) + "'" : ""));
                            System.out.println("Registros existentes atualizados com datas");
                        }
                    }
                }
            } else {
                System.out.println("Tabela 'cliente' não existe, será criada quando necessário");
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/modificar estrutura da tabela cliente: " + e.getMessage());
            e.printStackTrace();
        }
        
        String sql = "SELECT c.*, " +
                     "cid.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM cliente c " +
                     "LEFT JOIN cidade cid ON c.cidade_id = cid.id " +
                     "LEFT JOIN estado e ON cid.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "ORDER BY c.nome ASC";
        
        System.out.println("ClienteRepository.findAll() - Executando SQL: " + sql);
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            System.out.println("ClienteRepository.findAll() - Query executada com sucesso");
            
            while (rs.next()) {
                Cliente cliente = mapResultSetToCliente(rs);
                System.out.println("ClienteRepository.findAll() - Cliente carregado: " + cliente.getNome() + 
                                 ", Data cadastro: " + cliente.getDataCadastro() + 
                                 ", Última modificação: " + cliente.getUltimaModificacao());
                clientes.add(cliente);
            }
            
            System.out.println("ClienteRepository.findAll() - " + clientes.size() + " clientes encontrados");
        } catch (SQLException e) {
            System.err.println("ClienteRepository.findAll() - Erro: " + e.getMessage());
            e.printStackTrace();
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
    
    public Optional<Cliente> findByCpf(String cpf) {
        String sql = "SELECT c.*, " +
                     "cid.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM cliente c " +
                     "LEFT JOIN cidade cid ON c.cidade_id = cid.id " +
                     "LEFT JOIN estado e ON cid.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE c.cpf = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, cpf);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToCliente(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar cliente por CPF", e);
        }
        
        return Optional.empty();
    }
    
    public Optional<Cliente> findByCnpj(String cnpj) {
        String sql = "SELECT c.*, " +
                     "cid.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM cliente c " +
                     "LEFT JOIN cidade cid ON c.cidade_id = cid.id " +
                     "LEFT JOIN estado e ON cid.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE c.cnpj = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, cnpj);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToCliente(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar cliente por CNPJ", e);
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
                     "WHERE c.cidade_id = ? " +
                     "ORDER BY c.nome ASC";
        
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
        String sql = "INSERT INTO cliente (nome, cpf, cnpj, email, telefone, endereco, numero, complemento, bairro, cep, cidade_id, ativo, data_cadastro, ultima_modificacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, cliente.getNome());
            stmt.setString(2, cliente.getCpf());
            stmt.setString(3, cliente.getCnpj());
            stmt.setString(4, cliente.getEmail());
            stmt.setString(5, cliente.getTelefone());
            stmt.setString(6, cliente.getEndereco());
            stmt.setString(7, cliente.getNumero());
            stmt.setString(8, cliente.getComplemento());
            stmt.setString(9, cliente.getBairro());
            stmt.setString(10, cliente.getCep());
            stmt.setLong(11, cliente.getCidade().getId());
            stmt.setBoolean(12, cliente.getAtivo());
            stmt.setTimestamp(13, Timestamp.valueOf(now));
            stmt.setTimestamp(14, Timestamp.valueOf(now));
            
            System.out.println("ClienteRepository.insert() - Inserindo cliente com data_cadastro: " + now);
            System.out.println("ClienteRepository.insert() - Inserindo cliente com ultima_modificacao: " + now);
            
            stmt.executeUpdate();
            
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                cliente.setId(rs.getLong(1));
            }
            
            // Atualiza o objeto após a inserção
            cliente.setDataCadastro(now);
            cliente.setUltimaModificacao(now);
            
            rs.close();
        } catch (SQLException e) {
            System.err.println("ClienteRepository.insert() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao inserir cliente", e);
        }
        
        return cliente;
    }
    
    private Cliente update(Cliente cliente) {
        String sql = "UPDATE cliente SET nome = ?, cpf = ?, cnpj = ?, email = ?, telefone = ?, endereco = ?, numero = ?, complemento = ?, bairro = ?, cep = ?, cidade_id = ?, ativo = ?, ultima_modificacao = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, cliente.getNome());
            stmt.setString(2, cliente.getCpf());
            stmt.setString(3, cliente.getCnpj());
            stmt.setString(4, cliente.getEmail());
            stmt.setString(5, cliente.getTelefone());
            stmt.setString(6, cliente.getEndereco());
            stmt.setString(7, cliente.getNumero());
            stmt.setString(8, cliente.getComplemento());
            stmt.setString(9, cliente.getBairro());
            stmt.setString(10, cliente.getCep());
            stmt.setLong(11, cliente.getCidade().getId());
            stmt.setBoolean(12, cliente.getAtivo());
            stmt.setTimestamp(13, Timestamp.valueOf(now));
            stmt.setLong(14, cliente.getId());
            
            System.out.println("ClienteRepository.update() - Atualizando cliente com ultima_modificacao: " + now);
            
            stmt.executeUpdate();
            
            // Atualiza o objeto após a atualização no banco
            cliente.setUltimaModificacao(now);
        } catch (SQLException e) {
            System.err.println("ClienteRepository.update() - Erro: " + e.getMessage());
            e.printStackTrace();
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
        cliente.setNome(rs.getString("nome"));
        cliente.setCpf(rs.getString("cpf"));
        cliente.setCnpj(rs.getString("cnpj"));
        cliente.setEmail(rs.getString("email"));
        cliente.setTelefone(rs.getString("telefone"));
        cliente.setEndereco(rs.getString("endereco"));
        cliente.setNumero(rs.getString("numero"));
        cliente.setComplemento(rs.getString("complemento"));
        cliente.setBairro(rs.getString("bairro"));
        cliente.setCep(rs.getString("cep"));
        cliente.setAtivo(rs.getBoolean("ativo"));
        
        try {
            Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
            if (dataCadastroTimestamp != null) {
                cliente.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
                System.out.println("ClienteRepository: Data de cadastro carregada: " + cliente.getDataCadastro());
            } else {
                System.out.println("ClienteRepository: Timestamp de data_cadastro é null");
            }
            
            Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
            if (ultimaModificacaoTimestamp != null) {
                cliente.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
                System.out.println("ClienteRepository: Última modificação carregada: " + cliente.getUltimaModificacao());
            } else {
                System.out.println("ClienteRepository: Timestamp de ultima_modificacao é null");
            }
        } catch (SQLException e) {
            System.err.println("Erro ao carregar colunas de data: " + e.getMessage());
        }
        
        // Carregar a cidade associada junto com estado e país
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
                    String paisId = rs.getString("estado_pais_id");
                    if (paisId != null && !paisId.isEmpty()) {
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