package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.TransportadoraDTO;
import com.example.PizzariaGraff.model.Transportadora;
import com.example.PizzariaGraff.service.TransportadoraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/transportadoras")
@CrossOrigin(origins = "http://localhost:3000")
public class TransportadoraController {

    @Autowired
    private TransportadoraService transportadoraService;

    @GetMapping
    public ResponseEntity<List<TransportadoraDTO>> findAll() {
        List<TransportadoraDTO> dtos = transportadoraService.findAll();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<TransportadoraDTO>> findAllAtivos() {
        List<Transportadora> transportadoras = transportadoraService.findAllActive();
        List<TransportadoraDTO> dtos = transportadoras.stream()
            .map(TransportadoraDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransportadoraDTO> findById(@PathVariable Long id) {
        TransportadoraDTO dto = transportadoraService.getTransportadoraWithEmailsAndTelefones(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<TransportadoraDTO> create(@RequestBody TransportadoraDTO dto) {
        TransportadoraDTO saved = transportadoraService.saveWithEmailsAndTelefones(dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransportadoraDTO> update(@PathVariable Long id, @RequestBody TransportadoraDTO dto) {
        dto.setId(id);
        TransportadoraDTO updated = transportadoraService.saveWithEmailsAndTelefones(dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transportadoraService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/complete")
    public ResponseEntity<TransportadoraDTO> findByIdComplete(@PathVariable Long id) {
        TransportadoraDTO dto = transportadoraService.getTransportadoraWithEmailsAndTelefones(id);
        return ResponseEntity.ok(dto);
    }
} 