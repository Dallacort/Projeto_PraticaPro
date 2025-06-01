package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.FuncaoFuncionarioDTO;
import com.example.PizzariaGraff.model.FuncaoFuncionario;
import com.example.PizzariaGraff.service.FuncaoFuncionarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/funcoes-funcionario")
@Tag(name = "Funções de Funcionário", description = "API para gerenciamento de funções de funcionário")
public class FuncaoFuncionarioController {

    private final FuncaoFuncionarioService funcaoFuncionarioService;

    public FuncaoFuncionarioController(FuncaoFuncionarioService funcaoFuncionarioService) {
        this.funcaoFuncionarioService = funcaoFuncionarioService;
    }

    @GetMapping
    @Operation(summary = "Lista todas as funções de funcionário")
    public ResponseEntity<List<FuncaoFuncionarioDTO>> listar() {
        List<FuncaoFuncionario> funcoes = funcaoFuncionarioService.findAll();
        List<FuncaoFuncionarioDTO> funcoesDTO = funcoes.stream()
                .map(FuncaoFuncionarioDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(funcoesDTO);
    }

    @GetMapping("/ativas")
    @Operation(summary = "Lista todas as funções de funcionário ativas")
    public ResponseEntity<List<FuncaoFuncionarioDTO>> listarAtivas() {
        List<FuncaoFuncionario> funcoes = funcaoFuncionarioService.findAllAtivos();
        List<FuncaoFuncionarioDTO> funcoesDTO = funcoes.stream()
                .map(FuncaoFuncionarioDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(funcoesDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca uma função de funcionário por ID")
    public ResponseEntity<FuncaoFuncionarioDTO> buscarPorId(@PathVariable Long id) {
        try {
            FuncaoFuncionario funcao = funcaoFuncionarioService.findById(id);
            return ResponseEntity.ok(FuncaoFuncionarioDTO.fromEntity(funcao));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Cadastra uma nova função de funcionário")
    public ResponseEntity<FuncaoFuncionarioDTO> criar(@RequestBody FuncaoFuncionarioDTO funcaoDTO) {
        try {
            FuncaoFuncionario funcao = funcaoDTO.toEntity();
            funcao = funcaoFuncionarioService.save(funcao);
            return ResponseEntity.status(HttpStatus.CREATED).body(FuncaoFuncionarioDTO.fromEntity(funcao));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma função de funcionário")
    public ResponseEntity<FuncaoFuncionarioDTO> atualizar(@PathVariable Long id, @RequestBody FuncaoFuncionarioDTO funcaoDTO) {
        try {
            FuncaoFuncionario funcao = funcaoDTO.toEntity();
            funcao.setId(id);
            funcao = funcaoFuncionarioService.save(funcao);
            return ResponseEntity.ok(FuncaoFuncionarioDTO.fromEntity(funcao));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove uma função de funcionário")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        try {
            funcaoFuncionarioService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 