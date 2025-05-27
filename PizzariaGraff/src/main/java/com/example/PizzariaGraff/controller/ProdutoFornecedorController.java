package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.ProdutoFornecedorDTO;
import com.example.PizzariaGraff.model.Fornecedor;
import com.example.PizzariaGraff.model.Produto;
import com.example.PizzariaGraff.model.ProdutoFornecedor;
import com.example.PizzariaGraff.service.FornecedorService;
import com.example.PizzariaGraff.service.ProdutoService;
import com.example.PizzariaGraff.service.ProdutoFornecedorService;
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
@RequestMapping("/produtos-fornecedores")
@Tag(name = "Produtos de Fornecedores", description = "API para gerenciamento de produtos de fornecedores")
public class ProdutoFornecedorController {
    
    private final ProdutoFornecedorService produtoFornecedorService;
    private final ProdutoService produtoService;
    private final FornecedorService fornecedorService;
    
    public ProdutoFornecedorController(ProdutoFornecedorService produtoFornecedorService, 
                                     ProdutoService produtoService, 
                                     FornecedorService fornecedorService) {
        this.produtoFornecedorService = produtoFornecedorService;
        this.produtoService = produtoService;
        this.fornecedorService = fornecedorService;
    }
    
    @GetMapping
    @Operation(summary = "Listar todos os produtos de fornecedores")
    public ResponseEntity<List<ProdutoFornecedorDTO>> listar() {
        List<ProdutoFornecedor> produtosFornecedores = produtoFornecedorService.findAll();
        List<ProdutoFornecedorDTO> dtos = produtosFornecedores.stream()
                .map(ProdutoFornecedorDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/ativos")
    @Operation(summary = "Listar produtos de fornecedores ativos")
    public ResponseEntity<List<ProdutoFornecedorDTO>> listarAtivos() {
        List<ProdutoFornecedor> produtosFornecedores = produtoFornecedorService.findByAtivoTrue();
        List<ProdutoFornecedorDTO> dtos = produtosFornecedores.stream()
                .map(ProdutoFornecedorDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Buscar produto de fornecedor por ID")
    public ResponseEntity<ProdutoFornecedorDTO> buscarPorId(@PathVariable Long id) {
        ProdutoFornecedor produtoFornecedor = produtoFornecedorService.findById(id);
        return ResponseEntity.ok(ProdutoFornecedorDTO.fromEntity(produtoFornecedor));
    }
    
    @GetMapping("/produto/{produtoId}")
    @Operation(summary = "Listar produtos de fornecedores por produto")
    public ResponseEntity<List<ProdutoFornecedorDTO>> listarPorProduto(@PathVariable Long produtoId) {
        List<ProdutoFornecedor> produtosFornecedores = produtoFornecedorService.findByProdutoId(produtoId);
        List<ProdutoFornecedorDTO> dtos = produtosFornecedores.stream()
                .map(ProdutoFornecedorDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/fornecedor/{fornecedorId}")
    @Operation(summary = "Listar produtos de fornecedores por fornecedor")
    public ResponseEntity<List<ProdutoFornecedorDTO>> listarPorFornecedor(@PathVariable Long fornecedorId) {
        List<ProdutoFornecedor> produtosFornecedores = produtoFornecedorService.findByFornecedorId(fornecedorId);
        List<ProdutoFornecedorDTO> dtos = produtosFornecedores.stream()
                .map(ProdutoFornecedorDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @PostMapping
    @Operation(summary = "Criar um novo produto de fornecedor")
    public ResponseEntity<ProdutoFornecedorDTO> criar(@RequestBody ProdutoFornecedorDTO dto) {
        try {
            ProdutoFornecedor produtoFornecedor = new ProdutoFornecedor();
            produtoFornecedor.setCodigoProd(dto.getCodigoProd());
            produtoFornecedor.setCusto(dto.getCusto());
            produtoFornecedor.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
            
            if (dto.getProdutoId() != null) {
                Produto produto = produtoService.findById(dto.getProdutoId());
                produtoFornecedor.setProduto(produto);
            }
            
            if (dto.getFornecedorId() != null) {
                Fornecedor fornecedor = fornecedorService.findById(dto.getFornecedorId());
                produtoFornecedor.setFornecedor(fornecedor);
            }
            
            ProdutoFornecedor salvo = produtoFornecedorService.save(produtoFornecedor);
            return ResponseEntity.status(HttpStatus.CREATED).body(ProdutoFornecedorDTO.fromEntity(salvo));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar um produto de fornecedor existente")
    public ResponseEntity<ProdutoFornecedorDTO> atualizar(@PathVariable Long id, @RequestBody ProdutoFornecedorDTO dto) {
        try {
            ProdutoFornecedor produtoFornecedor = produtoFornecedorService.findById(id);
            
            produtoFornecedor.setCodigoProd(dto.getCodigoProd());
            produtoFornecedor.setCusto(dto.getCusto());
            produtoFornecedor.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : produtoFornecedor.getAtivo());
            
            if (dto.getProdutoId() != null) {
                Produto produto = produtoService.findById(dto.getProdutoId());
                produtoFornecedor.setProduto(produto);
            } else {
                produtoFornecedor.setProduto(null);
            }
            
            if (dto.getFornecedorId() != null) {
                Fornecedor fornecedor = fornecedorService.findById(dto.getFornecedorId());
                produtoFornecedor.setFornecedor(fornecedor);
            } else {
                produtoFornecedor.setFornecedor(null);
            }
            
            ProdutoFornecedor atualizado = produtoFornecedorService.save(produtoFornecedor);
            return ResponseEntity.ok(ProdutoFornecedorDTO.fromEntity(atualizado));
        } catch (RuntimeException e) {
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir um produto de fornecedor")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            produtoFornecedorService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 