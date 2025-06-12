package com.example.PizzariaGraff.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Funcionario {
    private Long id;
    private String funcionario;  // varchar(255) NOT NULL
    private String apelido;      // varchar(60)
    private String telefone;     // varchar(20)
    private String email;        // varchar(100)
    private String endereco;     // varchar(200)
    private String numero;       // varchar(5)
    private String complemento;  // varchar(100)
    private String bairro;       // varchar(50)
    private String cep;          // varchar(9)
    private Long cidadeId;       // bigint(20) - FK para Cidade
    private LocalDate dataAdmissao; // date
    private LocalDate dataDemissao; // date
    private LocalDateTime dataCriacao; // timestamp NOT NULL
    private LocalDateTime dataAlteracao; // timestamp NOT NULL
    private String rgInscricaoEstadual; // varchar(14)
    private String cnh;          // varchar(25) - novo campo
    private LocalDate dataValidadeCnh; // date - novo campo
    private Integer sexo;        // int(11) - (1=Masculino, 2=Feminino)
    private String observacao;   // varchar(255) - novo campo
    private Integer estadoCivil; // int(11) - mudou de String para Integer
    private Integer salario;     // int(11) - novo campo
    private Long nacionalidadeId; // bigint(20) - FK para Pais (renomeado de nacionalidade)
    private LocalDate dataNascimento; // date - campo de data de nascimento
    private Long funcaoFuncionarioId; // bigint(20) - FK para FuncaoFuncionario
    private String cpfCpnj;     // varchar(14)
    private Boolean ativo;      // boolean - campo de controle
    private Integer tipo;       // int(11) - Tipo do funcionário (1=Pessoa Física, 2=Pessoa Jurídica)
    
    // Relacionamentos
    private Cidade cidade;
    private FuncaoFuncionario funcaoFuncionario;
    private Pais nacionalidade; // Relacionamento com Pais

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

    public Integer getTipo() {
        return tipo;
    }

    public void setTipo(Integer tipo) {
        this.tipo = tipo;
    }

    public Cidade getCidade() {
        return cidade;
    }

    public void setCidade(Cidade cidade) {
        this.cidade = cidade;
    }

    public FuncaoFuncionario getFuncaoFuncionario() {
        return funcaoFuncionario;
    }

    public void setFuncaoFuncionario(FuncaoFuncionario funcaoFuncionario) {
        this.funcaoFuncionario = funcaoFuncionario;
    }

    public Pais getNacionalidade() {
        return nacionalidade;
    }

    public void setNacionalidade(Pais nacionalidade) {
        this.nacionalidade = nacionalidade;
    }

    // Métodos auxiliares para compatibilidade com o repository
    public Integer getEstadoCivilInt() {
        return estadoCivil;
    }

    public void setEstadoCivilInt(Integer estadoCivil) {
        this.estadoCivil = estadoCivil;
    }

    public Integer getDataNascimentoAno() {
        return dataNascimento != null ? dataNascimento.getYear() : null;
    }

    public void setDataNascimentoAno(Integer ano) {
        this.dataNascimento = ano != null ? LocalDate.of(ano, 1, 1) : null;
    }
} 