package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Produto;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "DTO para transferência de dados de Produto")
public class ProdutoDTO {

    @Schema(description = "ID do produto", example = "1")
    private Long id;

    @Schema(description = "Nome do produto", example = "Refrigerante Coca-Cola 350ml", required = true)
    private String produto;

    @Schema(description = "Código de barras", example = "7891000100103")
    private String codigoBarras;

    @Schema(description = "Referência", example = "REF001")
    private String referencia;

    @Schema(description = "Descrição do produto", example = "Refrigerante sabor cola em lata de 350ml")
    private String descricao;

    @Schema(description = "Observações", example = "Produto sazonal")
    private String observacoes;

    @Schema(description = "Valor de compra", example = "2.80")
    private BigDecimal valorCompra;

    @Schema(description = "Valor de venda", example = "4.50")
    private BigDecimal valorVenda;

    @Schema(description = "Percentual de lucro", example = "60.71")
    private BigDecimal percentualLucro;

    @Schema(description = "Quantidade em estoque", example = "150")
    private Integer quantidade;

    @Schema(description = "Quantidade mínima", example = "10")
    private Integer quantidadeMinima;

    @Schema(description = "ID da marca", example = "1", required = true)
    private Long marcaId;

    @Schema(description = "Nome da marca", example = "Coca-Cola")
    private String marcaNome;

    @Schema(description = "ID da unidade de medida", example = "1", required = true)
    private Long unidadeMedidaId;

    @Schema(description = "Nome da unidade de medida", example = "Unidade")
    private String unidadeMedidaNome;

    @Schema(description = "Data da situação", example = "2024-01-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate situacao;

    @Schema(description = "Data de criação do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataCriacao;

    @Schema(description = "Data de alteração do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataAlteracao;

    // Constructors
    public ProdutoDTO() {}

    public ProdutoDTO(Produto produto) {
        this.id = produto.getId();
        this.produto = produto.getProduto();
        this.codigoBarras = produto.getCodigoBarras();
        this.referencia = produto.getReferencia();
        this.descricao = produto.getDescricao();
        this.observacoes = produto.getObservacoes();
        this.valorCompra = produto.getValorCompra();
        this.valorVenda = produto.getValorVenda();
        this.percentualLucro = produto.getPercentualLucro();
        this.quantidade = produto.getQuantidade();
        this.quantidadeMinima = produto.getQuantidadeMinima();
        this.marcaId = produto.getMarcaId();
        this.unidadeMedidaId = produto.getUnidadeMedidaId();
        this.situacao = produto.getSituacao();
        this.dataCriacao = produto.getDataCriacao();
        this.dataAlteracao = produto.getDataAlteracao();
        
        // Nomes das entidades relacionadas podem ser setados separadamente
        if (produto.getMarca() != null) {
            this.marcaNome = produto.getMarca().getMarca();
        }
        if (produto.getUnidadeMedida() != null) {
            this.unidadeMedidaNome = produto.getUnidadeMedida().getUnidadeMedida();
        }
    }

    // Método para converter DTO para Entity
    public Produto toEntity() {
        Produto produto = new Produto();
        produto.setId(this.id);
        produto.setProduto(this.produto);
        produto.setCodigoBarras(this.codigoBarras);
        produto.setReferencia(this.referencia);
        produto.setDescricao(this.descricao);
        produto.setObservacoes(this.observacoes);
        produto.setValorCompra(this.valorCompra);
        produto.setValorVenda(this.valorVenda);
        produto.setPercentualLucro(this.percentualLucro);
        produto.setQuantidade(this.quantidade);
        produto.setQuantidadeMinima(this.quantidadeMinima);
        produto.setMarcaId(this.marcaId);
        produto.setUnidadeMedidaId(this.unidadeMedidaId);
        produto.setSituacao(this.situacao);
        produto.setDataCriacao(this.dataCriacao);
        produto.setDataAlteracao(this.dataAlteracao);
        return produto;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getProduto() { return produto; }
    public void setProduto(String produto) { this.produto = produto; }
    
    public String getCodigoBarras() { return codigoBarras; }
    public void setCodigoBarras(String codigoBarras) { this.codigoBarras = codigoBarras; }
    
    public String getReferencia() { return referencia; }
    public void setReferencia(String referencia) { this.referencia = referencia; }
    
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    
    public BigDecimal getValorCompra() { return valorCompra; }
    public void setValorCompra(BigDecimal valorCompra) { this.valorCompra = valorCompra; }
    
    public BigDecimal getValorVenda() { return valorVenda; }
    public void setValorVenda(BigDecimal valorVenda) { this.valorVenda = valorVenda; }
    
    public BigDecimal getPercentualLucro() { return percentualLucro; }
    public void setPercentualLucro(BigDecimal percentualLucro) { this.percentualLucro = percentualLucro; }
    
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    
    public Integer getQuantidadeMinima() { return quantidadeMinima; }
    public void setQuantidadeMinima(Integer quantidadeMinima) { this.quantidadeMinima = quantidadeMinima; }
    
    public Long getMarcaId() { return marcaId; }
    public void setMarcaId(Long marcaId) { this.marcaId = marcaId; }
    
    public String getMarcaNome() { return marcaNome; }
    public void setMarcaNome(String marcaNome) { this.marcaNome = marcaNome; }
    
    public Long getUnidadeMedidaId() { return unidadeMedidaId; }
    public void setUnidadeMedidaId(Long unidadeMedidaId) { this.unidadeMedidaId = unidadeMedidaId; }
    
    public String getUnidadeMedidaNome() { return unidadeMedidaNome; }
    public void setUnidadeMedidaNome(String unidadeMedidaNome) { this.unidadeMedidaNome = unidadeMedidaNome; }
    
    public LocalDate getSituacao() { return situacao; }
    public void setSituacao(LocalDate situacao) { this.situacao = situacao; }
    
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
    
    public LocalDateTime getDataAlteracao() { return dataAlteracao; }
    public void setDataAlteracao(LocalDateTime dataAlteracao) { this.dataAlteracao = dataAlteracao; }
} 