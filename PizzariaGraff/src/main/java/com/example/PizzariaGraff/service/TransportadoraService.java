package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.dto.CidadeDTO;
import com.example.PizzariaGraff.dto.TransportadoraDTO;
import com.example.PizzariaGraff.model.Transportadora;
import com.example.PizzariaGraff.model.TransportadoraEmail;
import com.example.PizzariaGraff.model.TransportadoraTelefone;
import com.example.PizzariaGraff.repository.TransportadoraRepository;
import com.example.PizzariaGraff.repository.TransportadoraEmailRepository;
import com.example.PizzariaGraff.repository.TransportadoraTelefoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransportadoraService {
    
    @Autowired
    private TransportadoraRepository transportadoraRepository;
    
    @Autowired
    private TransportadoraEmailRepository emailRepository;
    
    @Autowired
    private TransportadoraTelefoneRepository telefoneRepository;

    @Autowired
    private CidadeService cidadeService;

    public List<TransportadoraDTO> findAll() {
        List<Transportadora> transportadoras = transportadoraRepository.findAll();
        return transportadoras.stream()
                .map(this::getTransportadoraWithEmailsAndTelefones)
                .collect(Collectors.toList());
    }

    public List<Transportadora> findAllActive() {
        return transportadoraRepository.findAllActive();
    }

    public Transportadora findById(Long id) {
        return transportadoraRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transportadora não encontrada com ID: " + id));
    }

    public List<Transportadora> findByTermo(String termo) {
        return transportadoraRepository.findByTermo(termo);
    }

    public Transportadora findByCpfCnpj(String cpfCnpj) {
        return transportadoraRepository.findByCpfCnpj(cpfCnpj);
    }

    @Transactional
    public Transportadora save(Transportadora transportadora) {
        // Validar CPF/CNPJ
        if (transportadora.getId() == null && transportadora.getCpfCnpj() != null) {
            Transportadora existente = transportadoraRepository.findByCpfCnpj(transportadora.getCpfCnpj());
            if (existente != null) {
                throw new RuntimeException("Já existe uma transportadora com este CPF/CNPJ");
            }
        }

        return transportadoraRepository.save(transportadora);
    }

    public TransportadoraDTO saveWithEmailsAndTelefones(TransportadoraDTO dto) {
        // Salvar a transportadora
        Transportadora transportadora = dto.toEntity();
        transportadora = save(transportadora);
        
        // Salvar emails adicionais
        if (dto.getEmailsAdicionais() != null && !dto.getEmailsAdicionais().isEmpty()) {
            // Remover emails existentes
            emailRepository.deleteByTransportadoraId(transportadora.getId());
            
            // Adicionar novos emails
            for (String email : dto.getEmailsAdicionais()) {
                if (email != null && !email.trim().isEmpty()) {
                    TransportadoraEmail transportadoraEmail = new TransportadoraEmail(transportadora.getId(), email.trim());
                    emailRepository.save(transportadoraEmail);
                }
            }
        }
        
        // Salvar telefones adicionais
        if (dto.getTelefonesAdicionais() != null && !dto.getTelefonesAdicionais().isEmpty()) {
            // Remover telefones existentes
            telefoneRepository.deleteByTransportadoraId(transportadora.getId());
            
            // Adicionar novos telefones
            for (String telefone : dto.getTelefonesAdicionais()) {
                if (telefone != null && !telefone.trim().isEmpty()) {
                    TransportadoraTelefone transportadoraTelefone = new TransportadoraTelefone(transportadora.getId(), telefone.trim());
                    telefoneRepository.save(transportadoraTelefone);
                }
            }
        }
        
        return getTransportadoraWithEmailsAndTelefones(transportadora.getId());
    }
    
    private TransportadoraDTO getTransportadoraWithEmailsAndTelefones(Transportadora transportadora) {
        return getTransportadoraWithEmailsAndTelefones(transportadora.getId());
    }

    public TransportadoraDTO getTransportadoraWithEmailsAndTelefones(Long id) {
        Transportadora transportadora = findById(id);
        TransportadoraDTO dto = TransportadoraDTO.fromEntity(transportadora);
        
        // Carregar cidade
        if (transportadora.getCidadeId() != null) {
            try {
                dto.setCidade(CidadeDTO.fromEntity(cidadeService.findById(transportadora.getCidadeId())));
            } catch (Exception e) {
                // Logar o erro, mas não impedir o resto do processo
                System.err.println("Erro ao buscar cidade para transportadora " + id + ": " + e.getMessage());
            }
        }

        // Carregar emails
        List<TransportadoraEmail> emails = emailRepository.findByTransportadoraId(id);
        dto.setEmailsAdicionais(emails.stream()
            .map(TransportadoraEmail::getEmail)
            .collect(Collectors.toList()));
        
        // Carregar telefones
        List<TransportadoraTelefone> telefones = telefoneRepository.findByTransportadoraId(id);
        dto.setTelefonesAdicionais(telefones.stream()
            .map(TransportadoraTelefone::getTelefone)
            .collect(Collectors.toList()));
        
        return dto;
    }

    @Transactional
    public void deleteById(Long id) {
        // Deletar emails e telefones relacionados
        emailRepository.deleteByTransportadoraId(id);
        telefoneRepository.deleteByTransportadoraId(id);
        
        // Deletar transportadora
        transportadoraRepository.deleteById(id);
    }
} 