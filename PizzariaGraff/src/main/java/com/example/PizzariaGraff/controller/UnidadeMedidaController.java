package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.UnidadeMedidaDTO;
import com.example.PizzariaGraff.model.UnidadeMedida;
import com.example.PizzariaGraff.service.UnidadeMedidaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/unidades-medida")
@Tag(name = "Unidades de Medida", description = "API para gerenciamento de unidades de medida")
public class UnidadeMedidaController {

    private final UnidadeMedidaService unidadeMedidaService;

    public UnidadeMedidaController(UnidadeMedidaService unidadeMedidaService) {
        this.unidadeMedidaService = unidadeMedidaService;
    }

    @GetMapping
    @Operation(summary = "Lista todas as unidades de medida")
    public ResponseEntity<List<UnidadeMedidaDTO>> listar() {
        List<UnidadeMedida> unidadesMedida = unidadeMedidaService.findAll();
        List<UnidadeMedidaDTO> unidadesMedidaDTO = unidadesMedida.stream()
                .map(UnidadeMedidaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(unidadesMedidaDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca uma unidade de medida por ID")
    public ResponseEntity<UnidadeMedidaDTO> buscarPorId(@PathVariable Long id) {
        try {
            UnidadeMedida unidadeMedida = unidadeMedidaService.findById(id);
            return ResponseEntity.ok(new UnidadeMedidaDTO(unidadeMedida));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/buscar")
    @Operation(summary = "Busca unidades de medida por nome")
    public ResponseEntity<List<UnidadeMedidaDTO>> buscarPorNome(@RequestParam String nome) {
        try {
            List<UnidadeMedida> unidadesMedida = unidadeMedidaService.findByUnidadeMedida(nome);
            List<UnidadeMedidaDTO> unidadesMedidaDTO = unidadesMedida.stream()
                    .map(UnidadeMedidaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(unidadesMedidaDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @Operation(summary = "Cadastra uma nova unidade de medida")
    public ResponseEntity<UnidadeMedidaDTO> criar(@RequestBody UnidadeMedidaDTO unidadeMedidaDTO) {
        try {
            UnidadeMedida unidadeMedida = unidadeMedidaDTO.toEntity();
            unidadeMedida = unidadeMedidaService.save(unidadeMedida);
            return ResponseEntity.status(HttpStatus.CREATED).body(new UnidadeMedidaDTO(unidadeMedida));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma unidade de medida")
    public ResponseEntity<UnidadeMedidaDTO> atualizar(@PathVariable Long id, @RequestBody UnidadeMedidaDTO unidadeMedidaDTO) {
        try {
            UnidadeMedida unidadeMedida = unidadeMedidaDTO.toEntity();
            unidadeMedida.setId(id);
            unidadeMedida = unidadeMedidaService.save(unidadeMedida);
            return ResponseEntity.ok(new UnidadeMedidaDTO(unidadeMedida));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove uma unidade de medida")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        try {
            unidadeMedidaService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 