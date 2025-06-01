package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.FuncionarioDTO;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Funcionario;
import com.example.PizzariaGraff.service.FuncionarioService;
import com.example.PizzariaGraff.service.CidadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/funcionarios")
@CrossOrigin(origins = "*")
@Tag(name = "Funcionários", description = "API para gerenciamento de funcionários")
public class FuncionarioController {

    private final FuncionarioService funcionarioService;
    private final CidadeService cidadeService;

    public FuncionarioController(FuncionarioService funcionarioService, CidadeService cidadeService) {
        this.funcionarioService = funcionarioService;
        this.cidadeService = cidadeService;
    }

    @GetMapping
    @Operation(summary = "Lista todos os funcionários")
    public ResponseEntity<List<FuncionarioDTO>> listar() {
        List<Funcionario> funcionarios = funcionarioService.findAll();
        List<FuncionarioDTO> funcionariosDTO = funcionarios.stream()
                .map(FuncionarioDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(funcionariosDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um funcionário por ID")
    public ResponseEntity<FuncionarioDTO> buscarPorId(@PathVariable Long id) {
        try {
            Funcionario funcionario = funcionarioService.findById(id);
            return ResponseEntity.ok(new FuncionarioDTO(funcionario));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/nome/{funcionario}")
    @Operation(summary = "Busca funcionários por nome")
    public ResponseEntity<List<FuncionarioDTO>> buscarPorNome(@PathVariable String funcionario) {
        List<Funcionario> funcionarios = funcionarioService.findByFuncionario(funcionario);
        List<FuncionarioDTO> funcionariosDTO = funcionarios.stream()
                .map(FuncionarioDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(funcionariosDTO);
    }

    @GetMapping("/cpfcpnj/{cpfCpnj}")
    @Operation(summary = "Busca funcionários por CPF/CNPJ")
    public ResponseEntity<List<FuncionarioDTO>> buscarPorCpfCpnj(@PathVariable String cpfCpnj) {
        List<Funcionario> funcionarios = funcionarioService.findByCpfCpnj(cpfCpnj);
        List<FuncionarioDTO> funcionariosDTO = funcionarios.stream()
                .map(FuncionarioDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(funcionariosDTO);
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Busca um funcionário por email")
    public ResponseEntity<FuncionarioDTO> buscarPorEmail(@PathVariable String email) {
        try {
            Funcionario funcionario = funcionarioService.findByEmail(email);
            return ResponseEntity.ok(new FuncionarioDTO(funcionario));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/funcao/{funcaoId}")
    @Operation(summary = "Busca funcionários por função")
    public ResponseEntity<List<FuncionarioDTO>> buscarPorFuncao(@PathVariable Long funcaoId) {
        List<Funcionario> funcionarios = funcionarioService.findByFuncaoFuncionarioId(funcaoId);
        List<FuncionarioDTO> funcionariosDTO = funcionarios.stream()
                .map(FuncionarioDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(funcionariosDTO);
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo funcionário")
    public ResponseEntity<FuncionarioDTO> criar(@RequestBody FuncionarioDTO funcionarioDTO) {
        try {
            Funcionario funcionario = funcionarioDTO.toEntity();
            
            Funcionario funcionarioSalvo = funcionarioService.save(funcionario);
            return new ResponseEntity<>(new FuncionarioDTO(funcionarioSalvo), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um funcionário")
    public ResponseEntity<FuncionarioDTO> atualizar(@PathVariable Long id, @RequestBody FuncionarioDTO funcionarioDTO) {
        try {
            // Verificar se o funcionário existe
            funcionarioService.findById(id);
            
            Funcionario funcionario = funcionarioDTO.toEntity();
            funcionario.setId(id);
            
            Funcionario funcionarioAtualizado = funcionarioService.save(funcionario);
            return ResponseEntity.ok(new FuncionarioDTO(funcionarioAtualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um funcionário")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        try {
            funcionarioService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 