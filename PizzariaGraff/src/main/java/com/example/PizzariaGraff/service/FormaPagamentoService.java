package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.FormaPagamento;
import com.example.PizzariaGraff.repository.FormaPagamentoRepository;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

@Service
public class FormaPagamentoService {
    
    private final FormaPagamentoRepository formaPagamentoRepository;
    
    public FormaPagamentoService(FormaPagamentoRepository formaPagamentoRepository) {
        this.formaPagamentoRepository = formaPagamentoRepository;
    }
    
    public List<FormaPagamento> findAll() {
        try {
            System.out.println("FormaPagamentoService: Buscando todas as formas de pagamento");
            List<FormaPagamento> result = formaPagamentoRepository.findAll();
            System.out.println("FormaPagamentoService: " + result.size() + " formas de pagamento encontradas");
            return result;
        } catch (Exception e) {
            System.err.println("FormaPagamentoService ERROR: Erro ao buscar todas as formas de pagamento: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public List<FormaPagamento> findByAtivoTrue() {
        try {
            System.out.println("FormaPagamentoService: Buscando formas de pagamento ativas");
            List<FormaPagamento> result = formaPagamentoRepository.findByAtivoTrue();
            System.out.println("FormaPagamentoService: " + result.size() + " formas de pagamento ativas encontradas");
            return result;
        } catch (Exception e) {
            System.err.println("FormaPagamentoService ERROR: Erro ao buscar formas de pagamento ativas: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public FormaPagamento findById(Long id) {
        try {
            System.out.println("FormaPagamentoService: Buscando forma de pagamento com ID: " + id);
            FormaPagamento result = formaPagamentoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Forma de pagamento não encontrada com o ID: " + id));
            System.out.println("FormaPagamentoService: Forma de pagamento encontrada: " + result.getNome());
            return result;
        } catch (Exception e) {
            System.err.println("FormaPagamentoService ERROR: Erro ao buscar forma de pagamento por ID: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public FormaPagamento save(FormaPagamento formaPagamento) {
        try {
            System.out.println("FormaPagamentoService: Salvando forma de pagamento: " + formaPagamento.getNome());
            
            // Validações adicionais
            if (formaPagamento.getNome() == null || formaPagamento.getNome().isEmpty()) {
                throw new IllegalArgumentException("Nome da forma de pagamento não pode ser vazio");
            }
            
            if (formaPagamento.getDescricao() == null || formaPagamento.getDescricao().isEmpty()) {
                throw new IllegalArgumentException("Descrição da forma de pagamento não pode ser vazia");
            }
            
            // Se ativo for null, definir como true por padrão
            if (formaPagamento.getAtivo() == null) {
                formaPagamento.setAtivo(true);
                System.out.println("FormaPagamentoService: Definindo ativo como true por padrão");
            }
            
            FormaPagamento saved = formaPagamentoRepository.save(formaPagamento);
            System.out.println("FormaPagamentoService: Forma de pagamento salva com sucesso. ID: " + saved.getId());
            return saved;
        } catch (Exception e) {
            System.err.println("FormaPagamentoService ERROR: Erro ao salvar forma de pagamento: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public void deleteById(Long id) {
        formaPagamentoRepository.deleteById(id);
    }
    
    public List<FormaPagamento> findByDescricaoContainingIgnoreCase(String termo) {
        return formaPagamentoRepository.findByDescricaoContainingIgnoreCase(termo);
    }
    
    public Connection getConnection() throws SQLException {
        return formaPagamentoRepository.getConnection();
    }
} 