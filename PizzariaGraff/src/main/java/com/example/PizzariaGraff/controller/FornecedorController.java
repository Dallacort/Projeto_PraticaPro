package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.FornecedorDTO;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Fornecedor;
import com.example.PizzariaGraff.service.CidadeService;
import com.example.PizzariaGraff.service.FornecedorService;
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
@RequestMapping("/fornecedores")
@Tag(name = "Fornecedores", description = "API para gerenciamento de fornecedores")
public class FornecedorController {

    private final FornecedorService fornecedorService;
    private final CidadeService cidadeService;

    public FornecedorController(FornecedorService fornecedorService, CidadeService cidadeService) {
        this.fornecedorService = fornecedorService;
        this.cidadeService = cidadeService;
    }

    @GetMapping
    @Operation(summary = "Lista todos os fornecedores")
    public ResponseEntity<?> listar() {
        try {
            System.out.println("Iniciando busca de todos os fornecedores");
            
            List<Fornecedor> fornecedores = fornecedorService.findAll();
            System.out.println("Fornecedores encontrados: " + fornecedores.size());
            
            List<FornecedorDTO> fornecedoresDTO = fornecedores.stream()
                    .map(fornecedor -> {
                        try {
                            return FornecedorDTO.fromEntity(fornecedor);
                        } catch (Exception e) {
                            System.err.println("Erro ao converter fornecedor para DTO: " + e.getMessage());
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            
            System.out.println("DTOs criados com sucesso: " + fornecedoresDTO.size());
            return ResponseEntity.ok(fornecedoresDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar fornecedores: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(criarErroResponse("Erro ao listar fornecedores", e));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um fornecedor por ID")
    public ResponseEntity<FornecedorDTO> buscarPorId(@PathVariable Long id) {
        try {
            Fornecedor fornecedor = fornecedorService.findById(id);
            return ResponseEntity.ok(FornecedorDTO.fromEntity(fornecedor));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/cnpj/{cnpj}")
    @Operation(summary = "Busca um fornecedor por CNPJ")
    public ResponseEntity<FornecedorDTO> buscarPorCnpj(@PathVariable String cnpj) {
        try {
            Fornecedor fornecedor = fornecedorService.findByCnpj(cnpj);
            return ResponseEntity.ok(FornecedorDTO.fromEntity(fornecedor));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo fornecedor")
    public ResponseEntity<?> criar(@RequestBody FornecedorDTO fornecedorDTO) {
        try {
            System.out.println("Recebendo requisição para salvar fornecedor: " + fornecedorDTO);
            System.out.println("Dados recebidos - razão social: " + fornecedorDTO.getRazaoSocial() + 
                               ", nome fantasia: " + fornecedorDTO.getNomeFantasia() +
                               ", CNPJ: " + fornecedorDTO.getCnpj() +
                               ", cidade ID: " + fornecedorDTO.getCidadeId());
            
            Map<String, Object> erro = new HashMap<>();
            
            if (fornecedorDTO.getRazaoSocial() == null || fornecedorDTO.getRazaoSocial().trim().isEmpty()) {
                erro.put("campo", "razaoSocial");
                erro.put("mensagem", "A razão social é obrigatória");
                System.out.println("Erro: Razão social não informada");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
            }
            
            if (fornecedorDTO.getCnpj() == null || fornecedorDTO.getCnpj().trim().isEmpty()) {
                erro.put("campo", "cnpj");
                erro.put("mensagem", "O CNPJ é obrigatório");
                System.out.println("Erro: CNPJ não informado");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
            }
            
            if (fornecedorDTO.getCidadeId() == null) {
                erro.put("campo", "cidadeId");
                erro.put("mensagem", "A cidade é obrigatória");
                System.out.println("Erro: Cidade não informada");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
            }
            
            try {
                System.out.println("Tentando encontrar a cidade com ID: " + fornecedorDTO.getCidadeId());
                Cidade cidade = cidadeService.findById(fornecedorDTO.getCidadeId());
                System.out.println("Cidade encontrada: ID=" + cidade.getId() + ", Nome=" + cidade.getNome());
                
                System.out.println("Convertendo DTO para entidade...");
                Fornecedor fornecedor = fornecedorDTO.toEntity(cidade);
                
                System.out.println("Salvando fornecedor...");
                fornecedor = fornecedorService.save(fornecedor);
                System.out.println("Fornecedor salvo com sucesso: ID=" + fornecedor.getId());
                
                FornecedorDTO novoDto = FornecedorDTO.fromEntity(fornecedor);
                System.out.println("DTO criado com sucesso. Retornando resposta 201 Created");
                return ResponseEntity.status(HttpStatus.CREATED).body(novoDto);
            } catch (Exception e) {
                System.err.println("Erro ao processar cidade ou salvar fornecedor: " + e.getMessage());
                e.printStackTrace();
                
                erro = new HashMap<>();
                
                if (e.getMessage() != null && e.getMessage().contains("cidade")) {
                    erro.put("tipo", "cidade_nao_encontrada");
                    erro.put("mensagem", "Não foi possível encontrar a cidade com ID " + fornecedorDTO.getCidadeId());
                    System.out.println("Erro: Cidade não encontrada");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
                } else if (e.getMessage() != null && e.getMessage().contains("cnpj")) {
                    erro.put("tipo", "cnpj_duplicado");
                    erro.put("mensagem", "O CNPJ informado já está cadastrado no sistema");
                    System.out.println("Erro: CNPJ duplicado");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
                } else {
                    erro.put("tipo", "erro_processamento");
                    erro.put("mensagem", "Erro ao processar requisição: " + e.getMessage());
                    System.out.println("Erro desconhecido: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
                }
            }
        } catch (Exception e) {
            System.err.println("Erro geral não tratado ao processar requisição: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> erro = new HashMap<>();
            erro.put("erro", "Erro interno ao processar requisição");
            erro.put("mensagem", e.getMessage());
            erro.put("tipo", "erro_interno");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um fornecedor")
    public ResponseEntity<FornecedorDTO> atualizar(@PathVariable Long id, @RequestBody FornecedorDTO fornecedorDTO) {
        try {
            Cidade cidade = cidadeService.findById(fornecedorDTO.getCidadeId());
            Fornecedor fornecedor = fornecedorDTO.toEntity(cidade);
            fornecedor.setId(id);
            fornecedor = fornecedorService.save(fornecedor);
            return ResponseEntity.ok(FornecedorDTO.fromEntity(fornecedor));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um fornecedor")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        fornecedorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> criarErroResponse(String mensagem, Exception e) {
        Map<String, Object> erro = new HashMap<>();
        erro.put("mensagem", mensagem);
        erro.put("erro", e.getMessage());
        
        if (e.getCause() != null) {
            erro.put("causa", e.getCause().getMessage());
        }
        
        return erro;
    }
} 