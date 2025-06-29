package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Transportadora;
import java.time.LocalDateTime;
import java.util.List;

public class TransportadoraDTO {
    private Long id;
    private String transportadora;
    private String apelido;
    private String endereco;
    private String numero;
    private String complemento;
    private String bairro;
    private String cep;
    private Long cidadeId;
    private CidadeDTO cidade;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAlteracao;
    private String rgIe;
    private String observacao;
    private Long condicaoPagamentoId;
    private String cpfCnpj;
    private Boolean ativo;
    private Integer tipo;
    private String cidadeNome;
    private String condicaoPagamentoNome;

    // Listas para múltiplos emails e telefones
    private List<String> emailsAdicionais;
    private List<String> telefonesAdicionais;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTransportadora() {
        return transportadora;
    }

    public void setTransportadora(String transportadora) {
        this.transportadora = transportadora;
    }

    public String getApelido() {
        return apelido;
    }

    public void setApelido(String apelido) {
        this.apelido = apelido;
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

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
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

    public Long getCidadeId() {
        return cidadeId;
    }

    public void setCidadeId(Long cidadeId) {
        this.cidadeId = cidadeId;
    }

    public CidadeDTO getCidade() {
        return cidade;
    }

    public void setCidade(CidadeDTO cidade) {
        this.cidade = cidade;
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

    public String getRgIe() {
        return rgIe;
    }

    public void setRgIe(String rgIe) {
        this.rgIe = rgIe;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public Long getCondicaoPagamentoId() {
        return condicaoPagamentoId;
    }

    public void setCondicaoPagamentoId(Long condicaoPagamentoId) {
        this.condicaoPagamentoId = condicaoPagamentoId;
    }

    public String getCpfCnpj() {
        return cpfCnpj;
    }

    public void setCpfCnpj(String cpfCnpj) {
        this.cpfCnpj = cpfCnpj;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Integer getTipo() {
        return tipo;
    }

    public void setTipo(Integer tipo) {
        this.tipo = tipo;
    }

    public String getCidadeNome() {
        return cidadeNome;
    }

    public void setCidadeNome(String cidadeNome) {
        this.cidadeNome = cidadeNome;
    }

    public String getCondicaoPagamentoNome() {
        return condicaoPagamentoNome;
    }

    public void setCondicaoPagamentoNome(String condicaoPagamentoNome) {
        this.condicaoPagamentoNome = condicaoPagamentoNome;
    }

    public List<String> getEmailsAdicionais() {
        return emailsAdicionais;
    }

    public void setEmailsAdicionais(List<String> emailsAdicionais) {
        this.emailsAdicionais = emailsAdicionais;
    }

    public List<String> getTelefonesAdicionais() {
        return telefonesAdicionais;
    }

    public void setTelefonesAdicionais(List<String> telefonesAdicionais) {
        this.telefonesAdicionais = telefonesAdicionais;
    }

    // Métodos de conversão
    public static TransportadoraDTO fromEntity(Transportadora transportadora) {
        TransportadoraDTO dto = new TransportadoraDTO();
        dto.setId(transportadora.getId());
        dto.setTransportadora(transportadora.getTransportadora());
        dto.setApelido(transportadora.getApelido());
        dto.setEndereco(transportadora.getEndereco());
        dto.setNumero(transportadora.getNumero());
        dto.setComplemento(transportadora.getComplemento());
        dto.setBairro(transportadora.getBairro());
        dto.setCep(transportadora.getCep());
        dto.setCidadeId(transportadora.getCidadeId());
        dto.setDataCriacao(transportadora.getDataCriacao());
        dto.setDataAlteracao(transportadora.getDataAlteracao());
        dto.setRgIe(transportadora.getRgIe());
        dto.setObservacao(transportadora.getObservacao());
        dto.setCondicaoPagamentoId(transportadora.getCondicaoPagamentoId());
        dto.setCpfCnpj(transportadora.getCpfCnpj());
        dto.setAtivo(transportadora.getAtivo());
        dto.setTipo(transportadora.getTipo());
        
        if (transportadora.getCidade() != null) {
            dto.setCidade(CidadeDTO.fromEntity(transportadora.getCidade()));
            dto.setCidadeNome(transportadora.getCidade().getNome());
        }
        
        if (transportadora.getCondicaoPagamento() != null) {
            dto.setCondicaoPagamentoNome(transportadora.getCondicaoPagamento().getCondicaoPagamento());
        }
        
        return dto;
    }

    public Transportadora toEntity() {
        Transportadora transportadora = new Transportadora();
        transportadora.setId(this.id);
        transportadora.setTransportadora(this.transportadora);
        transportadora.setApelido(this.apelido);
        transportadora.setEndereco(this.endereco);
        transportadora.setNumero(this.numero);
        transportadora.setComplemento(this.complemento);
        transportadora.setBairro(this.bairro);
        transportadora.setCep(this.cep);
        transportadora.setCidadeId(this.cidadeId);
        transportadora.setRgIe(this.rgIe);
        transportadora.setObservacao(this.observacao);
        transportadora.setCondicaoPagamentoId(this.condicaoPagamentoId);
        transportadora.setCpfCnpj(this.cpfCnpj);
        transportadora.setAtivo(this.ativo);
        transportadora.setTipo(this.tipo);
        return transportadora;
    }
} 