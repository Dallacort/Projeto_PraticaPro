package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.MovimentacaoNfe;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class MovimentacaoNfeDTO {
    private Long id;
    private Long nfeId;
    private String nfeNumero;
    private String dataMovimentacao;
    private String status;
    private String descricao;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;
    
    // Construtores
    public MovimentacaoNfeDTO() {
    }
    
    public MovimentacaoNfeDTO(Long id, Long nfeId, String nfeNumero, String dataMovimentacao, 
                            String status, String descricao) {
        this.id = id;
        this.nfeId = nfeId;
        this.nfeNumero = nfeNumero;
        this.dataMovimentacao = dataMovimentacao;
        this.status = status;
        this.descricao = descricao;
    }
    
    // Método de conversão de Entity para DTO
    public static MovimentacaoNfeDTO fromEntity(MovimentacaoNfe movimentacao) {
        if (movimentacao == null) {
            return null;
        }
        
        MovimentacaoNfeDTO dto = new MovimentacaoNfeDTO();
        dto.setId(movimentacao.getId());
        
        if (movimentacao.getNfe() != null) {
            dto.setNfeId(movimentacao.getNfe().getId());
            dto.setNfeNumero(movimentacao.getNfe().getNumero());
        }
        
        if (movimentacao.getDataMovimentacao() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
            dto.setDataMovimentacao(movimentacao.getDataMovimentacao().format(formatter));
        }
        
        dto.setStatus(movimentacao.getStatus());
        dto.setDescricao(movimentacao.getDescricao());
        
        // Garantir que as datas nunca sejam nulas
        dto.setDataCadastro(movimentacao.getDataCadastro() != null ? 
                           movimentacao.getDataCadastro() : 
                           LocalDateTime.now());
        
        dto.setUltimaModificacao(movimentacao.getUltimaModificacao() != null ? 
                                movimentacao.getUltimaModificacao() : 
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

    public Long getNfeId() {
        return nfeId;
    }

    public void setNfeId(Long nfeId) {
        this.nfeId = nfeId;
    }

    public String getNfeNumero() {
        return nfeNumero;
    }

    public void setNfeNumero(String nfeNumero) {
        this.nfeNumero = nfeNumero;
    }

    public String getDataMovimentacao() {
        return dataMovimentacao;
    }

    public void setDataMovimentacao(String dataMovimentacao) {
        this.dataMovimentacao = dataMovimentacao;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
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