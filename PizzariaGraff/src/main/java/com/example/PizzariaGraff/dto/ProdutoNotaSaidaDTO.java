package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.ProdutoNotaSaida;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "DTO para representar um Produto da Nota de Saída")
public class ProdutoNotaSaidaDTO {
    
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
    public ProdutoNotaSaidaDTO() {
        this.sequencia = 1;
        this.valorDesconto = BigDecimal.ZERO;
        this.percentualDesconto = BigDecimal.ZERO;
        this.rateioFrete = BigDecimal.ZERO;
        this.rateioSeguro = BigDecimal.ZERO;
        this.rateioOutras = BigDecimal.ZERO;
    }
    
    public ProdutoNotaSaidaDTO(ProdutoNotaSaida produtoNotaSaida) {
        this.produtoId = produtoNotaSaida.getProdutoId();
        this.sequencia = produtoNotaSaida.getSequencia();
        this.quantidade = produtoNotaSaida.getQuantidade();
        this.valorUnitario = produtoNotaSaida.getValorUnitario();
        this.valorDesconto = produtoNotaSaida.getValorDesconto();
        this.percentualDesconto = produtoNotaSaida.getPercentualDesconto();
        this.valorTotal = produtoNotaSaida.getValorTotal();
        this.rateioFrete = produtoNotaSaida.getRateioFrete();
        this.rateioSeguro = produtoNotaSaida.getRateioSeguro();
        this.rateioOutras = produtoNotaSaida.getRateioOutras();
        this.custoPrecoFinal = produtoNotaSaida.getCustoPrecoFinal();
        
        if (produtoNotaSaida.getProduto() != null) {
            this.produtoNome = produtoNotaSaida.getProduto().getProduto();
            this.produtoCodigo = produtoNotaSaida.getProduto().getCodigoBarras();
        }
    }
    
    // Método para converter DTO para Entity
    public ProdutoNotaSaida toEntity() {
        ProdutoNotaSaida produtoNotaSaida = new ProdutoNotaSaida();
        produtoNotaSaida.setProdutoId(this.produtoId);
        produtoNotaSaida.setSequencia(this.sequencia != null ? this.sequencia : 1);
        produtoNotaSaida.setQuantidade(this.quantidade);
        produtoNotaSaida.setValorUnitario(this.valorUnitario);
        produtoNotaSaida.setValorDesconto(this.valorDesconto != null ? this.valorDesconto : BigDecimal.ZERO);
        produtoNotaSaida.setPercentualDesconto(this.percentualDesconto != null ? this.percentualDesconto : BigDecimal.ZERO);
        produtoNotaSaida.setValorTotal(this.valorTotal);
        produtoNotaSaida.setRateioFrete(this.rateioFrete != null ? this.rateioFrete : BigDecimal.ZERO);
        produtoNotaSaida.setRateioSeguro(this.rateioSeguro != null ? this.rateioSeguro : BigDecimal.ZERO);
        produtoNotaSaida.setRateioOutras(this.rateioOutras != null ? this.rateioOutras : BigDecimal.ZERO);
        produtoNotaSaida.setCustoPrecoFinal(this.custoPrecoFinal);
        return produtoNotaSaida;
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

