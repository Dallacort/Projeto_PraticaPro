package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Funcionario;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "DTO para representar um Funcionário")
public class FuncionarioDTO {
    
    @Schema(description = "ID único do funcionário", example = "1")
    private Long id;
    
    @Schema(description = "Nome do funcionário", example = "Maria Santos", required = true)
    private String funcionario;
    
    @Schema(description = "Apelido do funcionário", example = "Maria")
    private String apelido;
    
    @Schema(description = "Telefone", example = "11888888888")
    private String telefone;
    
    @Schema(description = "Email", example = "maria@email.com")
    private String email;
    
    @Schema(description = "Endereço do funcionário", example = "Rua das Palmeiras")
    private String endereco;
    
    @Schema(description = "Número do endereço", example = "456")
    private String numero;
    
    @Schema(description = "Complemento do endereço", example = "Sala 201")
    private String complemento;
    
    @Schema(description = "Bairro do funcionário", example = "Centro")
    private String bairro;
    
    @Schema(description = "CEP do funcionário", example = "01310100")
    private String cep;
    
    @Schema(description = "ID da cidade", example = "1")
    private Long cidadeId;
    
    @Schema(description = "Nome da cidade")
    private String cidadeNome;
    
    @Schema(description = "Data de admissão", example = "2024-01-15")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataAdmissao;
    
    @Schema(description = "Data de demissão", example = "2024-12-31")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataDemissao;
    
    @Schema(description = "Data de criação do registro")
    private LocalDateTime dataCriacao;
    
    @Schema(description = "Data da última alteração")
    private LocalDateTime dataAlteracao;
    
    @Schema(description = "RG ou Inscrição Estadual", example = "123456789")
    private String rgInscricaoEstadual;
    
    @Schema(description = "CNH", example = "12345678901")
    private String cnh;
    
    @Schema(description = "Data de validade da CNH", example = "2025-12-31")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataValidadeCnh;
    
    @Schema(description = "Sexo (1-Masculino, 2-Feminino)", example = "2")
    private Integer sexo;
    
    @Schema(description = "Observação", example = "Funcionário exemplar")
    private String observacao;
    
    @Schema(description = "Estado civil (código)", example = "1")
    private Integer estadoCivil;
    
    @Schema(description = "Salário", example = "5000")
    private Integer salario;
    
    @Schema(description = "ID da nacionalidade (FK para Pais)", example = "1")
    private Long nacionalidadeId;
    
    @Schema(description = "Nome da nacionalidade")
    private String nacionalidadeNome;
    
    @Schema(description = "Data de nascimento", example = "1990-05-15")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataNascimento;
    
    @Schema(description = "ID da função do funcionário", example = "1")
    private Long funcaoFuncionarioId;
    
    @Schema(description = "Nome da função do funcionário")
    private String funcaoFuncionarioNome;
    
    @Schema(description = "CPF ou CNPJ", example = "98765432101")
    private String cpfCpnj;
    
    @Schema(description = "Status ativo/inativo", example = "true")
    private Boolean ativo;

    // Constructors
    public FuncionarioDTO() {}

    public FuncionarioDTO(Funcionario funcionario) {
        this.id = funcionario.getId();
        this.funcionario = funcionario.getFuncionario();
        this.apelido = funcionario.getApelido();
        this.telefone = funcionario.getTelefone();
        this.email = funcionario.getEmail();
        this.endereco = funcionario.getEndereco();
        this.numero = funcionario.getNumero();
        this.complemento = funcionario.getComplemento();
        this.bairro = funcionario.getBairro();
        this.cep = funcionario.getCep();
        this.cidadeId = funcionario.getCidadeId();
        this.dataAdmissao = funcionario.getDataAdmissao();
        this.dataDemissao = funcionario.getDataDemissao();
        this.dataCriacao = funcionario.getDataCriacao();
        this.dataAlteracao = funcionario.getDataAlteracao();
        this.rgInscricaoEstadual = funcionario.getRgInscricaoEstadual();
        this.cnh = funcionario.getCnh();
        this.dataValidadeCnh = funcionario.getDataValidadeCnh();
        this.sexo = funcionario.getSexo();
        this.observacao = funcionario.getObservacao();
        this.estadoCivil = funcionario.getEstadoCivil();
        this.salario = funcionario.getSalario();
        this.nacionalidadeId = funcionario.getNacionalidadeId();
        this.dataNascimento = funcionario.getDataNascimento();
        this.funcaoFuncionarioId = funcionario.getFuncaoFuncionarioId();
        this.cpfCpnj = funcionario.getCpfCpnj();
        this.ativo = funcionario.getAtivo();
        
        // Relacionamentos
        if (funcionario.getCidade() != null) {
            this.cidadeNome = funcionario.getCidade().getNome();
        }
        
        if (funcionario.getFuncaoFuncionario() != null) {
            this.funcaoFuncionarioNome = funcionario.getFuncaoFuncionario().getFuncaoFuncionario();
        }
        
        if (funcionario.getNacionalidade() != null) {
            this.nacionalidadeNome = funcionario.getNacionalidade().getNome();
        }
    }

