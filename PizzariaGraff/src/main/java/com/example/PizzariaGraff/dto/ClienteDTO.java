package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Cliente;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.CondicaoPagamento;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "DTO para representar um Cliente")
public class ClienteDTO {
    
    @Schema(description = "ID único do cliente", example = "1")
    private Long id;
    
    @Schema(description = "Nome do cliente", example = "João Silva", required = true)
    private String cliente;
    
    @Schema(description = "Apelido do cliente", example = "João")
    private String apelido;
    
    @Schema(description = "Bairro do cliente", example = "Centro")
    private String bairro;
    
    @Schema(description = "CEP do cliente", example = "01310100")
    private String cep;
    
    @Schema(description = "Número do endereço", example = "123")
    private String numero;
    
    @Schema(description = "Endereço do cliente", example = "Rua das Flores")
    private String endereco;
    
    @Schema(description = "ID da cidade", example = "1")
    private Long cidadeId;
    
    @Schema(description = "Nome da cidade")
    private String cidadeNome;
    
    @Schema(description = "Complemento do endereço", example = "Apto 101")
    private String complemento;
    
    @Schema(description = "ID brasileiro", example = "1")
    private Integer idBrasileiro;
    
    @Schema(description = "Limite de crédito", example = "1000.00")
    private BigDecimal limiteCredito;
    
    @Schema(description = "ID da Nacionalidade (País)", example = "1")
    private Long nacionalidadeId;
    
    @Schema(description = "Nacionalidade", example = "Brasileira")
    private String nacionalidade;
    
    @Schema(description = "RG ou Inscrição Estadual", example = "12345678901")
    private String rgInscricaoEstadual;
    
    @Schema(description = "CPF ou CNPJ", example = "12345678901")
    private String cpfCpnj;
    
    @Schema(description = "Data de nascimento", example = "1990-01-15")
    private LocalDate dataNascimento;
    
    @Schema(description = "Email", example = "joao@email.com")
    private String email;
    
    @Schema(description = "Telefone", example = "11999999999")
    private String telefone;
    
    @Schema(description = "Estado civil", example = "Solteiro")
    private String estadoCivil;
    
    @Schema(description = "Tipo (1-Pessoa Física, 2-Pessoa Jurídica)", example = "1")
    private Integer tipo;
    
    @Schema(description = "Sexo (M/F)", example = "M")
    private String sexo;
    
    @Schema(description = "ID da condição de pagamento", example = "1")
    private Long condicaoPagamentoId;
    
    @Schema(description = "Nome da condição de pagamento")
    private String condicaoPagamentoNome;
    
    @Schema(description = "Limite de crédito 2", example = "500.00")
    private BigDecimal limiteCredito2;
    
    @Schema(description = "Observação", example = "Cliente VIP")
    private String observacao;
    
    @Schema(description = "Data da situação", example = "2024-01-15")
    private LocalDate situacao;
    
    @Schema(description = "Data de criação do registro")
    private LocalDateTime dataCriacao;
    
    @Schema(description = "Data da última alteração")
    private LocalDateTime dataAlteracao;

    // Constructors
    public ClienteDTO() {}

    public ClienteDTO(Cliente cliente) {
        this.id = cliente.getId();
        this.cliente = cliente.getCliente();
        this.apelido = cliente.getApelido();
        this.bairro = cliente.getBairro();
        this.cep = cliente.getCep();
        this.numero = cliente.getNumero();
        this.endereco = cliente.getEndereco();
        this.cidadeId = cliente.getCidadeId();
        this.complemento = cliente.getComplemento();
        this.idBrasileiro = cliente.getIdBrasileiro();
        this.limiteCredito = cliente.getLimiteCredito();
        this.nacionalidadeId = cliente.getNacionalidadeId();
        this.nacionalidade = cliente.getNacionalidade();
        this.rgInscricaoEstadual = cliente.getRgInscricaoEstadual();
        this.cpfCpnj = cliente.getCpfCpnj();
        this.dataNascimento = cliente.getDataNascimento();
        this.email = cliente.getEmail();
        this.telefone = cliente.getTelefone();
        this.estadoCivil = cliente.getEstadoCivil();
        this.tipo = cliente.getTipo();
        this.sexo = cliente.getSexo();
        this.condicaoPagamentoId = cliente.getCondicaoPagamentoId();
        this.limiteCredito2 = cliente.getLimiteCredito2();
        this.observacao = cliente.getObservacao();
        this.situacao = cliente.getSituacao();
        this.dataCriacao = cliente.getDataCriacao();
        this.dataAlteracao = cliente.getDataAlteracao();
        
        // Relacionamentos
        if (cliente.getCidade() != null) {
            this.cidadeNome = cliente.getCidade().getNome();
        }
        
        if (cliente.getCondicaoPagamento() != null) {
            this.condicaoPagamentoNome = cliente.getCondicaoPagamento().getCondicaoPagamento();
        }
    }

