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
            System.out.println("=== CONTROLLER PUT FUNCIONARIO DEBUG ===");
            System.out.println("ID recebido: " + id);
            System.out.println("DTO recebido:");
            System.out.println("Funcionario: " + funcionarioDTO.getFuncionario());
            System.out.println("Apelido: " + funcionarioDTO.getApelido());
            System.out.println("Email: " + funcionarioDTO.getEmail());
            System.out.println("Telefone: " + funcionarioDTO.getTelefone());
            System.out.println("CidadeId: " + funcionarioDTO.getCidadeId());
            System.out.println("DataAdmissao: " + funcionarioDTO.getDataAdmissao());
            System.out.println("DataNascimento: " + funcionarioDTO.getDataNascimento());
            System.out.println("NacionalidadeId: " + funcionarioDTO.getNacionalidadeId());
            System.out.println("FuncaoFuncionarioId: " + funcionarioDTO.getFuncaoFuncionarioId());
            System.out.println("Ativo: " + funcionarioDTO.getAtivo());
            
            // Verificar se o funcionário existe
            System.out.println("=== VERIFICANDO SE FUNCIONARIO EXISTE ===");
            Funcionario funcionarioExistente;
            try {
                funcionarioExistente = funcionarioService.findById(id);
                System.out.println("Funcionário existente encontrado: " + funcionarioExistente.getId());
                System.out.println("Nome atual: " + funcionarioExistente.getFuncionario());
            } catch (RuntimeException e) {
                System.err.println("ERRO: Funcionário não encontrado com ID: " + id);
                System.err.println("Mensagem: " + e.getMessage());
                return ResponseEntity.notFound().build();
            }
            
            // Converter DTO para Entity
            System.out.println("=== CONVERTENDO DTO PARA ENTITY ===");
            Funcionario funcionario = funcionarioDTO.toEntity();
            funcionario.setId(id);
            
            System.out.println("Entity criada:");
            System.out.println("ID: " + funcionario.getId());
            System.out.println("Funcionario: " + funcionario.getFuncionario());
            System.out.println("Email: " + funcionario.getEmail());
            System.out.println("CidadeId: " + funcionario.getCidadeId());
            System.out.println("DataAdmissao: " + funcionario.getDataAdmissao());
            System.out.println("DataNascimento: " + funcionario.getDataNascimento());
            System.out.println("NacionalidadeId: " + funcionario.getNacionalidadeId());
            System.out.println("FuncaoFuncionarioId: " + funcionario.getFuncaoFuncionarioId());
            System.out.println("Ativo: " + funcionario.getAtivo());
            
            // Salvar
            System.out.println("=== SALVANDO FUNCIONARIO ===");
            Funcionario funcionarioAtualizado = funcionarioService.save(funcionario);
            System.out.println("Funcionário salvo com sucesso!");
            System.out.println("ID salvo: " + funcionarioAtualizado.getId());
            System.out.println("Nome salvo: " + funcionarioAtualizado.getFuncionario());
            System.out.println("DataAlteracao: " + funcionarioAtualizado.getDataAlteracao());
            
            // Criar resposta
            System.out.println("=== CRIANDO RESPOSTA ===");
            FuncionarioDTO responseDTO = new FuncionarioDTO(funcionarioAtualizado);
            System.out.println("DTO resposta criado: " + responseDTO.getFuncionario());
            
            return ResponseEntity.ok(responseDTO);
            
        } catch (IllegalArgumentException e) {
            System.err.println("ERRO DE VALIDAÇÃO no PUT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            System.err.println("ERRO RUNTIME no PUT: " + e.getMessage());
            System.err.println("Tipo do erro: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        } catch (Exception e) {
            System.err.println("ERRO GERAL no PUT: " + e.getMessage());
            System.err.println("Tipo do erro: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
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