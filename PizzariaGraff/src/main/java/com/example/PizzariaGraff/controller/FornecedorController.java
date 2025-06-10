package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.FornecedorDTO;
import com.example.PizzariaGraff.model.Fornecedor;
import com.example.PizzariaGraff.model.FornecedorEmail;
import com.example.PizzariaGraff.model.FornecedorTelefone;
import com.example.PizzariaGraff.service.FornecedorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/fornecedores")
@Tag(name = "Fornecedores", description = "API para gerenciamento de fornecedores")
public class FornecedorController {

    private final FornecedorService fornecedorService;

    public FornecedorController(FornecedorService fornecedorService) {
        this.fornecedorService = fornecedorService;
    }

    @GetMapping
    @Operation(summary = "Lista todos os fornecedores")
    public ResponseEntity<List<FornecedorDTO>> listar() {
        List<Fornecedor> fornecedores = fornecedorService.findAll();
        List<FornecedorDTO> fornecedoresDTO = fornecedores.stream()
                .map(fornecedor -> {
                    FornecedorDTO dto = new FornecedorDTO(fornecedor);
                    // Incluir emails e telefones para cada fornecedor
                    dto.setEmailsAdicionais(fornecedorService.getEmailsByFornecedorId(fornecedor.getId())
                        .stream().map(email -> email.getEmail()).collect(Collectors.toList()));
                    dto.setTelefonesAdicionais(fornecedorService.getTelefonesByFornecedorId(fornecedor.getId())
                        .stream().map(telefone -> telefone.getTelefone()).collect(Collectors.toList()));
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(fornecedoresDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um fornecedor por ID")
    public ResponseEntity<FornecedorDTO> buscarPorId(@PathVariable Long id) {
        try {
            Fornecedor fornecedor = fornecedorService.findById(id);
            
            // Criar DTO com emails e telefones
            FornecedorDTO responseDTO = new FornecedorDTO(fornecedor);
            responseDTO.setEmailsAdicionais(fornecedorService.getEmailsByFornecedorId(id)
                .stream().map(email -> email.getEmail()).collect(java.util.stream.Collectors.toList()));
            responseDTO.setTelefonesAdicionais(fornecedorService.getTelefonesByFornecedorId(id)
                .stream().map(telefone -> telefone.getTelefone()).collect(java.util.stream.Collectors.toList()));
            
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/buscar")
    @Operation(summary = "Busca fornecedores por nome")
    public ResponseEntity<List<FornecedorDTO>> buscarPorNome(@RequestParam String nome) {
        try {
            List<Fornecedor> fornecedores = fornecedorService.findByFornecedor(nome);
            List<FornecedorDTO> fornecedoresDTO = fornecedores.stream()
                    .map(fornecedor -> {
                        FornecedorDTO dto = new FornecedorDTO(fornecedor);
                        // Incluir emails e telefones para cada fornecedor
                        dto.setEmailsAdicionais(fornecedorService.getEmailsByFornecedorId(fornecedor.getId())
                            .stream().map(email -> email.getEmail()).collect(Collectors.toList()));
                        dto.setTelefonesAdicionais(fornecedorService.getTelefonesByFornecedorId(fornecedor.getId())
                            .stream().map(telefone -> telefone.getTelefone()).collect(Collectors.toList()));
                        return dto;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(fornecedoresDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo fornecedor")
    public ResponseEntity<FornecedorDTO> criar(@RequestBody FornecedorDTO fornecedorDTO) {
        try {
            Fornecedor fornecedor = fornecedorDTO.toEntity();
            fornecedor = fornecedorService.save(fornecedor);
            
            // Processar múltiplos emails e telefones se fornecidos
            if (fornecedorDTO.getEmailsAdicionais() != null || fornecedorDTO.getTelefonesAdicionais() != null) {
                fornecedorService.processarMultiplosContatos(
                    fornecedor.getId(), 
                    fornecedorDTO.getEmailsAdicionais(), 
                    fornecedorDTO.getTelefonesAdicionais()
                );
            }
            
            // Criar DTO de resposta com emails e telefones
            FornecedorDTO responseDTO = new FornecedorDTO(fornecedor);
            responseDTO.setEmailsAdicionais(fornecedorService.getEmailsByFornecedorId(fornecedor.getId())
                .stream().map(email -> email.getEmail()).collect(java.util.stream.Collectors.toList()));
            responseDTO.setTelefonesAdicionais(fornecedorService.getTelefonesByFornecedorId(fornecedor.getId())
                .stream().map(telefone -> telefone.getTelefone()).collect(java.util.stream.Collectors.toList()));
            
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um fornecedor")
    public ResponseEntity<FornecedorDTO> atualizar(@PathVariable Long id, @RequestBody FornecedorDTO fornecedorDTO) {
        try {
            Fornecedor fornecedor = fornecedorDTO.toEntity();
            fornecedor.setId(id);
            fornecedor = fornecedorService.save(fornecedor);
            
            // Processar múltiplos emails e telefones se fornecidos
            if (fornecedorDTO.getEmailsAdicionais() != null || fornecedorDTO.getTelefonesAdicionais() != null) {
                fornecedorService.processarMultiplosContatos(
                    fornecedor.getId(), 
                    fornecedorDTO.getEmailsAdicionais(), 
                    fornecedorDTO.getTelefonesAdicionais()
                );
            }
            
            // Criar DTO de resposta com emails e telefones
            FornecedorDTO responseDTO = new FornecedorDTO(fornecedor);
            responseDTO.setEmailsAdicionais(fornecedorService.getEmailsByFornecedorId(fornecedor.getId())
                .stream().map(email -> email.getEmail()).collect(java.util.stream.Collectors.toList()));
            responseDTO.setTelefonesAdicionais(fornecedorService.getTelefonesByFornecedorId(fornecedor.getId())
                .stream().map(telefone -> telefone.getTelefone()).collect(java.util.stream.Collectors.toList()));
            
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um fornecedor")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        try {
            fornecedorService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoints para gerenciar emails
    @GetMapping("/{id}/emails")
    @Operation(summary = "Lista todos os emails de um fornecedor")
    public ResponseEntity<List<FornecedorEmail>> listarEmails(@PathVariable Long id) {
        try {
            List<FornecedorEmail> emails = fornecedorService.getEmailsByFornecedorId(id);
            return ResponseEntity.ok(emails);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/emails")
    @Operation(summary = "Adiciona um email ao fornecedor")
    public ResponseEntity<FornecedorEmail> adicionarEmail(@PathVariable Long id, @RequestBody FornecedorEmail email) {
        try {
            email.setFornecedorId(id);
            FornecedorEmail novoEmail = fornecedorService.saveEmail(email);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoEmail);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoints para gerenciar telefones
    @GetMapping("/{id}/telefones")
    @Operation(summary = "Lista todos os telefones de um fornecedor")
    public ResponseEntity<List<FornecedorTelefone>> listarTelefones(@PathVariable Long id) {
        try {
            List<FornecedorTelefone> telefones = fornecedorService.getTelefonesByFornecedorId(id);
            return ResponseEntity.ok(telefones);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/telefones")
    @Operation(summary = "Adiciona um telefone ao fornecedor")
    public ResponseEntity<FornecedorTelefone> adicionarTelefone(@PathVariable Long id, @RequestBody FornecedorTelefone telefone) {
        try {
            telefone.setFornecedorId(id);
            FornecedorTelefone novoTelefone = fornecedorService.saveTelefone(telefone);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoTelefone);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 