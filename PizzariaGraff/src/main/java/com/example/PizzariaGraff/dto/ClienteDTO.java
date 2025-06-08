package com.example.PizzariaGraff.dto;

import com.example.PizzariaGraff.model.Cliente;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.CondicaoPagamento;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "DTO para representar um Cliente")
public class ClienteDTO {
    
    @Schema(description = "ID único do cliente", example = "1")
    private Long id;
    
    @Schema(description = "Nome do cliente", example = "João Silva", required = true)
    private String cliente;
    
    @Schema(description = "Apelido do cliente", example = "João")
    private String apelido;
    
    @Schema(description = "Bairro do cliente", example = "Centro")
    private String bairro;
    
    @Schema(description = "CEP do cliente", example = "01310100")
    private String cep;
    
    @Schema(description = "Número do endereço", example = "123")
    private String numero;
    
    @Schema(description = "Endereço do cliente", example = "Rua das Flores")
    private String endereco;
    
    @Schema(description = "ID da cidade", example = "1")
    private Long cidadeId;
    
    @Schema(description = "Nome da cidade")
    private String cidadeNome;
    
    @Schema(description = "ID do estado")
    private Long estadoId;
    
    @Schema(description = "Nome do estado")
    private String estadoNome;
    
    @Schema(description = "UF do estado")
    private String estadoUf;
    
    @Schema(description = "ID do país")
    private Long paisId;
    
    @Schema(description = "Nome do país")
    private String paisNome;
    
    @Schema(description = "Sigla do país")
    private String paisSigla;
    
    @Schema(description = "Código do país")
    private String paisCodigo;
    
    @Schema(description = "Complemento do endereço", example = "Apto 101")
    private String complemento;
    
    @Schema(description = "Limite de crédito", example = "1000.00")
    private BigDecimal limiteCredito;
    
    @Schema(description = "ID da Nacionalidade (País)", example = "1")
    private Long nacionalidadeId;
    
    @Schema(description = "RG ou Inscrição Estadual", example = "12345678901")
    private String rgInscricaoEstadual;
    
    @Schema(description = "CPF ou CNPJ", example = "12345678901")
    private String cpfCpnj;
    
    @Schema(description = "Data de nascimento", example = "1990-01-15")
    private LocalDate dataNascimento;
    
    @Schema(description = "Email", example = "joao@email.com")
    private String email;
    
    @Schema(description = "Telefone", example = "11999999999")
    private String telefone;
    
    @Schema(description = "Estado civil", example = "Solteiro")
    private String estadoCivil;
    
    @Schema(description = "Tipo (1-Pessoa Física, 2-Pessoa Jurídica)", example = "1")
    private Integer tipo;
    
    @Schema(description = "Sexo (M/F)", example = "M")
    private String sexo;
    
    @Schema(description = "ID da condição de pagamento", example = "1")
    private Long condicaoPagamentoId;
    
    @Schema(description = "Nome da condição de pagamento")
    private String condicaoPagamentoNome;
    
    @Schema(description = "Observação", example = "Cliente VIP")
    private String observacao;
    
    @Schema(description = "Indica se o cliente está ativo", example = "true")
    private Boolean ativo;
    
    @Schema(description = "Data de criação do registro")
    private LocalDateTime dataCriacao;
    
    @Schema(description = "Data da última alteração")
    private LocalDateTime dataAlteracao;

    // Constructors
    public ClienteDTO() {}

    public ClienteDTO(Cliente cliente) {
        this.id = cliente.getId();
        this.cliente = cliente.getCliente();
        this.apelido = cliente.getApelido();
        this.bairro = cliente.getBairro();
        this.cep = cliente.getCep();
        this.numero = cliente.getNumero();
        this.endereco = cliente.getEndereco();
        this.cidadeId = cliente.getCidadeId();
        this.complemento = cliente.getComplemento();
        this.limiteCredito = cliente.getLimiteCredito();
        this.nacionalidadeId = cliente.getNacionalidadeId();
        this.rgInscricaoEstadual = cliente.getRgInscricaoEstadual();
        this.cpfCpnj = cliente.getCpfCpnj();
        this.dataNascimento = cliente.getDataNascimento();
        this.email = cliente.getEmail();
        this.telefone = cliente.getTelefone();
        this.estadoCivil = cliente.getEstadoCivil();
        this.tipo = cliente.getTipo();
        this.sexo = cliente.getSexo();
        this.condicaoPagamentoId = cliente.getCondicaoPagamentoId();
        this.observacao = cliente.getObservacao();
        this.ativo = cliente.getAtivo();
        this.dataCriacao = cliente.getDataCriacao();
        this.dataAlteracao = cliente.getDataAlteracao();
        
        // Relacionamentos
        if (cliente.getCidade() != null) {
            this.cidadeNome = cliente.getCidade().getNome();
            
            // Informações do estado
            if (cliente.getCidade().getEstado() != null) {
                this.estadoId = cliente.getCidade().getEstado().getId();
                this.estadoNome = cliente.getCidade().getEstado().getNome();
                this.estadoUf = cliente.getCidade().getEstado().getUf();
                
                // Informações do país
                if (cliente.getCidade().getEstado().getPais() != null) {
                    this.paisId = cliente.getCidade().getEstado().getPais().getId();
                    this.paisNome = cliente.getCidade().getEstado().getPais().getNome();
                    this.paisSigla = cliente.getCidade().getEstado().getPais().getSigla();
                    this.paisCodigo = cliente.getCidade().getEstado().getPais().getCodigo();
                }
            }
        }
        
        if (cliente.getCondicaoPagamento() != null) {
            this.condicaoPagamentoNome = cliente.getCondicaoPagamento().getCondicaoPagamento();
        }
    }

