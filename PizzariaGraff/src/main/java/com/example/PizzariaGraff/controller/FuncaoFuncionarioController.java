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
            System.out.println("=== CONTROLLER PUT ===");
            System.out.println("ID: " + id);
            System.out.println("DTO recebido:");
            System.out.println("FuncaoFuncionario: " + funcaoDTO.getFuncaoFuncionario());
            System.out.println("RequerCNH: " + funcaoDTO.getRequerCNH());
            System.out.println("CargaHoraria: " + funcaoDTO.getCargaHoraria());
            System.out.println("Descricao: " + funcaoDTO.getDescricao());
            System.out.println("Observacao: " + funcaoDTO.getObservacao());
            System.out.println("SalarioBase: " + funcaoDTO.getSalarioBase());
            System.out.println("Ativo: " + funcaoDTO.getAtivo());
            
            FuncaoFuncionario funcao = funcaoDTO.toEntity();
            funcao.setId(id);
            
            System.out.println("Entity antes de salvar:");
            System.out.println("FuncaoFuncionario: " + funcao.getFuncaoFuncionario());
            System.out.println("RequerCNH: " + funcao.getRequerCNH());
            System.out.println("CargaHoraria: " + funcao.getCargaHoraria());
            System.out.println("Descricao: " + funcao.getDescricao());
            System.out.println("Observacao: " + funcao.getObservacao());
            System.out.println("SalarioBase: " + funcao.getSalarioBase());
            System.out.println("Ativo: " + funcao.getAtivo());
            
            funcao = funcaoFuncionarioService.save(funcao);
            
            FuncaoFuncionarioDTO responseDTO = FuncaoFuncionarioDTO.fromEntity(funcao);
            
            System.out.println("DTO de resposta:");
            System.out.println("FuncaoFuncionario: " + responseDTO.getFuncaoFuncionario());
            System.out.println("RequerCNH: " + responseDTO.getRequerCNH());
            System.out.println("CargaHoraria: " + responseDTO.getCargaHoraria());
            System.out.println("Descricao: " + responseDTO.getDescricao());
            System.out.println("Observacao: " + responseDTO.getObservacao());
            System.out.println("SalarioBase: " + responseDTO.getSalarioBase());
            System.out.println("Ativo: " + responseDTO.getAtivo());
            System.out.println("=====================");
            
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            System.err.println("Erro no controller: " + e.getMessage());
            e.printStackTrace();
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