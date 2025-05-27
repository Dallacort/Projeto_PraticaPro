package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.ModalidadeNfeDTO;
import com.example.PizzariaGraff.model.ModalidadeNfe;
import com.example.PizzariaGraff.service.ModalidadeNfeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/modalidades-nfe")
@Tag(name = "Modalidades de NF-e", description = "API para gerenciamento de modalidades de Nota Fiscal Eletrônica")
public class ModalidadeNfeController {
    
    private final ModalidadeNfeService modalidadeNfeService;
    
    public ModalidadeNfeController(ModalidadeNfeService modalidadeNfeService) {
        this.modalidadeNfeService = modalidadeNfeService;
    }
    
    @GetMapping
    @Operation(summary = "Listar todas as modalidades de NF-e")
    public ResponseEntity<List<ModalidadeNfeDTO>> listar() {
        List<ModalidadeNfe> modalidades = modalidadeNfeService.findAll();
        List<ModalidadeNfeDTO> dtos = modalidades.stream()
                .map(ModalidadeNfeDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/ativos")
    @Operation(summary = "Listar modalidades de NF-e ativas")
    public ResponseEntity<List<ModalidadeNfeDTO>> listarAtivos() {
        List<ModalidadeNfe> modalidades = modalidadeNfeService.findByAtivoTrue();
        List<ModalidadeNfeDTO> dtos = modalidades.stream()
                .map(ModalidadeNfeDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Buscar modalidade de NF-e por ID")
    public ResponseEntity<ModalidadeNfeDTO> buscarPorId(@PathVariable Long id) {
        ModalidadeNfe modalidade = modalidadeNfeService.findById(id);
        return ResponseEntity.ok(ModalidadeNfeDTO.fromEntity(modalidade));
    }
    
    @GetMapping("/codigo/{codigo}")
    @Operation(summary = "Buscar modalidade de NF-e por código")
    public ResponseEntity<ModalidadeNfeDTO> buscarPorCodigo(@PathVariable String codigo) {
        ModalidadeNfe modalidade = modalidadeNfeService.findByCodigo(codigo);
        return ResponseEntity.ok(ModalidadeNfeDTO.fromEntity(modalidade));
    }
    
    @GetMapping("/buscar")
    @Operation(summary = "Buscar modalidades de NF-e por descrição")
    public ResponseEntity<List<ModalidadeNfeDTO>> buscarPorDescricao(@RequestParam String termo) {
        List<ModalidadeNfe> modalidades = modalidadeNfeService.findByDescricaoContainingIgnoreCase(termo);
        List<ModalidadeNfeDTO> dtos = modalidades.stream()
                .map(ModalidadeNfeDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @PostMapping
    @Operation(summary = "Criar uma nova modalidade de NF-e")
    public ResponseEntity<ModalidadeNfeDTO> criar(@RequestBody ModalidadeNfeDTO dto) {
        try {
            ModalidadeNfe modalidade = new ModalidadeNfe();
            modalidade.setCodigo(dto.getCodigo());
            modalidade.setDescricao(dto.getDescricao());
            modalidade.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
            
            ModalidadeNfe salva = modalidadeNfeService.save(modalidade);
            return ResponseEntity.status(HttpStatus.CREATED).body(ModalidadeNfeDTO.fromEntity(salva));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar uma modalidade de NF-e existente")
    public ResponseEntity<ModalidadeNfeDTO> atualizar(@PathVariable Long id, @RequestBody ModalidadeNfeDTO dto) {
        try {
            ModalidadeNfe modalidade = modalidadeNfeService.findById(id);
            
            modalidade.setCodigo(dto.getCodigo());
            modalidade.setDescricao(dto.getDescricao());
            modalidade.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : modalidade.getAtivo());
            
            ModalidadeNfe atualizada = modalidadeNfeService.save(modalidade);
            return ResponseEntity.ok(ModalidadeNfeDTO.fromEntity(atualizada));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir uma modalidade de NF-e")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            modalidadeNfeService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 