package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Cliente;
import com.example.PizzariaGraff.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {
    
    private final ClienteRepository clienteRepository;
    
    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }
    
    public List<Cliente> findAll() {
        return clienteRepository.findAll();
    }
    
    public Cliente findById(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com o ID: " + id));
    }
    
    public Cliente findByCpfCpnj(String cpfCpnj) {
        return clienteRepository.findByCpfCpnj(cpfCpnj)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com o CPF/CNPJ: " + cpfCpnj));
    }
    
    public List<Cliente> findByCidadeId(Long cidadeId) {
        return clienteRepository.findByCidadeId(cidadeId);
    }
    
    public Cliente save(Cliente cliente) {
        // Validações básicas antes de salvar
        if (cliente.getCliente() == null || cliente.getCliente().trim().isEmpty()) {
            throw new RuntimeException("Nome do cliente é obrigatório");
        }
        
        return clienteRepository.save(cliente);
    }
    
    public void deleteById(Long id) {
        clienteRepository.deleteById(id);
    }
} 