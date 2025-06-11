package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.MarcaDTO;
import com.example.PizzariaGraff.model.Marca;
import com.example.PizzariaGraff.service.MarcaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/marcas")
@Tag(name = "Marcas", description = "API para gerenciamento de marcas")
public class MarcaController {

    private final MarcaService marcaService;

    public MarcaController(MarcaService marcaService) {
        this.marcaService = marcaService;
    }

    @GetMapping
    @Operation(summary = "Listar todas as marcas", description = "Retorna uma lista com todas as marcas cadastradas")
    public ResponseEntity<List<MarcaDTO>> listarTodas() {
        try {
            List<Marca> marcas = marcaService.listarTodas();
            List<MarcaDTO> marcasDTO = marcas.stream()
                    .map(MarcaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(marcasDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/ativos")
    @Operation(summary = "Listar marcas ativas", description = "Retorna uma lista com todas as marcas ativas")
    public ResponseEntity<List<MarcaDTO>> listarAtivos() {
        try {
            List<Marca> marcas = marcaService.listarAtivos();
            List<MarcaDTO> marcasDTO = marcas.stream()
                    .map(MarcaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(marcasDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar marca por ID", description = "Retorna uma marca específica pelo seu ID")
    public ResponseEntity<MarcaDTO> buscarPorId(@PathVariable Long id) {
        try {
            Optional<Marca> marca = marcaService.buscarPorId(id);
            return marca.map(m -> ResponseEntity.ok(new MarcaDTO(m)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @Operation(summary = "Criar nova marca", description = "Cria uma nova marca no sistema")
    public ResponseEntity<MarcaDTO> criar(@RequestBody MarcaDTO marcaDTO) {
        try {
            Marca marca = marcaDTO.toEntity();
            Marca marcaSalva = marcaService.salvar(marca);
            return ResponseEntity.status(HttpStatus.CREATED).body(new MarcaDTO(marcaSalva));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar marca", description = "Atualiza uma marca existente")
    public ResponseEntity<MarcaDTO> atualizar(@PathVariable Long id, @RequestBody MarcaDTO marcaDTO) {
        try {
            Marca marca = marcaDTO.toEntity();
            Marca marcaAtualizada = marcaService.atualizar(id, marca);
            return ResponseEntity.ok(new MarcaDTO(marcaAtualizada));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir marca", description = "Exclui uma marca do sistema")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            marcaService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 