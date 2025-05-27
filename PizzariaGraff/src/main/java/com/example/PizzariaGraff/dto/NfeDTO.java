package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class NfeDTO {
    private Long id;
    private String numero;
    private String serie;
    private String chaveAcesso;
    private LocalDate dataEmissao;
    private Long clienteId;
    private String clienteNome;
    private BigDecimal valorTotal;
    private Long formaPagamentoId;
    private String formaPagamentoNome;
    private Long condicaoPagamentoId;
    private String condicaoPagamento;
    private Long transportadoraId;
    private String transportadoraNome;
    private Long veiculoId;
    private String veiculoPlaca;
    private Long modalidadeId;
    private String modalidadeDescricao;
    private Boolean cancelada;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;

    public NfeDTO() {
    }

    public NfeDTO(Long id, String numero, String serie, String chaveAcesso, LocalDate dataEmissao, 
                 Long clienteId, String clienteNome, BigDecimal valorTotal,
                 Long formaPagamentoId, String formaPagamentoNome,
                 Long condicaoPagamentoId, String condicaoPagamento,
                 Long transportadoraId, String transportadoraNome,
                 Long veiculoId, String veiculoPlaca,
                 Long modalidadeId, String modalidadeDescricao,
                 Boolean cancelada, LocalDateTime dataCadastro,
                 LocalDateTime ultimaModificacao) {
        this.id = id;
        this.numero = numero;
        this.serie = serie;
        this.chaveAcesso = chaveAcesso;
        this.dataEmissao = dataEmissao;
        this.clienteId = clienteId;
        this.clienteNome = clienteNome;
        this.valorTotal = valorTotal;
        this.formaPagamentoId = formaPagamentoId;
        this.formaPagamentoNome = formaPagamentoNome;
        this.condicaoPagamentoId = condicaoPagamentoId;
        this.condicaoPagamento = condicaoPagamento;
        this.transportadoraId = transportadoraId;
        this.transportadoraNome = transportadoraNome;
        this.veiculoId = veiculoId;
        this.veiculoPlaca = veiculoPlaca;
        this.modalidadeId = modalidadeId;
        this.modalidadeDescricao = modalidadeDescricao;
        this.cancelada = cancelada;
        this.dataCadastro = dataCadastro;
        this.ultimaModificacao = ultimaModificacao;
    }

    public static NfeDTO fromEntity(Nfe nfe) {
        NfeDTO dto = new NfeDTO(
            nfe.getId(),
            nfe.getNumero(),
            nfe.getSerie(),
            nfe.getChaveAcesso(),
            nfe.getDataEmissao(),
            nfe.getCliente() != null ? nfe.getCliente().getId() : null,
            nfe.getCliente() != null ? nfe.getCliente().getNome() : null,
            nfe.getValorTotal(),
            nfe.getFormaPagamento() != null ? nfe.getFormaPagamento().getId() : null,
            nfe.getFormaPagamento() != null ? nfe.getFormaPagamento().getDescricao() : null,
            nfe.getCondicaoPagamento() != null ? nfe.getCondicaoPagamento().getId() : null,
            nfe.getCondicaoPagamento() != null ? nfe.getCondicaoPagamento().getCondicaoPagamento() : null,
            nfe.getTransportadora() != null ? nfe.getTransportadora().getId() : null,
            nfe.getTransportadora() != null ? nfe.getTransportadora().getRazaoSocial() : null,
            nfe.getVeiculo() != null ? nfe.getVeiculo().getId() : null,
            nfe.getVeiculo() != null ? nfe.getVeiculo().getPlaca() : null,
            nfe.getModalidade() != null ? nfe.getModalidade().getId() : null,
            nfe.getModalidade() != null ? nfe.getModalidade().getDescricao() : null,
            nfe.getCancelada(),
            null,
            null
        );
        
        // Garantir que as datas nunca sejam nulas
        dto.setDataCadastro(nfe.getDataCadastro() != null ? 
                           nfe.getDataCadastro() : 
                           LocalDateTime.now());
        
        dto.setUltimaModificacao(nfe.getUltimaModificacao() != null ? 
                                nfe.getUltimaModificacao() : 
                                LocalDateTime.now());
        
        return dto;
    }

    public Nfe toEntity() {
        Nfe nfe = new Nfe();
        nfe.setId(this.id);
        nfe.setNumero(this.numero);
        nfe.setSerie(this.serie);
        nfe.setChaveAcesso(this.chaveAcesso);
        nfe.setDataEmissao(this.dataEmissao);
        nfe.setValorTotal(this.valorTotal);
        nfe.setCancelada(this.cancelada);
        nfe.setDataCadastro(this.dataCadastro);
        nfe.setUltimaModificacao(this.ultimaModificacao);
        
        if (this.clienteId != null) {
            Cliente cliente = new Cliente();
            cliente.setId(this.clienteId);
            nfe.setCliente(cliente);
        }
        
        if (this.formaPagamentoId != null) {
            FormaPagamento formaPagamento = new FormaPagamento();
            formaPagamento.setId(this.formaPagamentoId);
            nfe.setFormaPagamento(formaPagamento);
        }
        
        if (this.condicaoPagamentoId != null) {
            CondicaoPagamento condicaoPgto = new CondicaoPagamento();
            condicaoPgto.setId(this.condicaoPagamentoId);
            nfe.setCondicaoPagamento(condicaoPgto);
        }
        
        if (this.transportadoraId != null) {
            Transportadora transportadora = new Transportadora();
            transportadora.setId(this.transportadoraId);
            nfe.setTransportadora(transportadora);
        }
        
        if (this.veiculoId != null) {
            Veiculo veiculo = new Veiculo();
            veiculo.setId(this.veiculoId);
            nfe.setVeiculo(veiculo);
        }
        
        if (this.modalidadeId != null) {
            ModalidadeNfe modalidade = new ModalidadeNfe();
            modalidade.setId(this.modalidadeId);
            nfe.setModalidade(modalidade);
        }
        
        return nfe;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }
    
    public String getSerie() {
        return serie;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }

    public String getChaveAcesso() {
        return chaveAcesso;
    }

    public void setChaveAcesso(String chaveAcesso) {
        this.chaveAcesso = chaveAcesso;
    }

    public LocalDate getDataEmissao() {
        return dataEmissao;
    }

    public void setDataEmissao(LocalDate dataEmissao) {
        this.dataEmissao = dataEmissao;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public void setClienteNome(String clienteNome) {
        this.clienteNome = clienteNome;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }
    
    public Long getFormaPagamentoId() {
        return formaPagamentoId;
    }

    public void setFormaPagamentoId(Long formaPagamentoId) {
        this.formaPagamentoId = formaPagamentoId;
    }

    public String getFormaPagamentoNome() {
        return formaPagamentoNome;
    }

    public void setFormaPagamentoNome(String formaPagamentoNome) {
        this.formaPagamentoNome = formaPagamentoNome;
    }

    public Long getCondicaoPagamentoId() {
        return condicaoPagamentoId;
    }

    public void setCondicaoPagamentoId(Long condicaoPagamentoId) {
        this.condicaoPagamentoId = condicaoPagamentoId;
    }

    public String getCondicaoPagamento() {
        return condicaoPagamento;
    }

    public void setCondicaoPagamento(String condicaoPagamento) {
        this.condicaoPagamento = condicaoPagamento;
    }

    public Long getTransportadoraId() {
        return transportadoraId;
    }

    public void setTransportadoraId(Long transportadoraId) {
        this.transportadoraId = transportadoraId;
    }

    public String getTransportadoraNome() {
        return transportadoraNome;
    }

    public void setTransportadoraNome(String transportadoraNome) {
        this.transportadoraNome = transportadoraNome;
    }

    public Long getVeiculoId() {
        return veiculoId;
    }

    public void setVeiculoId(Long veiculoId) {
        this.veiculoId = veiculoId;
    }

    public String getVeiculoPlaca() {
        return veiculoPlaca;
    }

    public void setVeiculoPlaca(String veiculoPlaca) {
        this.veiculoPlaca = veiculoPlaca;
    }

    public Long getModalidadeId() {
        return modalidadeId;
    }

    public void setModalidadeId(Long modalidadeId) {
        this.modalidadeId = modalidadeId;
    }

    public String getModalidadeDescricao() {
        return modalidadeDescricao;
    }

    public void setModalidadeDescricao(String modalidadeDescricao) {
        this.modalidadeDescricao = modalidadeDescricao;
    }

    public Boolean getCancelada() {
        return cancelada;
    }

    public void setCancelada(Boolean cancelada) {
        this.cancelada = cancelada;
    }

    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public LocalDateTime getUltimaModificacao() {
        return ultimaModificacao;
    }

    public void setUltimaModificacao(LocalDateTime ultimaModificacao) {
        this.ultimaModificacao = ultimaModificacao;
    }
} 