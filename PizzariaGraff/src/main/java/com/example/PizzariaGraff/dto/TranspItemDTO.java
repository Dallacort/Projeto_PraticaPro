package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.TranspItem;
import java.time.LocalDateTime;

public class TranspItemDTO {
    private Long id;
    private String codigo;
    private String descricao;
    private Long transportadoraId;
    private String transportadoraNome;
    private String codigoTransp;
    private Boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    // Construtores
    public TranspItemDTO() {
    }
    
    public TranspItemDTO(Long id, String codigo, String descricao, Long transportadoraId, 
                        String transportadoraNome, String codigoTransp, Boolean ativo) {
        this.id = id;
        this.codigo = codigo;
        this.descricao = descricao;
        this.transportadoraId = transportadoraId;
        this.transportadoraNome = transportadoraNome;
        this.codigoTransp = codigoTransp;
        this.ativo = ativo;
    }
    
    // Método de conversão de Entity para DTO
    public static TranspItemDTO fromEntity(TranspItem transpItem) {
        if (transpItem == null) {
            return null;
        }
        
        TranspItemDTO dto = new TranspItemDTO();
        dto.setId(transpItem.getId());
        dto.setCodigo(transpItem.getCodigo());
        dto.setDescricao(transpItem.getDescricao());
        dto.setCodigoTransp(transpItem.getCodigoTransp());
        dto.setAtivo(transpItem.getAtivo());
        
        // Garantir que as datas nunca sejam nulas
        dto.setDataCadastro(transpItem.getDataCadastro() != null ? 
                           transpItem.getDataCadastro() : 
                           LocalDateTime.now());
        
        dto.setUltimaModificacao(transpItem.getUltimaModificacao() != null ? 
                                transpItem.getUltimaModificacao() : 
                                LocalDateTime.now());
        
        if (transpItem.getTransportadora() != null) {
            dto.setTransportadoraId(transpItem.getTransportadora().getId());
            dto.setTransportadoraNome(transpItem.getTransportadora().getRazaoSocial());
        }
        
        return dto;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
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

    public String getCodigoTransp() {
        return codigoTransp;
    }

    public void setCodigoTransp(String codigoTransp) {
        this.codigoTransp = codigoTransp;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
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