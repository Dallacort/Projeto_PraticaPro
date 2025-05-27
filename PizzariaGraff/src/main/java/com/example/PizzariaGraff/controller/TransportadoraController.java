package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.TransportadoraDTO;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Transportadora;
import com.example.PizzariaGraff.service.CidadeService;
import com.example.PizzariaGraff.service.TransportadoraService;
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
@RequestMapping("/transportadoras")
@Tag(name = "Transportadoras", description = "API para gerenciamento de transportadoras")
public class TransportadoraController {
    
    private final TransportadoraService transportadoraService;
    private final CidadeService cidadeService;
    
    public TransportadoraController(TransportadoraService transportadoraService, CidadeService cidadeService) {
        this.transportadoraService = transportadoraService;
        this.cidadeService = cidadeService;
    }
    
    @GetMapping
    @Operation(summary = "Listar todas as transportadoras")
    public ResponseEntity<List<TransportadoraDTO>> listar() {
        List<Transportadora> transportadoras = transportadoraService.findAll();
        List<TransportadoraDTO> dtos = transportadoras.stream()
                .map(TransportadoraDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/ativos")
    @Operation(summary = "Listar transportadoras ativas")
    public ResponseEntity<List<TransportadoraDTO>> listarAtivos() {
        List<Transportadora> transportadoras = transportadoraService.findByAtivoTrue();
        List<TransportadoraDTO> dtos = transportadoras.stream()
                .map(TransportadoraDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Buscar transportadora por ID")
    public ResponseEntity<TransportadoraDTO> buscarPorId(@PathVariable Long id) {
        Transportadora transportadora = transportadoraService.findById(id);
        return ResponseEntity.ok(TransportadoraDTO.fromEntity(transportadora));
    }
    
    @GetMapping("/cnpj/{cnpj}")
    @Operation(summary = "Buscar transportadora por CNPJ")
    public ResponseEntity<TransportadoraDTO> buscarPorCnpj(@PathVariable String cnpj) {
        Transportadora transportadora = transportadoraService.findByCnpj(cnpj);
        return ResponseEntity.ok(TransportadoraDTO.fromEntity(transportadora));
    }
    
    @PostMapping
    @Operation(summary = "Criar uma nova transportadora")
    public ResponseEntity<TransportadoraDTO> criar(@RequestBody TransportadoraDTO dto) {
        try {
            Transportadora transportadora = new Transportadora();
            transportadora.setRazaoSocial(dto.getRazaoSocial());
            transportadora.setNomeFantasia(dto.getNomeFantasia());
            transportadora.setCnpj(dto.getCnpj());
            transportadora.setEmail(dto.getEmail());
            transportadora.setTelefone(dto.getTelefone());
            transportadora.setEndereco(dto.getEndereco());
            transportadora.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
            
            if (dto.getCidadeId() != null) {
                Cidade cidade = cidadeService.findById(dto.getCidadeId());
                transportadora.setCidade(cidade);
            }
            
            Transportadora salva = transportadoraService.save(transportadora);
            return ResponseEntity.status(HttpStatus.CREATED).body(TransportadoraDTO.fromEntity(salva));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar uma transportadora existente")
    public ResponseEntity<TransportadoraDTO> atualizar(@PathVariable Long id, @RequestBody TransportadoraDTO dto) {
        try {
            Transportadora transportadora = transportadoraService.findById(id);
            
            transportadora.setRazaoSocial(dto.getRazaoSocial());
            transportadora.setNomeFantasia(dto.getNomeFantasia());
            transportadora.setCnpj(dto.getCnpj());
            transportadora.setEmail(dto.getEmail());
            transportadora.setTelefone(dto.getTelefone());
            transportadora.setEndereco(dto.getEndereco());
            transportadora.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : transportadora.getAtivo());
            
            if (dto.getCidadeId() != null) {
                Cidade cidade = cidadeService.findById(dto.getCidadeId());
                transportadora.setCidade(cidade);
            } else {
                transportadora.setCidade(null);
            }
            
            Transportadora atualizada = transportadoraService.save(transportadora);
            return ResponseEntity.ok(TransportadoraDTO.fromEntity(atualizada));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir uma transportadora")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            transportadoraService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 