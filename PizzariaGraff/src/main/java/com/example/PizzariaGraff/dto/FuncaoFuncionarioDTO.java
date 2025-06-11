package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.FuncaoFuncionario;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Schema(description = "DTO para Função de Funcionário")
public class FuncaoFuncionarioDTO {
    
    @Schema(description = "ID da função", example = "1")
    private Long id;
    
    @Schema(description = "Nome da função do funcionário", example = "Atendente", required = true)
    private String funcaoFuncionario;
    
    @Schema(description = "Se a função requer CNH", example = "false")
    private Boolean requerCNH;
    
    @Schema(description = "Carga horária semanal", example = "40.00")
    private BigDecimal cargaHoraria;
    
    @Schema(description = "Descrição detalhada da função", example = "Responsável pelo atendimento ao cliente")
    private String descricao;
    
    @Schema(description = "Observações sobre a função", example = "Disponibilidade para fins de semana")
    private String observacao;
    
    @Schema(description = "Data da situação", example = "2024-01-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate situacao;
    
    @Schema(description = "Data de criação do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataCriacao;
    
    @Schema(description = "Data de alteração do registro", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataAlteracao;
    
    // Campos legados (compatibilidade) - OCULTOS NO JSON
    @Schema(description = "Salário base (legado)", example = "1500.00")
    private Double salarioBase;
    
    @Schema(description = "Status ativo/inativo", example = "true")
    private Boolean ativo;
    
    @JsonIgnore  // Ocultar no JSON - usar apenas dataCriacao
    @Schema(hidden = true)
    private LocalDateTime dataCadastro;
    
    @JsonIgnore  // Ocultar no JSON - usar apenas dataAlteracao
    @Schema(hidden = true)
    private LocalDateTime ultimaModificacao;
    
    // Construtores
    public FuncaoFuncionarioDTO() {}
    
    public FuncaoFuncionarioDTO(FuncaoFuncionario funcao) {
        this.id = funcao.getId();
        this.funcaoFuncionario = funcao.getFuncaoFuncionario();
        this.requerCNH = funcao.getRequerCNH();
        this.cargaHoraria = funcao.getCargaHoraria();
        this.descricao = funcao.getDescricao();
        this.observacao = funcao.getObservacao();
        this.situacao = funcao.getSituacao();
        this.dataCriacao = funcao.getDataCriacao();
        this.dataAlteracao = funcao.getDataAlteracao();
        
        // Campos legados
        this.salarioBase = funcao.getSalarioBase();
        this.ativo = funcao.getAtivo();
        this.dataCadastro = funcao.getDataCadastro();
        this.ultimaModificacao = funcao.getUltimaModificacao();
    }
    
    public static FuncaoFuncionarioDTO fromEntity(FuncaoFuncionario funcao) {
        if (funcao == null) {
            return null;
        }
        return new FuncaoFuncionarioDTO(funcao);
    }
    
    public FuncaoFuncionario toEntity() {
        FuncaoFuncionario funcao = new FuncaoFuncionario();
        funcao.setId(this.id);
        funcao.setFuncaoFuncionario(this.funcaoFuncionario);
        funcao.setRequerCNH(this.requerCNH != null ? this.requerCNH : false);
        funcao.setCargaHoraria(this.cargaHoraria);
        funcao.setDescricao(this.descricao);
        funcao.setObservacao(this.observacao);
        funcao.setSituacao(this.situacao);
        funcao.setDataCriacao(this.dataCriacao);
        funcao.setDataAlteracao(this.dataAlteracao);
        
        // Campos legados
        funcao.setSalarioBase(this.salarioBase);
        funcao.setAtivo(this.ativo != null ? this.ativo : true);
        funcao.setDataCadastro(this.dataCadastro);
        funcao.setUltimaModificacao(this.ultimaModificacao);
        
        return funcao;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFuncaoFuncionario() {
        return funcaoFuncionario;
    }

    public void setFuncaoFuncionario(String funcaoFuncionario) {
        this.funcaoFuncionario = funcaoFuncionario;
    }

    public Boolean getRequerCNH() {
        return requerCNH;
    }

    public void setRequerCNH(Boolean requerCNH) {
        this.requerCNH = requerCNH;
    }

    public BigDecimal getCargaHoraria() {
        return cargaHoraria;
    }

    public void setCargaHoraria(BigDecimal cargaHoraria) {
        this.cargaHoraria = cargaHoraria;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
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

    // Campos legados
    public Double getSalarioBase() {
        return salarioBase;
    }

    public void setSalarioBase(Double salarioBase) {
        this.salarioBase = salarioBase;
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