package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Veiculo;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VeiculoDTO {
    private Long id;
    private String placa;
    private String modelo;
    private String marca;
    private Integer ano;
    private BigDecimal capacidade;
    private Long transportadoraId;
    private Boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaModificacao;

    // Construtores
    public VeiculoDTO() {}

    public VeiculoDTO(Long id, String placa, String modelo, String marca, Integer ano, 
                     BigDecimal capacidade, Long transportadoraId, Boolean ativo) {
        this.id = id;
        this.placa = placa;
        this.modelo = modelo;
        this.marca = marca;
        this.ano = ano;
        this.capacidade = capacidade;
        this.transportadoraId = transportadoraId;
        this.ativo = ativo;
    }

    // Método de conversão de Entity para DTO
    public static VeiculoDTO fromEntity(Veiculo veiculo) {
        if (veiculo == null) {
            return null;
        }
        
        VeiculoDTO dto = new VeiculoDTO();
        dto.setId(veiculo.getId());
        dto.setPlaca(veiculo.getPlaca());
        dto.setModelo(veiculo.getModelo());
        dto.setMarca(veiculo.getMarca());
        dto.setAno(veiculo.getAno());
        dto.setCapacidade(veiculo.getCapacidade());
        dto.setTransportadoraId(veiculo.getTransportadoraId());
        dto.setAtivo(veiculo.getAtivo());
        
        // Garantir que as datas nunca sejam nulas
        dto.setDataCadastro(veiculo.getDataCadastro() != null ? 
                           veiculo.getDataCadastro() : 
                           LocalDateTime.now());
        
        dto.setUltimaModificacao(veiculo.getUltimaModificacao() != null ? 
                                veiculo.getUltimaModificacao() : 
                                LocalDateTime.now());
        
        return dto;
    }

    // Método de conversão de DTO para Entity
    public Veiculo toEntity() {
        Veiculo veiculo = new Veiculo();
        veiculo.setId(this.id);
        veiculo.setPlaca(this.placa);
        veiculo.setModelo(this.modelo);
        veiculo.setMarca(this.marca);
        veiculo.setAno(this.ano);
        veiculo.setCapacidade(this.capacidade);
        veiculo.setTransportadoraId(this.transportadoraId);
        veiculo.setAtivo(this.ativo);
        veiculo.setDataCadastro(this.dataCadastro);
        veiculo.setUltimaModificacao(this.ultimaModificacao);
        return veiculo;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public Integer getAno() {
        return ano;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }

    public BigDecimal getCapacidade() {
        return capacidade;
    }

    public void setCapacidade(BigDecimal capacidade) {
        this.capacidade = capacidade;
    }

    public Long getTransportadoraId() {
        return transportadoraId;
    }

    public void setTransportadoraId(Long transportadoraId) {
        this.transportadoraId = transportadoraId;
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