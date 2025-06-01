package com.example.PizzariaGraff.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class Cliente {
    private Long id;
    private String cliente;  // Nome do cliente (varchar(50))
    private String apelido;  // varchar(60)
    private String bairro;   // varchar(255)
    private String cep;      // varchar(9)
    private String numero;   // varchar(5)
    private String endereco; // varchar(255)
    private Long cidadeId;   // int4 - FK para Cidade
    private String complemento; // varchar(255) - NULL
    private Integer idBrasileiro; // int4 - NULL
    private BigDecimal limiteCredito; // numeric(10,2)
    private String nacionalidade; // varchar(255)
    private String rgInscricaoEstadual; // varchar(14) - NULL
    private String cpfCpnj; // varchar(14) - NULL
    private LocalDate dataNascimento; // date - NULL
    private String email; // varchar(255) - NULL
    private String telefone; // varchar(255) - NULL
    private String estadoCivil; // varchar(255) - NULL
    private Integer tipo; // int4
    private String sexo; // varchar(1) - NULL
    private Long condicaoPagamentoId; // int4 - FK para CondicaoPagamento
    private BigDecimal limiteCredito2; // numeric(10,2) - NULL
    private String observacao; // varchar(255) - NULL
    private LocalDate situacao; // date
    private LocalDateTime dataCriacao; // timestamp
    private LocalDateTime dataAlteracao; // timestamp - NULL
    
    // Relacionamentos
    private Cidade cidade;
    private CondicaoPagamento condicaoPagamento;
    private List<Nfe> notas;

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

    public Cidade getCidade() {
        return cidade;
    }

    public void setCidade(Cidade cidade) {
        this.cidade = cidade;
    }

    public CondicaoPagamento getCondicaoPagamento() {
        return condicaoPagamento;
    }

    public void setCondicaoPagamento(CondicaoPagamento condicaoPagamento) {
        this.condicaoPagamento = condicaoPagamento;
    }

    public List<Nfe> getNotas() {
        return notas;
    }

    public void setNotas(List<Nfe> notas) {
        this.notas = notas;
    }
} 