    // Método para converter DTO para Entity
    public Cliente toEntity() {
        Cliente cliente = new Cliente();
        cliente.setId(this.id);
        cliente.setCliente(this.cliente);
        cliente.setApelido(this.apelido);
        cliente.setBairro(this.bairro);
        cliente.setCep(this.cep);
        cliente.setNumero(this.numero);
        cliente.setEndereco(this.endereco);
        cliente.setCidadeId(this.cidadeId);
        cliente.setComplemento(this.complemento);
        cliente.setIdBrasileiro(this.idBrasileiro);
        cliente.setLimiteCredito(this.limiteCredito);
        cliente.setNacionalidadeId(this.nacionalidadeId);
        cliente.setNacionalidade(this.nacionalidade);
        cliente.setRgInscricaoEstadual(this.rgInscricaoEstadual);
        cliente.setCpfCpnj(this.cpfCpnj);
        cliente.setDataNascimento(this.dataNascimento);
        cliente.setEmail(this.email);
        cliente.setTelefone(this.telefone);
        cliente.setEstadoCivil(this.estadoCivil);
        cliente.setTipo(this.tipo);
        cliente.setSexo(this.sexo);
        cliente.setCondicaoPagamentoId(this.condicaoPagamentoId);
        cliente.setLimiteCredito2(this.limiteCredito2);
        cliente.setObservacao(this.observacao);
        cliente.setSituacao(this.situacao);
        cliente.setDataCriacao(this.dataCriacao);
        cliente.setDataAlteracao(this.dataAlteracao);
        return cliente;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCliente() {
        return cliente;
    }

    public void setCliente(String cliente) {
        this.cliente = cliente;
    }

    public String getApelido() {
        return apelido;
    }

    public void setApelido(String apelido) {
        this.apelido = apelido;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public Long getCidadeId() {
        return cidadeId;
    }

    public void setCidadeId(Long cidadeId) {
        this.cidadeId = cidadeId;
    }

    public String getCidadeNome() {
        return cidadeNome;
    }

    public void setCidadeNome(String cidadeNome) {
        this.cidadeNome = cidadeNome;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public Integer getIdBrasileiro() {
        return idBrasileiro;
    }

    public void setIdBrasileiro(Integer idBrasileiro) {
        this.idBrasileiro = idBrasileiro;
    }

    public BigDecimal getLimiteCredito() {
        return limiteCredito;
    }

    public void setLimiteCredito(BigDecimal limiteCredito) {
        this.limiteCredito = limiteCredito;
    }

    public Long getNacionalidadeId() {
        return nacionalidadeId;
    }

    public void setNacionalidadeId(Long nacionalidadeId) {
        this.nacionalidadeId = nacionalidadeId;
    }

    public String getNacionalidade() {
        return nacionalidade;
    }

    public void setNacionalidade(String nacionalidade) {
        this.nacionalidade = nacionalidade;
    }

    public String getRgInscricaoEstadual() {
        return rgInscricaoEstadual;
    }

    public void setRgInscricaoEstadual(String rgInscricaoEstadual) {
        this.rgInscricaoEstadual = rgInscricaoEstadual;
    }

    public String getCpfCpnj() {
        return cpfCpnj;
    }

    public void setCpfCpnj(String cpfCpnj) {
        this.cpfCpnj = cpfCpnj;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEstadoCivil() {
        return estadoCivil;
    }

    public void setEstadoCivil(String estadoCivil) {
        this.estadoCivil = estadoCivil;
    }

    public Integer getTipo() {
        return tipo;
    }

    public void setTipo(Integer tipo) {
        this.tipo = tipo;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public Long getCondicaoPagamentoId() {
        return condicaoPagamentoId;
    }

    public void setCondicaoPagamentoId(Long condicaoPagamentoId) {
        this.condicaoPagamentoId = condicaoPagamentoId;
    }

    public String getCondicaoPagamentoNome() {
        return condicaoPagamentoNome;
    }

    public void setCondicaoPagamentoNome(String condicaoPagamentoNome) {
        this.condicaoPagamentoNome = condicaoPagamentoNome;
    }

    public BigDecimal getLimiteCredito2() {
        return limiteCredito2;
    }

    public void setLimiteCredito2(BigDecimal limiteCredito2) {
        this.limiteCredito2 = limiteCredito2;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public LocalDate getSituacao() {
        return situacao;
    }

    public void setSituacao(LocalDate situacao) {
        this.situacao = situacao;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDateTime getDataAlteracao() {
        return dataAlteracao;
    }

    public void setDataAlteracao(LocalDateTime dataAlteracao) {
        this.dataAlteracao = dataAlteracao;
    }
} 