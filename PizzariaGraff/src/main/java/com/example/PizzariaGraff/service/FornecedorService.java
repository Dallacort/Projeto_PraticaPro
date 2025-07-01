package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Fornecedor;
import com.example.PizzariaGraff.model.FornecedorEmail;
import com.example.PizzariaGraff.model.FornecedorTelefone;
import com.example.PizzariaGraff.repository.FornecedorRepository;
import com.example.PizzariaGraff.repository.FornecedorEmailRepository;
import com.example.PizzariaGraff.repository.FornecedorTelefoneRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;
    private final FornecedorEmailRepository fornecedorEmailRepository;
    private final FornecedorTelefoneRepository fornecedorTelefoneRepository;

    public FornecedorService(FornecedorRepository fornecedorRepository, 
                           FornecedorEmailRepository fornecedorEmailRepository,
                           FornecedorTelefoneRepository fornecedorTelefoneRepository) {
        this.fornecedorRepository = fornecedorRepository;
        this.fornecedorEmailRepository = fornecedorEmailRepository;
        this.fornecedorTelefoneRepository = fornecedorTelefoneRepository;
    }

    public List<Fornecedor> findAll() {
        return fornecedorRepository.findAll();
    }
    
    public Fornecedor findById(Long id) {
        return fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado com o ID: " + id));
    }
    
    public List<Fornecedor> findByFornecedor(String nome) {
        return fornecedorRepository.findByFornecedor(nome);
    }
    
    public Fornecedor save(Fornecedor fornecedor) {
        // Normalização de dados
        if (fornecedor.getCpfCnpj() != null && !fornecedor.getCpfCnpj().trim().isEmpty()) {
            String cpfCnpjLimpo = fornecedor.getCpfCnpj().replaceAll("[^0-9]", "");
            fornecedor.setCpfCnpj(cpfCnpjLimpo);
        }
        
        if (fornecedor.getEmail() != null && !fornecedor.getEmail().trim().isEmpty()) {
            String emailNormalizado = fornecedor.getEmail().trim().toLowerCase();
            fornecedor.setEmail(emailNormalizado);
        }
        
        // Validações obrigatórias
        validarCamposObrigatorios(fornecedor);
        
        // Validação e verificação de duplicatas de CPF/CNPJ
        if (fornecedor.getCpfCnpj() != null && !fornecedor.getCpfCnpj().trim().isEmpty()) {
            validarCpfCnpj(fornecedor.getCpfCnpj(), fornecedor.getTipo());
            verificarCpfCnpjDuplicado(fornecedor.getCpfCnpj(), fornecedor.getId());
        }
        
        return fornecedorRepository.save(fornecedor);
    }
    
    private void validarCamposObrigatorios(Fornecedor fornecedor) {
        if (fornecedor.getFornecedor() == null || fornecedor.getFornecedor().trim().isEmpty()) {
            throw new RuntimeException("O nome do fornecedor é obrigatório");
        }
        
        if (fornecedor.getTelefone() == null || fornecedor.getTelefone().trim().isEmpty()) {
            throw new RuntimeException("O telefone é obrigatório");
        }
        
        if (fornecedor.getCidadeId() == null) {
            throw new RuntimeException("A cidade é obrigatória");
        }
        
        if (fornecedor.getTipo() == null) {
            throw new RuntimeException("O tipo (Pessoa Física/Jurídica) é obrigatório");
        }
        
        if (fornecedor.getEndereco() == null || fornecedor.getEndereco().trim().isEmpty()) {
            throw new RuntimeException("O endereço é obrigatório");
        }
        
        if (fornecedor.getNumero() == null || fornecedor.getNumero().trim().isEmpty()) {
            throw new RuntimeException("O número do endereço é obrigatório");
        }
        
        if (fornecedor.getBairro() == null || fornecedor.getBairro().trim().isEmpty()) {
            throw new RuntimeException("O bairro é obrigatório");
        }
        
        if (fornecedor.getCep() == null || fornecedor.getCep().trim().isEmpty()) {
            throw new RuntimeException("O CEP é obrigatório");
        }
        
        if (fornecedor.getCondicaoPagamentoId() == null) {
            throw new RuntimeException("A condição de pagamento é obrigatória");
        }
        
        if (fornecedor.getNacionalidadeId() == null) {
            throw new RuntimeException("A nacionalidade é obrigatória");
        }
        
        // CPF/CNPJ é obrigatório apenas para brasileiros (nacionalidadeId = 1)
        if (fornecedor.getNacionalidadeId() != null && fornecedor.getNacionalidadeId() == 1) {
            if (fornecedor.getCpfCnpj() == null || fornecedor.getCpfCnpj().trim().isEmpty()) {
                String documento = fornecedor.getTipo() == 1 ? "CPF" : "CNPJ";
                throw new RuntimeException("O " + documento + " é obrigatório para fornecedores brasileiros");
            }
        }
    }
    
    private void validarCpfCnpj(String cpfCnpj, Integer tipo) {
        if (cpfCnpj == null || cpfCnpj.trim().isEmpty()) {
            return; // Já validado na função anterior se obrigatório
        }
        
        String documento = cpfCnpj.replaceAll("[^0-9]", "");
        
        if (tipo == 1) { // Pessoa Física - CPF
            if (documento.length() != 11) {
                throw new RuntimeException("CPF deve conter exatamente 11 dígitos");
            }
            if (!validarCPF(documento)) {
                throw new RuntimeException("CPF inválido");
            }
        } else if (tipo == 2) { // Pessoa Jurídica - CNPJ
            if (documento.length() != 14) {
                throw new RuntimeException("CNPJ deve conter exatamente 14 dígitos");
            }
            if (!validarCNPJ(documento)) {
                throw new RuntimeException("CNPJ inválido");
            }
        }
    }
    
    private void verificarCpfCnpjDuplicado(String cpfCnpj, Long fornecedorId) {
        if (cpfCnpj == null || cpfCnpj.trim().isEmpty()) {
            return;
        }
        
        List<Fornecedor> fornecedoresExistentes = fornecedorRepository.findByCpfCnpj(cpfCnpj);
        
        for (Fornecedor existente : fornecedoresExistentes) {
            // Se é um fornecedor diferente (não é uma atualização do mesmo)
            if (fornecedorId == null || !existente.getId().equals(fornecedorId)) {
                String documento = existente.getTipo() == 1 ? "CPF" : "CNPJ";
                throw new RuntimeException("Já existe um fornecedor cadastrado com este " + documento);
            }
        }
    }
    
    private boolean validarCPF(String cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replaceAll("[^0-9]", "");
        
        // Verifica se tem 11 dígitos
        if (cpf.length() != 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (cpf.matches("(\\d)\\1{10}")) return false;
        
        // Calcula o primeiro dígito verificador
        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
        }
        int primeiroDigito = 11 - (soma % 11);
        if (primeiroDigito >= 10) primeiroDigito = 0;
        
        // Calcula o segundo dígito verificador
        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
        }
        int segundoDigito = 11 - (soma % 11);
        if (segundoDigito >= 10) segundoDigito = 0;
        
        // Verifica se os dígitos calculados conferem com os informados
        return Character.getNumericValue(cpf.charAt(9)) == primeiroDigito &&
               Character.getNumericValue(cpf.charAt(10)) == segundoDigito;
    }
    
    private boolean validarCNPJ(String cnpj) {
        // Remove caracteres não numéricos
        cnpj = cnpj.replaceAll("[^0-9]", "");
        
        // Verifica se tem 14 dígitos
        if (cnpj.length() != 14) return false;
        
        // Verifica se todos os dígitos são iguais
        if (cnpj.matches("(\\d)\\1{13}")) return false;
        
        // Calcula o primeiro dígito verificador
        int[] peso1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int soma = 0;
        for (int i = 0; i < 12; i++) {
            soma += Character.getNumericValue(cnpj.charAt(i)) * peso1[i];
        }
        int primeiroDigito = 11 - (soma % 11);
        if (primeiroDigito >= 10) primeiroDigito = 0;
        
        // Calcula o segundo dígito verificador
        int[] peso2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        soma = 0;
        for (int i = 0; i < 13; i++) {
            soma += Character.getNumericValue(cnpj.charAt(i)) * peso2[i];
        }
        int segundoDigito = 11 - (soma % 11);
        if (segundoDigito >= 10) segundoDigito = 0;
        
        // Verifica se os dígitos calculados conferem com os informados
        return Character.getNumericValue(cnpj.charAt(12)) == primeiroDigito &&
               Character.getNumericValue(cnpj.charAt(13)) == segundoDigito;
    }
    
    public void deleteById(Long id) {
        fornecedorRepository.deleteById(id);
    }

    // Métodos para gerenciar múltiplos emails
    public List<FornecedorEmail> getEmailsByFornecedorId(Long fornecedorId) {
        return fornecedorEmailRepository.findByFornecedorId(fornecedorId);
    }

    public FornecedorEmail saveEmail(FornecedorEmail email) {
        return fornecedorEmailRepository.save(email);
    }

    public void deleteEmail(Long emailId) {
        fornecedorEmailRepository.deleteById(emailId);
    }

    public void setPrincipalEmail(Long fornecedorId, Long emailId) {
        fornecedorEmailRepository.setPrincipal(fornecedorId, emailId);
    }

    // Métodos para gerenciar múltiplos telefones
    public List<FornecedorTelefone> getTelefonesByFornecedorId(Long fornecedorId) {
        return fornecedorTelefoneRepository.findByFornecedorId(fornecedorId);
    }

    public FornecedorTelefone saveTelefone(FornecedorTelefone telefone) {
        return fornecedorTelefoneRepository.save(telefone);
    }

    public void deleteTelefone(Long telefoneId) {
        fornecedorTelefoneRepository.deleteById(telefoneId);
    }

    public void setPrincipalTelefone(Long fornecedorId, Long telefoneId) {
        fornecedorTelefoneRepository.setPrincipal(fornecedorId, telefoneId);
    }

    // Método para processar múltiplos emails e telefones do frontend
    public void processarMultiplosContatos(Long fornecedorId, List<String> emails, List<String> telefones) {
        // Processar emails
        if (emails != null && !emails.isEmpty()) {
            List<FornecedorEmail> emailsExistentes = fornecedorEmailRepository.findByFornecedorId(fornecedorId);
            
            // Desativar emails existentes que não estão na nova lista
            for (FornecedorEmail emailExistente : emailsExistentes) {
                if (!emails.contains(emailExistente.getEmail())) {
                    emailExistente.setAtivo(false);
                    fornecedorEmailRepository.save(emailExistente);
                }
            }
            
            // Adicionar novos emails
            for (int i = 0; i < emails.size(); i++) {
                String email = emails.get(i);
                if (email != null && !email.trim().isEmpty()) {
                    boolean exists = emailsExistentes.stream()
                        .anyMatch(e -> e.getEmail().equals(email) && e.getAtivo());
                    
                    if (!exists) {
                        FornecedorEmail novoEmail = new FornecedorEmail();
                        novoEmail.setFornecedorId(fornecedorId);
                        novoEmail.setEmail(email.trim());
                        novoEmail.setTipo("COMERCIAL");
                        novoEmail.setPrincipal(i == 0); // Primeiro email é principal
                        novoEmail.setAtivo(true);
                        fornecedorEmailRepository.save(novoEmail);
                    }
                }
            }
        }

        // Processar telefones
        if (telefones != null && !telefones.isEmpty()) {
            List<FornecedorTelefone> telefonesExistentes = fornecedorTelefoneRepository.findByFornecedorId(fornecedorId);
            
            // Desativar telefones existentes que não estão na nova lista
            for (FornecedorTelefone telefoneExistente : telefonesExistentes) {
                if (!telefones.contains(telefoneExistente.getTelefone())) {
                    telefoneExistente.setAtivo(false);
                    fornecedorTelefoneRepository.save(telefoneExistente);
                }
            }
            
            // Adicionar novos telefones
            for (int i = 0; i < telefones.size(); i++) {
                String telefone = telefones.get(i);
                if (telefone != null && !telefone.trim().isEmpty()) {
                    boolean exists = telefonesExistentes.stream()
                        .anyMatch(t -> t.getTelefone().equals(telefone) && t.getAtivo());
                    
                    if (!exists) {
                        FornecedorTelefone novoTelefone = new FornecedorTelefone();
                        novoTelefone.setFornecedorId(fornecedorId);
                        novoTelefone.setTelefone(telefone.trim());
                        novoTelefone.setTipo("COMERCIAL");
                        novoTelefone.setPrincipal(i == 0); // Primeiro telefone é principal
                        novoTelefone.setAtivo(true);
                        fornecedorTelefoneRepository.save(novoTelefone);
                    }
                }
            }
        }
    }
} 