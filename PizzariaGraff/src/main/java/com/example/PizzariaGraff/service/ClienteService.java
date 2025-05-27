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
    
    public Cliente findByCpf(String cpf) {
        return clienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com o CPF: " + cpf));
    }
    
    public Cliente findByCnpj(String cnpj) {
        return clienteRepository.findByCnpj(cnpj)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com o CNPJ: " + cnpj));
    }
    
    public List<Cliente> findByCidadeId(Long cidadeId) {
        return clienteRepository.findByCidadeId(cidadeId);
    }
    
    public Cliente save(Cliente cliente) {
        return clienteRepository.save(cliente);
    }
    
    public void deleteById(Long id) {
        clienteRepository.deleteById(id);
    }
} 