    // Método para converter DTO para Entity
    public Funcionario toEntity() {
        Funcionario funcionario = new Funcionario();
        funcionario.setId(this.id);
        funcionario.setFuncionario(this.funcionario);
        funcionario.setApelido(this.apelido);
        funcionario.setTelefone(this.telefone);
        funcionario.setEmail(this.email);
        funcionario.setEndereco(this.endereco);
        funcionario.setNumero(this.numero);
        funcionario.setComplemento(this.complemento);
        funcionario.setBairro(this.bairro);
        funcionario.setCep(this.cep);
        funcionario.setCidadeId(this.cidadeId);
        funcionario.setDataAdmissao(this.dataAdmissao);
        funcionario.setDataDemissao(this.dataDemissao);
        funcionario.setDataCriacao(this.dataCriacao);
        funcionario.setDataAlteracao(this.dataAlteracao);
        funcionario.setRgInscricaoEstadual(this.rgInscricaoEstadual);
        funcionario.setCnh(this.cnh);
        funcionario.setDataValidadeCnh(this.dataValidadeCnh);
        funcionario.setSexo(this.sexo);
        funcionario.setObservacao(this.observacao);
        funcionario.setEstadoCivil(this.estadoCivil);
        funcionario.setSalario(this.salario);
        funcionario.setNacionalidadeId(this.nacionalidadeId);
        funcionario.setDataNascimento(this.dataNascimento);
        funcionario.setFuncaoFuncionarioId(this.funcaoFuncionarioId);
        funcionario.setCpfCpnj(this.cpfCpnj);
        funcionario.setAtivo(this.ativo);
        return funcionario;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFuncionario() {
        return funcionario;
    }

    public void setFuncionario(String funcionario) {
        this.funcionario = funcionario;
    }

    public String getApelido() {
        return apelido;
    }

    public void setApelido(String apelido) {
        this.apelido = apelido;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public Long getCidadeId() {
        return cidadeId;
    }

    public void setCidadeId(Long cidadeId) {
        this.cidadeId = cidadeId;
    }

    public String getCidadeNome() {
        return cidadeNome;
    }

    public void setCidadeNome(String cidadeNome) {
        this.cidadeNome = cidadeNome;
    }

    public LocalDate getDataAdmissao() {
        return dataAdmissao;
    }

    public void setDataAdmissao(LocalDate dataAdmissao) {
        this.dataAdmissao = dataAdmissao;
    }

    public LocalDate getDataDemissao() {
        return dataDemissao;
    }

    public void setDataDemissao(LocalDate dataDemissao) {
        this.dataDemissao = dataDemissao;
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

    public String getRgInscricaoEstadual() {
        return rgInscricaoEstadual;
    }

    public void setRgInscricaoEstadual(String rgInscricaoEstadual) {
        this.rgInscricaoEstadual = rgInscricaoEstadual;
    }

    public String getCnh() {
        return cnh;
    }

    public void setCnh(String cnh) {
        this.cnh = cnh;
    }

    public LocalDate getDataValidadeCnh() {
        return dataValidadeCnh;
    }

    public void setDataValidadeCnh(LocalDate dataValidadeCnh) {
        this.dataValidadeCnh = dataValidadeCnh;
    }

    public Integer getSexo() {
        return sexo;
    }

    public void setSexo(Integer sexo) {
        this.sexo = sexo;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public Integer getEstadoCivil() {
        return estadoCivil;
    }

    public void setEstadoCivil(Integer estadoCivil) {
        this.estadoCivil = estadoCivil;
    }

    public Integer getSalario() {
        return salario;
    }

    public void setSalario(Integer salario) {
        this.salario = salario;
    }

    public Long getNacionalidadeId() {
        return nacionalidadeId;
    }

    public void setNacionalidadeId(Long nacionalidadeId) {
        this.nacionalidadeId = nacionalidadeId;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public Long getFuncaoFuncionarioId() {
        return funcaoFuncionarioId;
    }

    public void setFuncaoFuncionarioId(Long funcaoFuncionarioId) {
        this.funcaoFuncionarioId = funcaoFuncionarioId;
    }

    public String getFuncaoFuncionarioNome() {
        return funcaoFuncionarioNome;
    }

    public void setFuncaoFuncionarioNome(String funcaoFuncionarioNome) {
        this.funcaoFuncionarioNome = funcaoFuncionarioNome;
    }

    public String getCpfCpnj() {
        return cpfCpnj;
    }

    public void setCpfCpnj(String cpfCpnj) {
        this.cpfCpnj = cpfCpnj;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public String getNacionalidadeNome() {
        return nacionalidadeNome;
    }

    public void setNacionalidadeNome(String nacionalidadeNome) {
        this.nacionalidadeNome = nacionalidadeNome;
    }
} 