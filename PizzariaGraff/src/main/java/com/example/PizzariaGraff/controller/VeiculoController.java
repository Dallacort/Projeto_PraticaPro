package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.VeiculoDTO;
import com.example.PizzariaGraff.model.Transportadora;
import com.example.PizzariaGraff.model.Veiculo;
import com.example.PizzariaGraff.service.TransportadoraService;
import com.example.PizzariaGraff.service.VeiculoService;
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
@RequestMapping("/veiculos")
@Tag(name = "Veículos", description = "API para gerenciamento de veículos")
public class VeiculoController {
    
    private final VeiculoService veiculoService;
    private final TransportadoraService transportadoraService;
    
    public VeiculoController(VeiculoService veiculoService, TransportadoraService transportadoraService) {
        this.veiculoService = veiculoService;
        this.transportadoraService = transportadoraService;
    }
    
    @GetMapping
    @Operation(summary = "Listar todos os veículos")
    public ResponseEntity<List<VeiculoDTO>> listar() {
        List<Veiculo> veiculos = veiculoService.findAll();
        List<VeiculoDTO> dtos = veiculos.stream()
                .map(VeiculoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/ativos")
    @Operation(summary = "Listar veículos ativos")
    public ResponseEntity<List<VeiculoDTO>> listarAtivos() {
        List<Veiculo> veiculos = veiculoService.findByAtivoTrue();
        List<VeiculoDTO> dtos = veiculos.stream()
                .map(VeiculoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Buscar veículo por ID")
    public ResponseEntity<VeiculoDTO> buscarPorId(@PathVariable Long id) {
        Veiculo veiculo = veiculoService.findById(id);
        return ResponseEntity.ok(VeiculoDTO.fromEntity(veiculo));
    }
    
    @GetMapping("/placa/{placa}")
    @Operation(summary = "Buscar veículo por placa")
    public ResponseEntity<VeiculoDTO> buscarPorPlaca(@PathVariable String placa) {
        Veiculo veiculo = veiculoService.findByPlaca(placa);
        return ResponseEntity.ok(VeiculoDTO.fromEntity(veiculo));
    }
    
    @GetMapping("/transportadora/{transportadoraId}")
    @Operation(summary = "Listar veículos por transportadora")
    public ResponseEntity<List<VeiculoDTO>> listarPorTransportadora(@PathVariable Long transportadoraId) {
        List<Veiculo> veiculos = veiculoService.findByTransportadoraId(transportadoraId);
        List<VeiculoDTO> dtos = veiculos.stream()
                .map(VeiculoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @PostMapping
    @Operation(summary = "Criar um novo veículo")
    public ResponseEntity<VeiculoDTO> criar(@RequestBody VeiculoDTO dto) {
        try {
            Veiculo veiculo = new Veiculo();
            veiculo.setPlaca(dto.getPlaca());
            veiculo.setModelo(dto.getModelo());
            veiculo.setMarca(dto.getMarca());
            veiculo.setAno(dto.getAno());
            veiculo.setCapacidade(dto.getCapacidade());
            veiculo.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
            
            if (dto.getTransportadoraId() != null) {
                Transportadora transportadora = transportadoraService.findById(dto.getTransportadoraId());
                veiculo.setTransportadora(transportadora);
            }
            
            Veiculo salvo = veiculoService.save(veiculo);
            return ResponseEntity.status(HttpStatus.CREATED).body(VeiculoDTO.fromEntity(salvo));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar um veículo existente")
    public ResponseEntity<VeiculoDTO> atualizar(@PathVariable Long id, @RequestBody VeiculoDTO dto) {
        try {
            Veiculo veiculo = veiculoService.findById(id);
            
            veiculo.setPlaca(dto.getPlaca());
            veiculo.setModelo(dto.getModelo());
            veiculo.setMarca(dto.getMarca());
            veiculo.setAno(dto.getAno());
            veiculo.setCapacidade(dto.getCapacidade());
            veiculo.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : veiculo.getAtivo());
            
            if (dto.getTransportadoraId() != null) {
                Transportadora transportadora = transportadoraService.findById(dto.getTransportadoraId());
                veiculo.setTransportadora(transportadora);
            } else {
                veiculo.setTransportadora(null);
            }
            
            Veiculo atualizado = veiculoService.save(veiculo);
            return ResponseEntity.ok(VeiculoDTO.fromEntity(atualizado));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir um veículo")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            veiculoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 