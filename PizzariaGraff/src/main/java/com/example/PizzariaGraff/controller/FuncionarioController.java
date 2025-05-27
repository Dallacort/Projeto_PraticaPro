package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.FuncionarioDTO;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Funcionario;
import com.example.PizzariaGraff.repository.CidadeRepository;
import com.example.PizzariaGraff.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/funcionario")
@CrossOrigin(origins = "*")
public class FuncionarioController {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private CidadeRepository cidadeRepository;

    @GetMapping
    public ResponseEntity<List<FuncionarioDTO>> listarTodos() {
        List<Funcionario> funcionarios = funcionarioRepository.findAll();
        List<FuncionarioDTO> funcionariosDTO = funcionarios.stream()
                .map(FuncionarioDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(funcionariosDTO);
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<FuncionarioDTO>> listarAtivos() {
        List<Funcionario> funcionarios = funcionarioRepository.findAllAtivos();
        List<FuncionarioDTO> funcionariosDTO = funcionarios.stream()
                .map(FuncionarioDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(funcionariosDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuncionarioDTO> buscarPorId(@PathVariable Long id) {
        Optional<Funcionario> funcionario = funcionarioRepository.findById(id);
        return funcionario.map(value -> ResponseEntity.ok(FuncionarioDTO.fromEntity(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<List<FuncionarioDTO>> buscarPorNome(@PathVariable String nome) {
        List<Funcionario> funcionarios = funcionarioRepository.findByNome(nome);
        List<FuncionarioDTO> funcionariosDTO = funcionarios.stream()
                .map(FuncionarioDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(funcionariosDTO);
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<List<FuncionarioDTO>> buscarPorCpf(@PathVariable String cpf) {
        List<Funcionario> funcionarios = funcionarioRepository.findByCpf(cpf);
        List<FuncionarioDTO> funcionariosDTO = funcionarios.stream()
                .map(FuncionarioDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(funcionariosDTO);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<FuncionarioDTO> buscarPorEmail(@PathVariable String email) {
        Optional<Funcionario> funcionario = funcionarioRepository.findByEmail(email);
        return funcionario.map(value -> ResponseEntity.ok(FuncionarioDTO.fromEntity(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FuncionarioDTO> salvar(@RequestBody FuncionarioDTO funcionarioDTO) {
        Funcionario funcionario = funcionarioDTO.toEntity();
        
        // Buscar e settar a cidade se o id estiver presente
        if (funcionarioDTO.getCidadeId() != null) {
            Optional<Cidade> cidade = cidadeRepository.findById(funcionarioDTO.getCidadeId());
            cidade.ifPresent(funcionario::setCidade);
        }
        
        Funcionario funcionarioSalvo = funcionarioRepository.save(funcionario);
        return new ResponseEntity<>(FuncionarioDTO.fromEntity(funcionarioSalvo), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuncionarioDTO> atualizar(@PathVariable Long id, @RequestBody FuncionarioDTO funcionarioDTO) {
        Optional<Funcionario> funcionarioExistente = funcionarioRepository.findById(id);
        
        if (funcionarioExistente.isPresent()) {
            Funcionario funcionario = funcionarioDTO.toEntity();
            funcionario.setId(id);
            
            // Buscar e settar a cidade se o id estiver presente
            if (funcionarioDTO.getCidadeId() != null) {
                Optional<Cidade> cidade = cidadeRepository.findById(funcionarioDTO.getCidadeId());
                cidade.ifPresent(funcionario::setCidade);
            }
            
            Funcionario funcionarioAtualizado = funcionarioRepository.save(funcionario);
            return ResponseEntity.ok(FuncionarioDTO.fromEntity(funcionarioAtualizado));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        Optional<Funcionario> funcionario = funcionarioRepository.findById(id);
        
        if (funcionario.isPresent()) {
            funcionarioRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/desativar/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        Optional<Funcionario> funcionario = funcionarioRepository.findById(id);
        
        if (funcionario.isPresent()) {
            funcionarioRepository.softDeleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
} 