package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.MovimentacaoNfeDTO;
import com.example.PizzariaGraff.model.MovimentacaoNfe;
import com.example.PizzariaGraff.model.Nfe;
import com.example.PizzariaGraff.service.MovimentacaoNfeService;
import com.example.PizzariaGraff.service.NfeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/movimentacoes-nfe")
@Tag(name = "Movimentações de NF-e", description = "API para gerenciamento de movimentações de Nota Fiscal Eletrônica")
public class MovimentacaoNfeController {
    
    private final MovimentacaoNfeService movimentacaoNfeService;
    private final NfeService nfeService;
    
    public MovimentacaoNfeController(MovimentacaoNfeService movimentacaoNfeService, NfeService nfeService) {
        this.movimentacaoNfeService = movimentacaoNfeService;
        this.nfeService = nfeService;
    }
    
    @GetMapping
    @Operation(summary = "Listar todas as movimentações de NF-e")
    public ResponseEntity<List<MovimentacaoNfeDTO>> listar() {
        List<MovimentacaoNfe> movimentacoes = movimentacaoNfeService.findAll();
        List<MovimentacaoNfeDTO> dtos = movimentacoes.stream()
                .map(MovimentacaoNfeDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Buscar movimentação de NF-e por ID")
    public ResponseEntity<MovimentacaoNfeDTO> buscarPorId(@PathVariable Long id) {
        MovimentacaoNfe movimentacao = movimentacaoNfeService.findById(id);
        return ResponseEntity.ok(MovimentacaoNfeDTO.fromEntity(movimentacao));
    }
    
    @GetMapping("/nfe/{nfeId}")
    @Operation(summary = "Listar movimentações por NF-e")
    public ResponseEntity<List<MovimentacaoNfeDTO>> listarPorNfe(@PathVariable Long nfeId) {
        List<MovimentacaoNfe> movimentacoes = movimentacaoNfeService.findByNfeId(nfeId);
        List<MovimentacaoNfeDTO> dtos = movimentacoes.stream()
                .map(MovimentacaoNfeDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @PostMapping
    @Operation(summary = "Criar uma nova movimentação de NF-e")
    public ResponseEntity<MovimentacaoNfeDTO> criar(@RequestBody MovimentacaoNfeDTO dto) {
        try {
            MovimentacaoNfe movimentacao = new MovimentacaoNfe();
            movimentacao.setStatus(dto.getStatus());
            movimentacao.setDescricao(dto.getDescricao());
            movimentacao.setDataMovimentacao(LocalDateTime.now());
            
            if (dto.getNfeId() != null) {
                Nfe nfe = nfeService.findById(dto.getNfeId());
                movimentacao.setNfe(nfe);
            }
            
            MovimentacaoNfe salva = movimentacaoNfeService.save(movimentacao);
            return ResponseEntity.status(HttpStatus.CREATED).body(MovimentacaoNfeDTO.fromEntity(salva));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar uma movimentação de NF-e existente")
    public ResponseEntity<MovimentacaoNfeDTO> atualizar(@PathVariable Long id, @RequestBody MovimentacaoNfeDTO dto) {
        try {
            MovimentacaoNfe movimentacao = movimentacaoNfeService.findById(id);
            
            movimentacao.setStatus(dto.getStatus());
            movimentacao.setDescricao(dto.getDescricao());
            
            if (dto.getNfeId() != null && (movimentacao.getNfe() == null || !dto.getNfeId().equals(movimentacao.getNfe().getId()))) {
                Nfe nfe = nfeService.findById(dto.getNfeId());
                movimentacao.setNfe(nfe);
            }
            
            MovimentacaoNfe atualizada = movimentacaoNfeService.save(movimentacao);
            return ResponseEntity.ok(MovimentacaoNfeDTO.fromEntity(atualizada));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir uma movimentação de NF-e")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            movimentacaoNfeService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 