    // Método para converter DTO para Entity
    public Cliente toEntity() {
        Cliente cliente = new Cliente();
        cliente.setId(this.id);
        cliente.setCliente(this.cliente);
        cliente.setApelido(this.apelido);
        cliente.setBairro(this.bairro);
        cliente.setCep(this.cep);
        cliente.setNumero(this.numero);
        cliente.setEndereco(this.endereco);
        cliente.setCidadeId(this.cidadeId);
        cliente.setComplemento(this.complemento);
        cliente.setLimiteCredito(this.limiteCredito);
        cliente.setNacionalidadeId(this.nacionalidadeId);
        cliente.setRgInscricaoEstadual(this.rgInscricaoEstadual);
        cliente.setCpfCpnj(this.cpfCpnj);
        cliente.setDataNascimento(this.dataNascimento);
        cliente.setEmail(this.email);
        cliente.setTelefone(this.telefone);
        cliente.setEstadoCivil(this.estadoCivil);
        cliente.setTipo(this.tipo);
        cliente.setSexo(this.sexo);
        cliente.setCondicaoPagamentoId(this.condicaoPagamentoId);
        cliente.setObservacao(this.observacao);
        cliente.setAtivo(this.ativo);
        cliente.setDataCriacao(this.dataCriacao);
        cliente.setDataAlteracao(this.dataAlteracao);
        return cliente;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCliente() {
        return cliente;
    }

    public void setCliente(String cliente) {
        this.cliente = cliente;
    }

    public String getApelido() {
        return apelido;
    }

    public void setApelido(String apelido) {
        this.apelido = apelido;
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

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
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

    public Long getEstadoId() {
        return estadoId;
    }

    public void setEstadoId(Long estadoId) {
        this.estadoId = estadoId;
    }

    public String getEstadoNome() {
        return estadoNome;
    }

    public void setEstadoNome(String estadoNome) {
        this.estadoNome = estadoNome;
    }

    public String getEstadoUf() {
        return estadoUf;
    }

    public void setEstadoUf(String estadoUf) {
        this.estadoUf = estadoUf;
    }

    public Long getPaisId() {
        return paisId;
    }

    public void setPaisId(Long paisId) {
        this.paisId = paisId;
    }

    public String getPaisNome() {
        return paisNome;
    }

    public void setPaisNome(String paisNome) {
        this.paisNome = paisNome;
    }

    public String getPaisSigla() {
        return paisSigla;
    }

    public void setPaisSigla(String paisSigla) {
        this.paisSigla = paisSigla;
    }

    public String getPaisCodigo() {
        return paisCodigo;
    }

    public void setPaisCodigo(String paisCodigo) {
        this.paisCodigo = paisCodigo;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public BigDecimal getLimiteCredito() {
        return limiteCredito;
    }

    public void setLimiteCredito(BigDecimal limiteCredito) {
        this.limiteCredito = limiteCredito;
    }

    public Long getNacionalidadeId() {
        return nacionalidadeId;
    }

    public void setNacionalidadeId(Long nacionalidadeId) {
        this.nacionalidadeId = nacionalidadeId;
    }

    public String getRgInscricaoEstadual() {
        return rgInscricaoEstadual;
    }

    public void setRgInscricaoEstadual(String rgInscricaoEstadual) {
        this.rgInscricaoEstadual = rgInscricaoEstadual;
    }

    public String getCpfCpnj() {
        return cpfCpnj;
    }

    public void setCpfCpnj(String cpfCpnj) {
        this.cpfCpnj = cpfCpnj;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEstadoCivil() {
        return estadoCivil;
    }

    public void setEstadoCivil(String estadoCivil) {
        this.estadoCivil = estadoCivil;
    }

    public Integer getTipo() {
        return tipo;
    }

    public void setTipo(Integer tipo) {
        this.tipo = tipo;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public Long getCondicaoPagamentoId() {
        return condicaoPagamentoId;
    }

    public void setCondicaoPagamentoId(Long condicaoPagamentoId) {
        this.condicaoPagamentoId = condicaoPagamentoId;
    }

    public String getCondicaoPagamentoNome() {
        return condicaoPagamentoNome;
    }

    public void setCondicaoPagamentoNome(String condicaoPagamentoNome) {
        this.condicaoPagamentoNome = condicaoPagamentoNome;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
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
} 