package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Fornecedor;
import com.example.PizzariaGraff.model.Cidade;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "DTO para transferência de dados de Fornecedor")
public class FornecedorDTO {

    @Schema(description = "ID do fornecedor", example = "1")
    private Long id;

    @Schema(description = "Nome do fornecedor", example = "Distribuidora ABC LTDA", required = true)
    private String fornecedor;

    @Schema(description = "Apelido do fornecedor", example = "ABC", required = true)
    private String apelido;

    @Schema(description = "Bairro", example = "Vila Industrial")
    private String bairro;

    @Schema(description = "CEP", example = "04571000")
    private String cep;

    @Schema(description = "Complemento", example = "Galpão A")
    private String complemento;

    @Schema(description = "Endereço", example = "Rua das Indústrias")
    private String endereco;

    @Schema(description = "Número", example = "1500")
    private String numero;

    @Schema(description = "ID da cidade", example = "1")
    private Long cidadeId;

    @Schema(description = "RG ou Inscrição Estadual", example = "123456789012")
    private String rgInscricaoEstadual;

    @Schema(description = "CPF ou CNPJ", example = "12345678000123")
    private String cpfCnpj;

    @Schema(description = "Email", example = "contato@abc.com.br", required = true)
    private String email;

    @Schema(description = "Contato", example = "João Silva")
    private String contato;

    @Schema(description = "Telefone", example = "11999999999", required = true)
    private String telefone;

    @Schema(description = "Tipo do fornecedor", example = "1", required = true)
    private Integer tipo;

    @Schema(description = "Observações", example = "Fornecedor preferencial")
    private String observacoes;

    @Schema(description = "ID da condição de pagamento", example = "1")
    private Long condicaoPagamentoId;

    @Schema(description = "Limite de crédito", example = "25000.00", required = true)
    private BigDecimal limiteCredito;

    @Schema(description = "Data da situação", example = "2024-01-01", required = true)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate situacao;

    @Schema(description = "Data de criação do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataCriacao;

    @Schema(description = "Data de alteração do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataAlteracao;

    // Constructors
    public FornecedorDTO() {}

    public FornecedorDTO(Fornecedor fornecedor) {
        this.id = fornecedor.getId();
        this.fornecedor = fornecedor.getFornecedor();
        this.apelido = fornecedor.getApelido();
        this.bairro = fornecedor.getBairro();
        this.cep = fornecedor.getCep();
        this.complemento = fornecedor.getComplemento();
        this.endereco = fornecedor.getEndereco();
        this.numero = fornecedor.getNumero();
        this.cidadeId = fornecedor.getCidadeId();
        this.rgInscricaoEstadual = fornecedor.getRgInscricaoEstadual();
        this.cpfCnpj = fornecedor.getCpfCnpj();
        this.email = fornecedor.getEmail();
        this.contato = fornecedor.getContato();
        this.telefone = fornecedor.getTelefone();
        this.tipo = fornecedor.getTipo();
        this.observacoes = fornecedor.getObservacoes();
        this.condicaoPagamentoId = fornecedor.getCondicaoPagamentoId();
        this.limiteCredito = fornecedor.getLimiteCredito();
        this.situacao = fornecedor.getSituacao();
        this.dataCriacao = fornecedor.getDataCriacao();
        this.dataAlteracao = fornecedor.getDataAlteracao();
    }

    // Método para converter DTO para Entity (sem parâmetro cidade)
    public Fornecedor toEntity() {
        Fornecedor fornecedor = new Fornecedor();
        fornecedor.setId(this.id);
        fornecedor.setFornecedor(this.fornecedor);
        fornecedor.setApelido(this.apelido);
        fornecedor.setBairro(this.bairro);
        fornecedor.setCep(this.cep);
        fornecedor.setComplemento(this.complemento);
        fornecedor.setEndereco(this.endereco);
        fornecedor.setNumero(this.numero);
        fornecedor.setCidadeId(this.cidadeId);
        fornecedor.setRgInscricaoEstadual(this.rgInscricaoEstadual);
        fornecedor.setCpfCnpj(this.cpfCnpj);
        fornecedor.setEmail(this.email);
        fornecedor.setContato(this.contato);
        fornecedor.setTelefone(this.telefone);
        fornecedor.setTipo(this.tipo);
        fornecedor.setObservacoes(this.observacoes);
        fornecedor.setCondicaoPagamentoId(this.condicaoPagamentoId);
        fornecedor.setLimiteCredito(this.limiteCredito);
        fornecedor.setSituacao(this.situacao);
        fornecedor.setDataCriacao(this.dataCriacao);
        fornecedor.setDataAlteracao(this.dataAlteracao);
        return fornecedor;
    }

    // Método legacy para compatibilidade (será removido)
    @Deprecated
    public Fornecedor toEntity(Cidade cidade) {
        Fornecedor fornecedor = toEntity();
        fornecedor.setCidade(cidade);
        return fornecedor;
    }

    // Getters e Setters (completos)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFornecedor() { return fornecedor; }
    public void setFornecedor(String fornecedor) { this.fornecedor = fornecedor; }
    public String getApelido() { return apelido; }
    public void setApelido(String apelido) { this.apelido = apelido; }
    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
    public String getComplemento() { return complemento; }
    public void setComplemento(String complemento) { this.complemento = complemento; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public Long getCidadeId() { return cidadeId; }
    public void setCidadeId(Long cidadeId) { this.cidadeId = cidadeId; }
    public String getRgInscricaoEstadual() { return rgInscricaoEstadual; }
    public void setRgInscricaoEstadual(String rgInscricaoEstadual) { this.rgInscricaoEstadual = rgInscricaoEstadual; }
    public String getCpfCnpj() { return cpfCnpj; }
    public void setCpfCnpj(String cpfCnpj) { this.cpfCnpj = cpfCnpj; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getContato() { return contato; }
    public void setContato(String contato) { this.contato = contato; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public Integer getTipo() { return tipo; }
    public void setTipo(Integer tipo) { this.tipo = tipo; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public Long getCondicaoPagamentoId() { return condicaoPagamentoId; }
    public void setCondicaoPagamentoId(Long condicaoPagamentoId) { this.condicaoPagamentoId = condicaoPagamentoId; }
    public BigDecimal getLimiteCredito() { return limiteCredito; }
    public void setLimiteCredito(BigDecimal limiteCredito) { this.limiteCredito = limiteCredito; }
    public LocalDate getSituacao() { return situacao; }
    public void setSituacao(LocalDate situacao) { this.situacao = situacao; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
    public LocalDateTime getDataAlteracao() { return dataAlteracao; }
    public void setDataAlteracao(LocalDateTime dataAlteracao) { this.dataAlteracao = dataAlteracao; }

    // Métodos legacy para compatibilidade (serão removidos)
    @Deprecated
    public String getRazaoSocial() { return this.fornecedor; }
    @Deprecated
    public void setRazaoSocial(String razaoSocial) { this.fornecedor = razaoSocial; }
    @Deprecated
    public String getNomeFantasia() { return this.apelido; }
    @Deprecated
    public void setNomeFantasia(String nomeFantasia) { this.apelido = nomeFantasia; }
    @Deprecated
    public String getCnpj() { return this.cpfCnpj; }
    @Deprecated
    public void setCnpj(String cnpj) { this.cpfCnpj = cnpj; }
} 