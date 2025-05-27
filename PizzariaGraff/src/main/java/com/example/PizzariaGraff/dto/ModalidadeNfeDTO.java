package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.ModalidadeNfe;
import java.time.LocalDateTime;

public class ModalidadeNfeDTO {
    private Long id;
    private String codigo;
    private String descricao;
    private Boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    // Construtores
    public ModalidadeNfeDTO() {
    }
    
    public ModalidadeNfeDTO(Long id, String codigo, String descricao, Boolean ativo) {
        this.id = id;
        this.codigo = codigo;
        this.descricao = descricao;
        this.ativo = ativo;
    }
    
    // Método de conversão de Entity para DTO
    public static ModalidadeNfeDTO fromEntity(ModalidadeNfe modalidade) {
        if (modalidade == null) {
            return null;
        }
        
        ModalidadeNfeDTO dto = new ModalidadeNfeDTO();
        dto.setId(modalidade.getId());
        dto.setCodigo(modalidade.getCodigo());
        dto.setDescricao(modalidade.getDescricao());
        dto.setAtivo(modalidade.getAtivo());
        
        // Garantir que as datas nunca sejam nulas
        dto.setDataCadastro(modalidade.getDataCadastro() != null ? 
                           modalidade.getDataCadastro() : 
                           LocalDateTime.now());
        
        dto.setUltimaModificacao(modalidade.getUltimaModificacao() != null ? 
                                modalidade.getUltimaModificacao() : 
                                LocalDateTime.now());
        
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