package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.ProdutoDTO;
import com.example.PizzariaGraff.model.Produto;
import com.example.PizzariaGraff.service.ProdutoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/produtos")
@Tag(name = "Produtos", description = "API para gerenciamento de produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping
    @Operation(summary = "Lista todos os produtos")
    public ResponseEntity<List<ProdutoDTO>> listar() {
        List<Produto> produtos = produtoService.findAll();
        List<ProdutoDTO> produtosDTO = produtos.stream()
                .map(ProdutoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(produtosDTO);
    }

    @GetMapping("/ativos")
    @Operation(summary = "Lista produtos ativos")
    public ResponseEntity<List<ProdutoDTO>> listarAtivos() {
        List<Produto> produtos = produtoService.findByAtivoTrue();
        List<ProdutoDTO> produtosDTO = produtos.stream()
                .map(ProdutoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(produtosDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um produto por ID")
    public ResponseEntity<ProdutoDTO> buscarPorId(@PathVariable Long id) {
        try {
            Produto produto = produtoService.findById(id);
            return ResponseEntity.ok(ProdutoDTO.fromEntity(produto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/codigo/{codigo}")
    @Operation(summary = "Busca um produto por código")
    public ResponseEntity<ProdutoDTO> buscarPorCodigo(@PathVariable String codigo) {
        try {
            Produto produto = produtoService.findByCodigo(codigo);
            return ResponseEntity.ok(ProdutoDTO.fromEntity(produto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo produto")
    public ResponseEntity<ProdutoDTO> criar(@RequestBody ProdutoDTO produtoDTO) {
        Produto produto = produtoDTO.toEntity();
        produto = produtoService.save(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProdutoDTO.fromEntity(produto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um produto")
    public ResponseEntity<ProdutoDTO> atualizar(@PathVariable Long id, @RequestBody ProdutoDTO produtoDTO) {
        Produto produto = produtoDTO.toEntity();
        produto.setId(id);
        produto = produtoService.save(produto);
        return ResponseEntity.ok(ProdutoDTO.fromEntity(produto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um produto")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        produtoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pesquisar")
    @Operation(summary = "Pesquisa produtos por descrição")
    public ResponseEntity<List<ProdutoDTO>> pesquisar(@RequestParam String termo) {
        List<Produto> produtos = produtoService.findByDescricaoContainingIgnoreCase(termo);
        List<ProdutoDTO> produtosDTO = produtos.stream()
                .map(ProdutoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(produtosDTO);
    }
} 