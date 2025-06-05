package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.FornecedorDTO;
import com.example.PizzariaGraff.model.Fornecedor;
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
                .map(FornecedorDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(fornecedoresDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um fornecedor por ID")
    public ResponseEntity<FornecedorDTO> buscarPorId(@PathVariable Long id) {
        try {
            Fornecedor fornecedor = fornecedorService.findById(id);
            return ResponseEntity.ok(new FornecedorDTO(fornecedor));
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
                    .map(FornecedorDTO::new)
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
            return ResponseEntity.status(HttpStatus.CREATED).body(new FornecedorDTO(fornecedor));
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
            return ResponseEntity.ok(new FornecedorDTO(fornecedor));
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
} 