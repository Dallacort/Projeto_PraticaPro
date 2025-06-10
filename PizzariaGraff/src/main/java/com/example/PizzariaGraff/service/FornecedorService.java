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
        
        if (fornecedor.getEmail() != null) {
            String emailNormalizado = fornecedor.getEmail().trim().toLowerCase();
            fornecedor.setEmail(emailNormalizado);
        }
        
        // Validação básica
        if (fornecedor.getFornecedor() == null || fornecedor.getFornecedor().trim().isEmpty()) {
            throw new RuntimeException("O nome do fornecedor é obrigatório");
        }
        
        // CPF/CNPJ é obrigatório apenas para brasileiros (nacionalidadeId = 1)
        if (fornecedor.getNacionalidadeId() != null && fornecedor.getNacionalidadeId() == 1) {
            if (fornecedor.getCpfCnpj() == null || fornecedor.getCpfCnpj().trim().isEmpty()) {
                throw new RuntimeException("O CPF/CNPJ é obrigatório para fornecedores brasileiros");
            }
        }
        
        return fornecedorRepository.save(fornecedor);
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