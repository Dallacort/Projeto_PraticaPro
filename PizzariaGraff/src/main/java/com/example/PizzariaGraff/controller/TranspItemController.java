package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.TranspItemDTO;
import com.example.PizzariaGraff.model.Transportadora;
import com.example.PizzariaGraff.model.TranspItem;
import com.example.PizzariaGraff.service.TransportadoraService;
import com.example.PizzariaGraff.service.TranspItemService;
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
@RequestMapping("/transp-itens")
@Tag(name = "Itens de Transportadora", description = "API para gerenciamento de itens de transportadora")
public class TranspItemController {
    
    private final TranspItemService transpItemService;
    private final TransportadoraService transportadoraService;
    
    public TranspItemController(TranspItemService transpItemService, TransportadoraService transportadoraService) {
        this.transpItemService = transpItemService;
        this.transportadoraService = transportadoraService;
    }
    
    @GetMapping
    @Operation(summary = "Listar todos os itens de transportadora")
    public ResponseEntity<List<TranspItemDTO>> listar() {
        List<TranspItem> itens = transpItemService.findAll();
        List<TranspItemDTO> dtos = itens.stream()
                .map(TranspItemDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/ativos")
    @Operation(summary = "Listar itens de transportadora ativos")
    public ResponseEntity<List<TranspItemDTO>> listarAtivos() {
        List<TranspItem> itens = transpItemService.findByAtivoTrue();
        List<TranspItemDTO> dtos = itens.stream()
                .map(TranspItemDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Buscar item de transportadora por ID")
    public ResponseEntity<TranspItemDTO> buscarPorId(@PathVariable Long id) {
        TranspItem item = transpItemService.findById(id);
        return ResponseEntity.ok(TranspItemDTO.fromEntity(item));
    }
    
    @GetMapping("/codigo/{codigo}")
    @Operation(summary = "Buscar item de transportadora por código")
    public ResponseEntity<TranspItemDTO> buscarPorCodigo(@PathVariable String codigo) {
        TranspItem item = transpItemService.findByCodigo(codigo);
        return ResponseEntity.ok(TranspItemDTO.fromEntity(item));
    }
    
    @GetMapping("/transportadora/{transportadoraId}")
    @Operation(summary = "Listar itens por transportadora")
    public ResponseEntity<List<TranspItemDTO>> listarPorTransportadora(@PathVariable Long transportadoraId) {
        List<TranspItem> itens = transpItemService.findByTransportadoraId(transportadoraId);
        List<TranspItemDTO> dtos = itens.stream()
                .map(TranspItemDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/buscar")
    @Operation(summary = "Buscar itens de transportadora por descrição")
    public ResponseEntity<List<TranspItemDTO>> buscarPorDescricao(@RequestParam String termo) {
        List<TranspItem> itens = transpItemService.findByDescricaoContainingIgnoreCase(termo);
        List<TranspItemDTO> dtos = itens.stream()
                .map(TranspItemDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @PostMapping
    @Operation(summary = "Criar um novo item de transportadora")
    public ResponseEntity<TranspItemDTO> criar(@RequestBody TranspItemDTO dto) {
        try {
            TranspItem item = new TranspItem();
            item.setCodigo(dto.getCodigo());
            item.setDescricao(dto.getDescricao());
            item.setCodigoTransp(dto.getCodigoTransp());
            item.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
            
            if (dto.getTransportadoraId() != null) {
                Transportadora transportadora = transportadoraService.findById(dto.getTransportadoraId());
                item.setTransportadora(transportadora);
            }
            
            TranspItem salvo = transpItemService.save(item);
            return ResponseEntity.status(HttpStatus.CREATED).body(TranspItemDTO.fromEntity(salvo));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar um item de transportadora existente")
    public ResponseEntity<TranspItemDTO> atualizar(@PathVariable Long id, @RequestBody TranspItemDTO dto) {
        try {
            TranspItem item = transpItemService.findById(id);
            
            item.setCodigo(dto.getCodigo());
            item.setDescricao(dto.getDescricao());
            item.setCodigoTransp(dto.getCodigoTransp());
            item.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : item.getAtivo());
            
            if (dto.getTransportadoraId() != null) {
                Transportadora transportadora = transportadoraService.findById(dto.getTransportadoraId());
                item.setTransportadora(transportadora);
            } else {
                item.setTransportadora(null);
            }
            
            TranspItem atualizado = transpItemService.save(item);
            return ResponseEntity.ok(TranspItemDTO.fromEntity(atualizado));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir um item de transportadora")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            transpItemService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 