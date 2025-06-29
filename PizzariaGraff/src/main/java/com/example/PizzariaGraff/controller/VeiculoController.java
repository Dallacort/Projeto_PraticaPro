package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.VeiculoDTO;
import com.example.PizzariaGraff.service.VeiculoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/veiculos")
@CrossOrigin(origins = "http://localhost:3000")
public class VeiculoController {

    @Autowired
    private VeiculoService veiculoService;

    @GetMapping
    public ResponseEntity<List<VeiculoDTO>> findAll() {
        return ResponseEntity.ok(veiculoService.findAll());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<VeiculoDTO>> findAllAtivos() {
        return ResponseEntity.ok(veiculoService.findAllAtivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VeiculoDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(veiculoService.findById(id));
    }

    @GetMapping("/transportadora/{transportadoraId}")
    public ResponseEntity<List<VeiculoDTO>> findByTransportadora(@PathVariable Long transportadoraId) {
        return ResponseEntity.ok(veiculoService.findByTransportadora(transportadoraId));
    }

    @PostMapping
    public ResponseEntity<VeiculoDTO> create(@RequestBody VeiculoDTO dto) {
        return ResponseEntity.ok(veiculoService.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VeiculoDTO> update(@PathVariable Long id, @RequestBody VeiculoDTO dto) {
        dto.setId(id);
        return ResponseEntity.ok(veiculoService.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        veiculoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
} 