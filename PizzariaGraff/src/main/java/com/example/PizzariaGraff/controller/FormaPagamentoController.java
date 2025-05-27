package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.FormaPagamentoDTO;
import com.example.PizzariaGraff.model.FormaPagamento;
import com.example.PizzariaGraff.service.FormaPagamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/formas-pagamento")
@Tag(name = "Formas de Pagamento", description = "API para gerenciamento de formas de pagamento")
public class FormaPagamentoController {

    private final FormaPagamentoService formaPagamentoService;

    public FormaPagamentoController(FormaPagamentoService formaPagamentoService) {
        this.formaPagamentoService = formaPagamentoService;
    }

    @GetMapping
    @Operation(summary = "Lista todas as formas de pagamento")
    public ResponseEntity<List<FormaPagamentoDTO>> listar() {
        try {
            System.out.println("FormaPagamentoController: Listando todas as formas de pagamento");
            List<FormaPagamento> lista = formaPagamentoService.findAll();
            System.out.println("FormaPagamentoController: " + lista.size() + " formas de pagamento encontradas");
            
            List<FormaPagamentoDTO> listaDto = lista.stream()
                    .map(FormaPagamentoDTO::fromEntity)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(listaDto);
        } catch (Exception e) {
            System.err.println("FormaPagamentoController ERROR: Erro ao listar formas de pagamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/ativos")
    @Operation(summary = "Lista todas as formas de pagamento ativas")
    public ResponseEntity<List<FormaPagamentoDTO>> listarAtivos() {
        try {
            System.out.println("FormaPagamentoController: Listando formas de pagamento ativas");
            List<FormaPagamento> lista = formaPagamentoService.findByAtivoTrue();
            System.out.println("FormaPagamentoController: " + lista.size() + " formas de pagamento ativas encontradas");
            
            List<FormaPagamentoDTO> listaDto = lista.stream()
                    .map(FormaPagamentoDTO::fromEntity)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(listaDto);
        } catch (Exception e) {
            System.err.println("FormaPagamentoController ERROR: Erro ao listar formas de pagamento ativas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca uma forma de pagamento por ID")
    public ResponseEntity<FormaPagamentoDTO> buscarPorId(@PathVariable Long id) {
        try {
            FormaPagamento forma = formaPagamentoService.findById(id);
            return ResponseEntity.ok(FormaPagamentoDTO.fromEntity(forma));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Cadastra uma nova forma de pagamento")
    public ResponseEntity<FormaPagamentoDTO> criar(@RequestBody FormaPagamentoDTO formaPagamento) {
        try {
            System.out.println("FormaPagamentoController: Recebendo requisição para criar forma de pagamento: " + formaPagamento.getNome());
            
            // Validações dos campos obrigatórios
            if (formaPagamento.getNome() == null || formaPagamento.getNome().isEmpty()) {
                System.err.println("FormaPagamentoController ERROR: Nome da forma de pagamento não informado");
                return ResponseEntity.badRequest().body(null);
            }
            
            if (formaPagamento.getDescricao() == null || formaPagamento.getDescricao().isEmpty()) {
                System.err.println("FormaPagamentoController ERROR: Descrição da forma de pagamento não informada");
                return ResponseEntity.badRequest().body(null);
            }
            
            // Exibir todos os dados recebidos
            System.out.println("FormaPagamentoController: Dados recebidos:");
            System.out.println("Nome: " + formaPagamento.getNome());
            System.out.println("Descrição: " + formaPagamento.getDescricao());
            System.out.println("Ativo: " + formaPagamento.getAtivo());
            
            FormaPagamento entity = formaPagamento.toEntity();
            System.out.println("FormaPagamentoController: Entity criada: " + entity);
            
            FormaPagamento savedEntity = formaPagamentoService.save(entity);
            System.out.println("FormaPagamentoController: Forma de pagamento salva com ID: " + savedEntity.getId());
            
            FormaPagamentoDTO result = FormaPagamentoDTO.fromEntity(savedEntity);
            System.out.println("FormaPagamentoController: Retornando DTO: " + result);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("FormaPagamentoController ERROR: Erro ao criar forma de pagamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma forma de pagamento")
    public ResponseEntity<FormaPagamentoDTO> atualizar(@PathVariable Long id, @RequestBody FormaPagamentoDTO formaPagamento) {
        try {
            System.out.println("FormaPagamentoController: Atualizando forma de pagamento com ID: " + id);
            System.out.println("FormaPagamentoController: Dados recebidos: " + formaPagamento.getNome());
            
            // Verificar se a forma de pagamento existe
            if (!formaPagamentoService.findById(id).getId().equals(id)) {
                System.err.println("FormaPagamentoController ERROR: Forma de pagamento não encontrada com ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            FormaPagamento entity = formaPagamento.toEntity();
            entity.setId(id);
            
            FormaPagamento updatedEntity = formaPagamentoService.save(entity);
            System.out.println("FormaPagamentoController: Forma de pagamento atualizada: " + updatedEntity.getNome());
            
            FormaPagamentoDTO result = FormaPagamentoDTO.fromEntity(updatedEntity);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("FormaPagamentoController ERROR: Erro ao atualizar forma de pagamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove uma forma de pagamento")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        formaPagamentoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/diagnostico")
    @Operation(summary = "Verifica a conexão com o banco e cria a tabela se necessário")
    public ResponseEntity<?> diagnosticar() {
        try {
            Connection conn = null;
            Statement stmt = null;
            
            try {
                // Verificar conexão
                conn = formaPagamentoService.getConnection();
                
                // Verificar se a tabela existe
                DatabaseMetaData metaData = conn.getMetaData();
                ResultSet tables = metaData.getTables(null, null, "forma_pagamento", null);
                boolean tabelaExiste = tables.next();
                tables.close();
                
                if (!tabelaExiste) {
                    // Criar tabela
                    stmt = conn.createStatement();
                    stmt.execute("CREATE TABLE IF NOT EXISTS forma_pagamento (" +
                            "id BIGINT PRIMARY KEY AUTO_INCREMENT, " +
                            "nome VARCHAR(100) NOT NULL, " +
                            "descricao VARCHAR(255) NOT NULL, " +
                            "ativo BOOLEAN DEFAULT TRUE, " +
                            "data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "ultima_modificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)");
                    
                    // Inserir dados básicos
                    stmt.execute("INSERT INTO forma_pagamento (nome, descricao, ativo) VALUES " +
                            "('Dinheiro', 'Pagamento em dinheiro', true), " +
                            "('Cartão de Crédito', 'Pagamento com cartão de crédito', true), " +
                            "('Cartão de Débito', 'Pagamento com cartão de débito', true), " +
                            "('PIX', 'Pagamento via PIX', true)");
                    
                    return ResponseEntity.ok("Diagnóstico concluído. Tabela criada com dados iniciais.");
                } else {
                    // Verificar se a coluna 'nome' existe
                    ResultSet columns = metaData.getColumns(null, null, "forma_pagamento", "nome");
                    boolean nomeExists = columns.next();
                    columns.close();
                    
                    if (!nomeExists) {
                        // Adicionar coluna 'nome'
                        stmt = conn.createStatement();
                        stmt.execute("ALTER TABLE forma_pagamento ADD COLUMN nome VARCHAR(100) AFTER id");
                        
                        // Atualizar valores existentes, copiando de descricao
                        stmt.execute("UPDATE forma_pagamento SET nome = descricao WHERE nome IS NULL");
                        
                        return ResponseEntity.ok("Diagnóstico concluído. Coluna 'nome' adicionada à tabela.");
                    }
                }
                
                return ResponseEntity.ok("Diagnóstico concluído. Tabela já existe.");
                
            } finally {
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro no diagnóstico: " + e.getMessage());
        }
    }
} 