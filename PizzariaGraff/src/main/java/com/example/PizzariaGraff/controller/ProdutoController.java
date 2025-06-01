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
import java.util.Optional;
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
                .map(ProdutoDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(produtosDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um produto por ID")
    public ResponseEntity<ProdutoDTO> buscarPorId(@PathVariable Long id) {
        try {
            Produto produto = produtoService.findById(id);
            return ResponseEntity.ok(new ProdutoDTO(produto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/buscar")
    @Operation(summary = "Busca produtos por nome")
    public ResponseEntity<List<ProdutoDTO>> buscarPorNome(@RequestParam String nome) {
        try {
            List<Produto> produtos = produtoService.findByProduto(nome);
            List<ProdutoDTO> produtosDTO = produtos.stream()
                    .map(ProdutoDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(produtosDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/codigo-barras/{codigoBarras}")
    @Operation(summary = "Busca produto por código de barras")
    public ResponseEntity<ProdutoDTO> buscarPorCodigoBarras(@PathVariable String codigoBarras) {
        try {
            Optional<Produto> produto = produtoService.findByCodigoBarras(codigoBarras);
            if (produto.isPresent()) {
                return ResponseEntity.ok(new ProdutoDTO(produto.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/referencia/{referencia}")
    @Operation(summary = "Busca produto por referência")
    public ResponseEntity<ProdutoDTO> buscarPorReferencia(@PathVariable String referencia) {
        try {
            Optional<Produto> produto = produtoService.findByReferencia(referencia);
            if (produto.isPresent()) {
                return ResponseEntity.ok(new ProdutoDTO(produto.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo produto")
    public ResponseEntity<ProdutoDTO> criar(@RequestBody ProdutoDTO produtoDTO) {
        try {
            Produto produto = produtoDTO.toEntity();
            produto = produtoService.save(produto);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ProdutoDTO(produto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um produto")
    public ResponseEntity<ProdutoDTO> atualizar(@PathVariable Long id, @RequestBody ProdutoDTO produtoDTO) {
        try {
            Produto produto = produtoDTO.toEntity();
            produto.setId(id);
            produto = produtoService.save(produto);
            return ResponseEntity.ok(new ProdutoDTO(produto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um produto")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        try {
            produtoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 