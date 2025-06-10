package com.example.PizzariaGraff.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Fornecedor {
    private Long id;
    private String fornecedor;           // varchar(255) NOT NULL
    private String apelido;              // varchar(60) NOT NULL
    private String bairro;               // varchar(255)
    private String cep;                  // varchar(9)
    private String complemento;          // varchar(255)
    private String endereco;             // varchar(255)
    private String numero;               // varchar(5)
    private Long cidadeId;               // bigint(20) - FK para Cidade
    private String rgInscricaoEstadual;  // varchar(14)
    private String cpfCnpj;              // varchar(14)
    private String email;                // varchar(255) NOT NULL
    private String contato;              // varchar(255)
    private String telefone;             // varchar(255) NOT NULL
    private Integer tipo;                // int(11) NOT NULL
    private String observacoes;          // varchar(255)
    private Long condicaoPagamentoId;    // bigint(20) - FK
    private BigDecimal limiteCredito;    // decimal(15,2) NOT NULL
    private LocalDate situacao;          // date NOT NULL
    private LocalDateTime dataCriacao;   // timestamp NOT NULL
    private LocalDateTime dataAlteracao; // timestamp NOT NULL
    private Boolean ativo;               // tinyint(1) NOT NULL DEFAULT 1
    private Long nacionalidadeId;        // bigint(20) - FK para Nacionalidade
    private Long transportadoraId;       // bigint(20) - FK para Transportadora
    
    // Relacionamentos
    private Cidade cidade;
    private CondicaoPagamento condicaoPagamento;

    // Constructors
    public Fornecedor() {}

    public Fornecedor(String fornecedor, String apelido, String email, String telefone, Integer tipo, BigDecimal limiteCredito, LocalDate situacao) {
        this.fornecedor = fornecedor;
        this.apelido = apelido;
        this.email = email;
        this.telefone = telefone;
        this.tipo = tipo;
        this.limiteCredito = limiteCredito;
        this.situacao = situacao;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(String fornecedor) {
        this.fornecedor = fornecedor;
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

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public Long getCidadeId() {
        return cidadeId;
    }

    public void setCidadeId(Long cidadeId) {
        this.cidadeId = cidadeId;
    }

    public String getRgInscricaoEstadual() {
        return rgInscricaoEstadual;
    }

    public void setRgInscricaoEstadual(String rgInscricaoEstadual) {
        this.rgInscricaoEstadual = rgInscricaoEstadual;
    }

    public String getCpfCnpj() {
        return cpfCnpj;
    }

    public void setCpfCnpj(String cpfCnpj) {
        this.cpfCnpj = cpfCnpj;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContato() {
        return contato;
    }

    public void setContato(String contato) {
        this.contato = contato;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public Integer getTipo() {
        return tipo;
    }

    public void setTipo(Integer tipo) {
        this.tipo = tipo;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public Long getCondicaoPagamentoId() {
        return condicaoPagamentoId;
    }

    public void setCondicaoPagamentoId(Long condicaoPagamentoId) {
        this.condicaoPagamentoId = condicaoPagamentoId;
    }

    public BigDecimal getLimiteCredito() {
        return limiteCredito;
    }

    public void setLimiteCredito(BigDecimal limiteCredito) {
        this.limiteCredito = limiteCredito;
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

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Long getNacionalidadeId() {
        return nacionalidadeId;
    }

    public void setNacionalidadeId(Long nacionalidadeId) {
        this.nacionalidadeId = nacionalidadeId;
    }

    public Long getTransportadoraId() {
        return transportadoraId;
    }

    public void setTransportadoraId(Long transportadoraId) {
        this.transportadoraId = transportadoraId;
    }

    @Override
    public String toString() {
        return "Fornecedor{" +
                "id=" + id +
                ", fornecedor='" + fornecedor + '\'' +
                ", apelido='" + apelido + '\'' +
                ", email='" + email + '\'' +
                ", telefone='" + telefone + '\'' +
                ", tipo=" + tipo +
                ", limiteCredito=" + limiteCredito +
                ", situacao=" + situacao +
                ", ativo=" + ativo +
                '}';
    }
} 