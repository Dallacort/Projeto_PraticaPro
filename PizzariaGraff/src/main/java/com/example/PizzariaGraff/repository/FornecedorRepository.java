package com.example.PizzariaGraff.repository;

import com.example.PizzariaGraff.model.Fornecedor;
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
public class FornecedorRepository {
    
    private final DatabaseConnection databaseConnection;
    private final CidadeRepository cidadeRepository;
    
    public FornecedorRepository(DatabaseConnection databaseConnection, CidadeRepository cidadeRepository) {
        this.databaseConnection = databaseConnection;
        this.cidadeRepository = cidadeRepository;
    }
    
    public List<Fornecedor> findAll() {
        List<Fornecedor> fornecedores = new ArrayList<>();
        
        // Verificar se as colunas de data existem
        try (Connection conn = databaseConnection.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            
            // Verificar se a tabela existe
            boolean tabelaExiste = false;
            try (ResultSet rs = metaData.getTables(null, null, null, new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    System.out.println("Tabela encontrada: " + tableName);
                    if ("fornecedores".equalsIgnoreCase(tableName)) {
                        tabelaExiste = true;
                        break;
                    }
                }
            }
            
            if (tabelaExiste) {
                // Verificar se as colunas de data existem
                boolean temDataCadastro = false;
                boolean temUltimaModificacao = false;
                
                try (ResultSet colunas = metaData.getColumns(null, null, "fornecedores", null)) {
                    System.out.println("Verificando colunas da tabela fornecedores:");
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
                    System.out.println("Adicionando colunas de data à tabela fornecedores");
                    try (Statement stmt = conn.createStatement()) {
                        if (!temDataCadastro) {
                            stmt.execute("ALTER TABLE fornecedores ADD COLUMN data_cadastro TIMESTAMP");
                            System.out.println("Coluna data_cadastro adicionada à tabela fornecedores");
                        }
                        
                        if (!temUltimaModificacao) {
                            stmt.execute("ALTER TABLE fornecedores ADD COLUMN ultima_modificacao TIMESTAMP");
                            System.out.println("Coluna ultima_modificacao adicionada à tabela fornecedores");
                        }
                        
                        // Se adicionamos as colunas, atualizar registros existentes com a data atual
                        if (!temDataCadastro || !temUltimaModificacao) {
                            LocalDateTime now = LocalDateTime.now();
                            stmt.execute("UPDATE fornecedores SET " + 
                                        (!temDataCadastro ? "data_cadastro = '" + Timestamp.valueOf(now) + "'" : "") +
                                        (!temDataCadastro && !temUltimaModificacao ? ", " : "") +
                                        (!temUltimaModificacao ? "ultima_modificacao = '" + Timestamp.valueOf(now) + "'" : ""));
                            System.out.println("Registros existentes atualizados com datas");
                        }
                    }
                }
            } else {
                System.out.println("Tabela 'fornecedores' não existe, será criada quando necessário");
            }
        } catch (SQLException e) {
            System.err.println("Erro ao verificar/modificar estrutura da tabela fornecedores: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Consulta simplificada sem JOINs para diagnosticar o problema
        String sql = "SELECT * FROM fornecedores ORDER BY razao_social ASC";
        
        System.out.println("FornecedorRepository.findAll() - Executando SQL: " + sql);
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            System.out.println("FornecedorRepository.findAll() - Query executada com sucesso");
            
            int count = 0;
            while (rs.next()) {
                try {
                    Fornecedor fornecedor = new Fornecedor();
                    fornecedor.setId(rs.getLong("id"));
                    fornecedor.setRazaoSocial(rs.getString("razao_social"));
                    fornecedor.setNomeFantasia(rs.getString("nome_fantasia"));
                    fornecedor.setCnpj(rs.getString("cnpj"));
                    fornecedor.setEmail(rs.getString("email"));
                    fornecedor.setTelefone(rs.getString("telefone"));
                    fornecedor.setEndereco(rs.getString("endereco"));
                    fornecedor.setNumero(rs.getString("numero"));
                    fornecedor.setComplemento(rs.getString("complemento"));
                    fornecedor.setBairro(rs.getString("bairro"));
                    fornecedor.setCep(rs.getString("cep"));
                    fornecedor.setAtivo(rs.getBoolean("ativo"));
                    
                    // Carregar datas
                    try {
                        Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
                        if (dataCadastroTimestamp != null) {
                            fornecedor.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
                            System.out.println("Data de cadastro carregada: " + fornecedor.getDataCadastro());
                        } else {
                            System.out.println("Timestamp de data_cadastro é null");
                        }
                        
                        Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
                        if (ultimaModificacaoTimestamp != null) {
                            fornecedor.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
                            System.out.println("Última modificação carregada: " + fornecedor.getUltimaModificacao());
                        } else {
                            System.out.println("Timestamp de ultima_modificacao é null");
                        }
                    } catch (SQLException e) {
                        System.err.println("Erro ao carregar datas: " + e.getMessage());
                    }
                    
                    // Carregar a cidade usando o cidadeRepository
                    try {
                        Long cidadeId = rs.getLong("cidade_id");
                        if (cidadeId > 0) {
                            Optional<Cidade> cidadeOpt = cidadeRepository.findById(cidadeId);
                            if (cidadeOpt.isPresent()) {
                                fornecedor.setCidade(cidadeOpt.get());
                            }
                        }
                    } catch (SQLException e) {
                        System.err.println("Erro ao carregar cidade do fornecedor: " + e.getMessage());
                    }
                    
                    fornecedores.add(fornecedor);
                    count++;
                    System.out.println("Fornecedor adicionado: ID=" + fornecedor.getId() + 
                                       ", Razão Social=" + fornecedor.getRazaoSocial() + 
                                       ", Data cadastro=" + fornecedor.getDataCadastro() + 
                                       ", Última modificação=" + fornecedor.getUltimaModificacao());
                } catch (Exception e) {
                    System.err.println("Erro ao mapear fornecedor do ResultSet: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            System.out.println("FornecedorRepository.findAll() - " + count + " fornecedores encontrados");
        } catch (SQLException e) {
            System.err.println("FornecedorRepository.findAll() - Erro SQL: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("Causa: " + e.getCause().getMessage());
            }
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar fornecedores", e);
        } catch (Exception e) {
            System.err.println("FornecedorRepository.findAll() - Erro geral: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar fornecedores", e);
        }
        
        return fornecedores;
    }
    
    public List<Fornecedor> findByAtivoTrue() {
        List<Fornecedor> fornecedores = new ArrayList<>();
        String sql = "SELECT f.*, " +
                     "c.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM fornecedores f " +
                     "LEFT JOIN cidade c ON f.cidade_id = c.id " +
                     "LEFT JOIN estado e ON c.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE f.ativo = true " +
                     "ORDER BY f.razao_social ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                fornecedores.add(mapResultSetToFornecedor(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar fornecedores ativos", e);
        }
        
        return fornecedores;
    }
    
    public List<Fornecedor> findByNomeContainingIgnoreCase(String nome) {
        List<Fornecedor> fornecedores = new ArrayList<>();
        String sql = "SELECT f.*, " +
                     "c.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM fornecedores f " +
                     "LEFT JOIN cidade c ON f.cidade_id = c.id " +
                     "LEFT JOIN estado e ON c.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE LOWER(f.razao_social) LIKE LOWER(?) " +
                     "ORDER BY f.razao_social ASC";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, "%" + nome + "%");
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                fornecedores.add(mapResultSetToFornecedor(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar fornecedores por nome", e);
        }
        
        return fornecedores;
    }
    
    public Optional<Fornecedor> findById(Long id) {
        String sql = "SELECT f.*, " +
                     "c.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM fornecedores f " +
                     "LEFT JOIN cidade c ON f.cidade_id = c.id " +
                     "LEFT JOIN estado e ON c.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE f.id = ?";
        
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
    
    public Optional<Fornecedor> findByCnpj(String cnpj) {
        String sql = "SELECT f.*, " +
                     "c.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM fornecedores f " +
                     "LEFT JOIN cidade c ON f.cidade_id = c.id " +
                     "LEFT JOIN estado e ON c.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE f.cnpj = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, cnpj);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToFornecedor(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar fornecedor por CNPJ", e);
        }
        
        return Optional.empty();
    }
    
    public Optional<Fornecedor> findByEmail(String email) {
        String sql = "SELECT f.*, " +
                     "c.nome as cidade_nome, " +
                     "e.id as estado_id, e.nome as estado_nome, e.uf as estado_uf, e.pais_id as estado_pais_id, " +
                     "p.nome as pais_nome, p.sigla as pais_sigla, p.codigo as pais_codigo " +
                     "FROM fornecedores f " +
                     "LEFT JOIN cidade c ON f.cidade_id = c.id " +
                     "LEFT JOIN estado e ON c.estado_id = e.id " +
                     "LEFT JOIN pais p ON e.pais_id = p.id " +
                     "WHERE f.email = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToFornecedor(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar fornecedor por email", e);
        }
        
