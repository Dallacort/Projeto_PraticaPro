package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.ProdutoNota;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "DTO para representar um Produto da Nota")
public class ProdutoNotaDTO {
    
    @Schema(description = "ID do produto", example = "1", required = true)
    private Long produtoId;
    
    @Schema(description = "Nome do produto")
    private String produtoNome;
    
    @Schema(description = "Código do produto")
    private String produtoCodigo;
    
    @Schema(description = "Sequência do produto na nota", example = "1")
    private Integer sequencia;
    
    @Schema(description = "Quantidade", example = "10.00", required = true)
    private BigDecimal quantidade;
    
    @Schema(description = "Valor unitário", example = "150.00", required = true)
    private BigDecimal valorUnitario;
    
    @Schema(description = "Valor do desconto", example = "0")
    private BigDecimal valorDesconto;
    
    @Schema(description = "Percentual de desconto", example = "0")
    private BigDecimal percentualDesconto;
    
    @Schema(description = "Valor total do item", example = "1500.00", required = true)
    private BigDecimal valorTotal;
    
    @Schema(description = "Rateio do frete", example = "0")
    private BigDecimal rateioFrete;
    
    @Schema(description = "Rateio do seguro", example = "100")
    private BigDecimal rateioSeguro;
    
    @Schema(description = "Rateio de outras despesas", example = "0")
    private BigDecimal rateioOutras;
    
    @Schema(description = "Custo preço final", example = "1509.09")
    private BigDecimal custoPrecoFinal;
    
    // Constructors
    public ProdutoNotaDTO() {
        this.sequencia = 1;
        this.valorDesconto = BigDecimal.ZERO;
        this.percentualDesconto = BigDecimal.ZERO;
        this.rateioFrete = BigDecimal.ZERO;
        this.rateioSeguro = BigDecimal.ZERO;
        this.rateioOutras = BigDecimal.ZERO;
    }
    
    public ProdutoNotaDTO(ProdutoNota produtoNota) {
        this.produtoId = produtoNota.getProdutoId();
        this.sequencia = produtoNota.getSequencia();
        this.quantidade = produtoNota.getQuantidade();
        this.valorUnitario = produtoNota.getValorUnitario();
        this.valorDesconto = produtoNota.getValorDesconto();
        this.percentualDesconto = produtoNota.getPercentualDesconto();
        this.valorTotal = produtoNota.getValorTotal();
        this.rateioFrete = produtoNota.getRateioFrete();
        this.rateioSeguro = produtoNota.getRateioSeguro();
        this.rateioOutras = produtoNota.getRateioOutras();
        this.custoPrecoFinal = produtoNota.getCustoPrecoFinal();
        
        if (produtoNota.getProduto() != null) {
            this.produtoNome = produtoNota.getProduto().getProduto();
            this.produtoCodigo = produtoNota.getProduto().getCodigoBarras();
        }
    }
    
    // Método para converter DTO para Entity
    public ProdutoNota toEntity() {
        ProdutoNota produtoNota = new ProdutoNota();
        produtoNota.setProdutoId(this.produtoId);
        produtoNota.setSequencia(this.sequencia != null ? this.sequencia : 1);
        produtoNota.setQuantidade(this.quantidade);
        produtoNota.setValorUnitario(this.valorUnitario);
        produtoNota.setValorDesconto(this.valorDesconto != null ? this.valorDesconto : BigDecimal.ZERO);
        produtoNota.setPercentualDesconto(this.percentualDesconto != null ? this.percentualDesconto : BigDecimal.ZERO);
        produtoNota.setValorTotal(this.valorTotal);
        produtoNota.setRateioFrete(this.rateioFrete != null ? this.rateioFrete : BigDecimal.ZERO);
        produtoNota.setRateioSeguro(this.rateioSeguro != null ? this.rateioSeguro : BigDecimal.ZERO);
        produtoNota.setRateioOutras(this.rateioOutras != null ? this.rateioOutras : BigDecimal.ZERO);
        produtoNota.setCustoPrecoFinal(this.custoPrecoFinal);
        return produtoNota;
    }
    
    // Getters e Setters
    public Long getProdutoId() {
        return produtoId;
    }
    
    public void setProdutoId(Long produtoId) {
        this.produtoId = produtoId;
    }
    
    public String getProdutoNome() {
        return produtoNome;
    }
    
    public void setProdutoNome(String produtoNome) {
        this.produtoNome = produtoNome;
    }
    
    public String getProdutoCodigo() {
        return produtoCodigo;
    }
    
    public void setProdutoCodigo(String produtoCodigo) {
        this.produtoCodigo = produtoCodigo;
    }
    
    public Integer getSequencia() {
        return sequencia;
    }
    
    public void setSequencia(Integer sequencia) {
        this.sequencia = sequencia;
    }
    
    public BigDecimal getQuantidade() {
        return quantidade;
    }
    
    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }
    
    public BigDecimal getValorUnitario() {
        return valorUnitario;
    }
    
    public void setValorUnitario(BigDecimal valorUnitario) {
        this.valorUnitario = valorUnitario;
    }
    
    public BigDecimal getValorDesconto() {
        return valorDesconto;
    }
    
    public void setValorDesconto(BigDecimal valorDesconto) {
        this.valorDesconto = valorDesconto;
    }
    
    public BigDecimal getPercentualDesconto() {
        return percentualDesconto;
    }
    
    public void setPercentualDesconto(BigDecimal percentualDesconto) {
        this.percentualDesconto = percentualDesconto;
    }
    
    public BigDecimal getValorTotal() {
        return valorTotal;
    }
    
    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }
    
    public BigDecimal getRateioFrete() {
        return rateioFrete;
    }
    
    public void setRateioFrete(BigDecimal rateioFrete) {
        this.rateioFrete = rateioFrete;
    }
    
    public BigDecimal getRateioSeguro() {
        return rateioSeguro;
    }
    
    public void setRateioSeguro(BigDecimal rateioSeguro) {
        this.rateioSeguro = rateioSeguro;
    }
    
    public BigDecimal getRateioOutras() {
        return rateioOutras;
    }
    
    public void setRateioOutras(BigDecimal rateioOutras) {
        this.rateioOutras = rateioOutras;
    }
    
    public BigDecimal getCustoPrecoFinal() {
        return custoPrecoFinal;
    }
    
    public void setCustoPrecoFinal(BigDecimal custoPrecoFinal) {
        this.custoPrecoFinal = custoPrecoFinal;
    }
}

