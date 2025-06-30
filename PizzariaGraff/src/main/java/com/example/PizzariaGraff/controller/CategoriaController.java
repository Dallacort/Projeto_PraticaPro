package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.CategoriaDTO;
import com.example.PizzariaGraff.model.Categoria;
import com.example.PizzariaGraff.service.CategoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/categorias")
@Tag(name = "Categorias", description = "API para gerenciamento de categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    @Operation(summary = "Listar todas as categorias", description = "Retorna uma lista com todas as categorias cadastradas")
    public ResponseEntity<List<CategoriaDTO>> listarTodas() {
        try {
            List<Categoria> categorias = categoriaService.listarTodas();
            List<CategoriaDTO> categoriasDTO = categorias.stream()
                    .map(CategoriaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(categoriasDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/ativos")
    @Operation(summary = "Listar categorias ativas", description = "Retorna uma lista com todas as categorias ativas")
    public ResponseEntity<List<CategoriaDTO>> listarAtivos() {
        try {
            List<Categoria> categorias = categoriaService.listarAtivos();
            List<CategoriaDTO> categoriasDTO = categorias.stream()
                    .map(CategoriaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(categoriasDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar categoria por ID", description = "Retorna uma categoria específica pelo seu ID")
    public ResponseEntity<CategoriaDTO> buscarPorId(@PathVariable Long id) {
        try {
            Optional<Categoria> categoria = categoriaService.buscarPorId(id);
            return categoria.map(c -> ResponseEntity.ok(new CategoriaDTO(c)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @Operation(summary = "Criar nova categoria", description = "Cria uma nova categoria no sistema")
    public ResponseEntity<CategoriaDTO> criar(@RequestBody CategoriaDTO categoriaDTO) {
        try {
            Categoria categoria = categoriaDTO.toEntity();
            Categoria categoriaSalva = categoriaService.salvar(categoria);
            return ResponseEntity.status(HttpStatus.CREATED).body(new CategoriaDTO(categoriaSalva));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar categoria", description = "Atualiza uma categoria existente")
    public ResponseEntity<CategoriaDTO> atualizar(@PathVariable Long id, @RequestBody CategoriaDTO categoriaDTO) {
        try {
            Categoria categoria = categoriaDTO.toEntity();
            Categoria categoriaAtualizada = categoriaService.atualizar(id, categoria);
            return ResponseEntity.ok(new CategoriaDTO(categoriaAtualizada));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir categoria", description = "Exclui uma categoria do sistema")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            categoriaService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 