        return Optional.empty();
    }
    
    public boolean existsByCnpj(String cnpj) {
        String sql = "SELECT COUNT(*) FROM fornecedores f WHERE f.cnpj = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, cnpj);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao verificar existência de fornecedor por CNPJ", e);
        }
        
        return false;
    }
    
    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM fornecedores f WHERE f.email = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao verificar existência de fornecedor por email", e);
        }
        
        return false;
    }
    
    public Fornecedor save(Fornecedor fornecedor) {
        if (fornecedor.getId() == null) {
            return insert(fornecedor);
        } else {
            return update(fornecedor);
        }
    }
    
    private Fornecedor insert(Fornecedor fornecedor) {
        System.out.println("FornecedorRepository.insert() - Iniciando inserção de fornecedor no banco de dados");
        System.out.println("Dados do fornecedor a ser inserido:");
        System.out.println("- Razão Social: " + fornecedor.getRazaoSocial());
        System.out.println("- Nome Fantasia: " + fornecedor.getNomeFantasia());
        System.out.println("- CNPJ: " + fornecedor.getCnpj());
        System.out.println("- Email: " + fornecedor.getEmail());
        System.out.println("- Cidade: " + (fornecedor.getCidade() != null ? 
                           "ID=" + fornecedor.getCidade().getId() + ", Nome=" + fornecedor.getCidade().getNome() : "null"));
        
        String sql = "INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, email, telefone, endereco, " +
                     "numero, complemento, bairro, cep, cidade_id, ativo, data_cadastro, ultima_modificacao) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        System.out.println("SQL para inserção: " + sql);
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            System.out.println("Conexão com o banco de dados estabelecida");
            
            // Verificação de campos obrigatórios
            if (fornecedor.getRazaoSocial() == null || fornecedor.getRazaoSocial().trim().isEmpty()) {
                throw new SQLException("Razão social é um campo obrigatório");
            }
            
            if (fornecedor.getCnpj() == null || fornecedor.getCnpj().trim().isEmpty()) {
                throw new SQLException("CNPJ é um campo obrigatório");
            }
            
            if (fornecedor.getCidade() == null || fornecedor.getCidade().getId() == null) {
                throw new SQLException("Cidade é um campo obrigatório");
            }
            
            LocalDateTime now = LocalDateTime.now();
            
            // Preparando statement com valores dos campos
            stmt.setString(1, fornecedor.getRazaoSocial());
            stmt.setString(2, fornecedor.getNomeFantasia());
            stmt.setString(3, fornecedor.getCnpj());
            stmt.setString(4, fornecedor.getEmail());
            stmt.setString(5, fornecedor.getTelefone());
            stmt.setString(6, fornecedor.getEndereco());
            stmt.setString(7, fornecedor.getNumero());
            stmt.setString(8, fornecedor.getComplemento());
            stmt.setString(9, fornecedor.getBairro());
            stmt.setString(10, fornecedor.getCep());
            
            // Tratamento especial para cidade_id
            if (fornecedor.getCidade() != null && fornecedor.getCidade().getId() != null) {
                stmt.setLong(11, fornecedor.getCidade().getId());
                System.out.println("Definindo cidade_id = " + fornecedor.getCidade().getId());
            } else {
                stmt.setNull(11, Types.BIGINT);
                System.out.println("Cidade não definida, usando NULL");
            }
            
            stmt.setBoolean(12, fornecedor.getAtivo() != null ? fornecedor.getAtivo() : true);
            stmt.setTimestamp(13, Timestamp.valueOf(now));
            stmt.setTimestamp(14, Timestamp.valueOf(now));
            
            System.out.println("FornecedorRepository.insert() - Inserindo fornecedor com data_cadastro: " + now);
            System.out.println("FornecedorRepository.insert() - Inserindo fornecedor com ultima_modificacao: " + now);
            
            System.out.println("Executando a inserção no banco de dados...");
            int affectedRows = stmt.executeUpdate();
            System.out.println("Inserção executada. Linhas afetadas: " + affectedRows);
            
            if (affectedRows == 0) {
                throw new SQLException("Falha ao criar fornecedor, nenhuma linha afetada.");
            }
            
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    Long id = rs.getLong(1);
                    fornecedor.setId(id);
                    System.out.println("Fornecedor inserido com sucesso. ID gerado: " + id);
                    
                    // Atualiza o objeto após a inserção
                    fornecedor.setDataCadastro(now);
                    fornecedor.setUltimaModificacao(now);
                } else {
                    throw new SQLException("Falha ao obter ID do fornecedor inserido.");
                }
            }
        } catch (SQLException e) {
            System.err.println("Erro SQL ao inserir fornecedor: " + e.getMessage());
            
            if (e.getMessage().contains("Duplicate entry") && e.getMessage().contains("cnpj")) {
                throw new RuntimeException("CNPJ já cadastrado: " + fornecedor.getCnpj(), e);
            } else if (e.getMessage().contains("foreign key constraint") && e.getMessage().contains("cidade_id")) {
                throw new RuntimeException("Cidade com ID " + 
                    (fornecedor.getCidade() != null ? fornecedor.getCidade().getId() : "null") + 
                    " não existe no banco de dados", e);
            } else {
                e.printStackTrace();
                throw new RuntimeException("Erro ao inserir fornecedor: " + e.getMessage(), e);
            }
        } catch (Exception e) {
            System.err.println("Erro inesperado ao inserir fornecedor: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao inserir fornecedor", e);
        }
        
        return fornecedor;
    }
    
    private Fornecedor update(Fornecedor fornecedor) {
        String sql = "UPDATE fornecedores SET razao_social = ?, nome_fantasia = ?, cnpj = ?, email = ?, telefone = ?, " +
                     "endereco = ?, numero = ?, complemento = ?, bairro = ?, cep = ?, cidade_id = ?, ativo = ?, " +
                     "ultima_modificacao = ? WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            LocalDateTime now = LocalDateTime.now();
            
            stmt.setString(1, fornecedor.getRazaoSocial());
            stmt.setString(2, fornecedor.getNomeFantasia());
            stmt.setString(3, fornecedor.getCnpj());
            stmt.setString(4, fornecedor.getEmail());
            stmt.setString(5, fornecedor.getTelefone());
            stmt.setString(6, fornecedor.getEndereco());
            stmt.setString(7, fornecedor.getNumero());
            stmt.setString(8, fornecedor.getComplemento());
            stmt.setString(9, fornecedor.getBairro());
            stmt.setString(10, fornecedor.getCep());
            
            if (fornecedor.getCidade() != null && fornecedor.getCidade().getId() != null) {
                stmt.setLong(11, fornecedor.getCidade().getId());
            } else {
                stmt.setNull(11, Types.BIGINT);
            }
            
            stmt.setBoolean(12, fornecedor.getAtivo() != null ? fornecedor.getAtivo() : true);
            stmt.setTimestamp(13, Timestamp.valueOf(now));
            stmt.setLong(14, fornecedor.getId());
            
            System.out.println("FornecedorRepository.update() - Atualizando fornecedor com ultima_modificacao: " + now);
            
            stmt.executeUpdate();
            
            // Atualiza o objeto após a atualização no banco
            fornecedor.setUltimaModificacao(now);
        } catch (SQLException e) {
            System.err.println("FornecedorRepository.update() - Erro: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao atualizar fornecedor", e);
        }
        
        return fornecedor;
    }
    
    public void deleteById(Long id) {
        String sql = "DELETE FROM fornecedores WHERE id = ?";
        
        try (Connection conn = databaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar fornecedor", e);
        }
    }
    
    private Fornecedor mapResultSetToFornecedor(ResultSet rs) throws SQLException {
        System.out.println("Iniciando mapeamento de fornecedor a partir do ResultSet");
        
        try {
            Fornecedor fornecedor = new Fornecedor();
            fornecedor.setId(rs.getLong("id"));
            fornecedor.setRazaoSocial(rs.getString("razao_social"));
            fornecedor.setNomeFantasia(rs.getString("nome_fantasia"));
            fornecedor.setCnpj(rs.getString("cnpj"));
            fornecedor.setEmail(rs.getString("email"));
            fornecedor.setTelefone(rs.getString("telefone"));
            fornecedor.setEndereco(rs.getString("endereco"));
            fornecedor.setNumero(rs.getString("numero"));
            fornecedor.setComplemento(rs.getString("complemento"));
            fornecedor.setBairro(rs.getString("bairro"));
            fornecedor.setCep(rs.getString("cep"));
            fornecedor.setAtivo(rs.getBoolean("ativo"));
            
            try {
                Timestamp dataCadastroTimestamp = rs.getTimestamp("data_cadastro");
                if (dataCadastroTimestamp != null) {
                    fornecedor.setDataCadastro(dataCadastroTimestamp.toLocalDateTime());
                    System.out.println("FornecedorRepository: Data de cadastro carregada: " + fornecedor.getDataCadastro());
                } else {
                    System.out.println("FornecedorRepository: Timestamp de data_cadastro é null");
                }
                
                Timestamp ultimaModificacaoTimestamp = rs.getTimestamp("ultima_modificacao");
                if (ultimaModificacaoTimestamp != null) {
                    fornecedor.setUltimaModificacao(ultimaModificacaoTimestamp.toLocalDateTime());
                    System.out.println("FornecedorRepository: Última modificação carregada: " + fornecedor.getUltimaModificacao());
                } else {
                    System.out.println("FornecedorRepository: Timestamp de ultima_modificacao é null");
                }
            } catch (SQLException e) {
                System.err.println("Erro ao carregar colunas de data: " + e.getMessage());
            }
            
            // Carregar a cidade relacionada junto com estado e país
            Long cidadeId = rs.getLong("cidade_id");
            if (cidadeId > 0) {
                Cidade cidade = new Cidade();
                cidade.setId(cidadeId);
                
                try {
                    cidade.setNome(rs.getString("cidade_nome"));
                    System.out.println("Cidade carregada: " + cidade.getNome() + " (ID=" + cidade.getId() + ")");
                    
                    // Carregar o estado associado à cidade
                    Long estadoId = rs.getLong("estado_id");
                    if (estadoId > 0) {
                        Estado estado = new Estado();
                        estado.setId(estadoId);
                        estado.setNome(rs.getString("estado_nome"));
                        estado.setUf(rs.getString("estado_uf"));
                        
                        System.out.println("Estado carregado: " + estado.getNome() + " (ID=" + estado.getId() + ")");
                        
                        // Carregar o país associado ao estado
                        String paisId = rs.getString("estado_pais_id");
                        if (paisId != null && !paisId.isEmpty()) {
                            Pais pais = new Pais();
                            pais.setId(paisId);
                            pais.setNome(rs.getString("pais_nome"));
                            pais.setSigla(rs.getString("pais_sigla"));
                            pais.setCodigo(rs.getString("pais_codigo"));
                            estado.setPais(pais);
                            
                            System.out.println("País carregado: " + pais.getNome() + " (ID=" + pais.getId() + ")");
                        } else {
                            System.out.println("Sem país associado ao estado");
                        }
                        
                        cidade.setEstado(estado);
                    } else {
                        System.out.println("Sem estado associado à cidade");
                    }
                } catch (SQLException e) {
                    System.err.println("Erro ao carregar dados relacionados da cidade: " + e.getMessage());
                    e.printStackTrace();
                    
                    // Se não conseguir obter as colunas do JOIN, buscar cidade do repositório
                    try {
                        System.out.println("Tentando buscar cidade do repositório: ID=" + cidadeId);
                        Optional<Cidade> cidadeOpt = cidadeRepository.findById(cidadeId);
                        if (cidadeOpt.isPresent()) {
                            cidade = cidadeOpt.get();
                            System.out.println("Cidade carregada do repositório: " + cidade.getNome());
                        } else {
                            System.out.println("Cidade não encontrada no repositório");
                        }
                    } catch (Exception ex) {
                        System.err.println("Erro ao buscar cidade do repositório: " + ex.getMessage());
                        ex.printStackTrace();
                    }
                }
                
                fornecedor.setCidade(cidade);
            } else {
                System.out.println("Fornecedor sem cidade associada");
            }
            
            System.out.println("Mapeamento de fornecedor concluído com sucesso");
            return fornecedor;
        } catch (SQLException e) {
            System.err.println("Erro durante o mapeamento do fornecedor: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("Erro inesperado durante o mapeamento do fornecedor: " + e.getMessage());
            e.printStackTrace();
            throw new SQLException("Erro ao mapear fornecedor", e);
        }
    }
} 