package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.NotaEntradaDTO;
import com.example.PizzariaGraff.model.NotaEntrada;
import com.example.PizzariaGraff.service.NotaEntradaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notas-entrada")
@CrossOrigin(origins = "*")
@Tag(name = "Notas de Entrada", description = "API para gerenciamento de notas fiscais de entrada")
public class NotaEntradaController {
    
    private final NotaEntradaService notaEntradaService;
    
    public NotaEntradaController(NotaEntradaService notaEntradaService) {
        this.notaEntradaService = notaEntradaService;
    }
    
    @GetMapping
    @Operation(summary = "Lista todas as notas de entrada")
    public ResponseEntity<List<NotaEntradaDTO>> listar() {
        try {
            List<NotaEntrada> notas = notaEntradaService.findAll();
            List<NotaEntradaDTO> notasDTO = notas.stream()
                    .map(NotaEntradaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(notasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar notas de entrada: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{numero}/{modelo}/{serie}/{fornecedorId}")
    @Operation(summary = "Busca uma nota de entrada pela chave composta")
    public ResponseEntity<NotaEntradaDTO> buscarPorChave(
            @PathVariable String numero,
            @PathVariable String modelo,
            @PathVariable String serie,
            @PathVariable Long fornecedorId) {
        try {
            NotaEntrada nota = notaEntradaService.findByChave(numero, modelo, serie, fornecedorId);
            return ResponseEntity.ok(new NotaEntradaDTO(nota));
        } catch (RuntimeException e) {
            System.err.println("Nota não encontrada: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Erro ao buscar nota: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/fornecedor/{fornecedorId}")
    @Operation(summary = "Lista notas de entrada por fornecedor")
    public ResponseEntity<List<NotaEntradaDTO>> listarPorFornecedor(@PathVariable Long fornecedorId) {
        try {
            List<NotaEntrada> notas = notaEntradaService.findByFornecedorId(fornecedorId);
            List<NotaEntradaDTO> notasDTO = notas.stream()
                    .map(NotaEntradaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(notasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar notas por fornecedor: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/situacao/{situacao}")
    @Operation(summary = "Lista notas de entrada por situação")
    public ResponseEntity<List<NotaEntradaDTO>> listarPorSituacao(@PathVariable String situacao) {
        try {
            List<NotaEntrada> notas = notaEntradaService.findBySituacao(situacao.toUpperCase());
            List<NotaEntradaDTO> notasDTO = notas.stream()
                    .map(NotaEntradaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(notasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar notas por situação: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    @Operation(summary = "Cadastra uma nova nota de entrada")
    public ResponseEntity<?> criar(@RequestBody NotaEntradaDTO notaDTO) {
        try {
            System.out.println("=== CONTROLLER POST NOTA ENTRADA ===");
            System.out.println("DTO recebido:");
            System.out.println("Número: " + notaDTO.getNumero());
            System.out.println("Modelo: " + notaDTO.getModelo());
            System.out.println("Série: " + notaDTO.getSerie());
            System.out.println("Fornecedor ID: " + notaDTO.getFornecedorId());
            System.out.println("Data Emissão: " + notaDTO.getDataEmissao());
            System.out.println("Data Chegada: " + notaDTO.getDataChegada());
            System.out.println("Tipo Frete: " + notaDTO.getTipoFrete());
            System.out.println("Valor Produtos: " + notaDTO.getValorProdutos());
            System.out.println("Valor Frete: " + notaDTO.getValorFrete());
            System.out.println("Valor Seguro: " + notaDTO.getValorSeguro());
            System.out.println("Outras Despesas: " + notaDTO.getOutrasDespesas());
            System.out.println("Valor Desconto: " + notaDTO.getValorDesconto());
            System.out.println("Valor Total: " + notaDTO.getValorTotal());
            System.out.println("Condição Pagamento ID: " + notaDTO.getCondicaoPagamentoId());
            System.out.println("Situação: " + notaDTO.getSituacao());
            System.out.println("Quantidade de produtos: " + (notaDTO.getProdutos() != null ? notaDTO.getProdutos().size() : 0));
            
            // Converter DTO para Entity
            NotaEntrada nota = notaDTO.toEntity();
            
            // Salvar nota
            NotaEntrada notaSalva = notaEntradaService.save(nota);
            System.out.println("Nota salva com sucesso!");
            System.out.println("Chave: " + notaSalva.getNumero() + "/" + notaSalva.getModelo() + "/" + 
                             notaSalva.getSerie() + "/" + notaSalva.getFornecedorId());
            
            return new ResponseEntity<>(new NotaEntradaDTO(notaSalva), HttpStatus.CREATED);
            
        } catch (IllegalArgumentException e) {
            System.err.println("ERRO DE VALIDAÇÃO no POST: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            System.err.println("ERRO RUNTIME no POST: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("ERRO GERAL no POST: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao salvar nota de entrada"));
        }
    }
    
    @PutMapping("/{numero}/{modelo}/{serie}/{fornecedorId}")
    @Operation(summary = "Atualiza uma nota de entrada")
    public ResponseEntity<?> atualizar(
            @PathVariable String numero,
            @PathVariable String modelo,
            @PathVariable String serie,
            @PathVariable Long fornecedorId,
            @RequestBody NotaEntradaDTO notaDTO) {
        try {
            System.out.println("=== CONTROLLER PUT NOTA ENTRADA ===");
            System.out.println("Chave: " + numero + "/" + modelo + "/" + serie + "/" + fornecedorId);
            
            // Verificar se a nota existe
            notaEntradaService.findByChave(numero, modelo, serie, fornecedorId);
            
            // Converter DTO para Entity
            NotaEntrada nota = notaDTO.toEntity();
            nota.setNumero(numero);
            nota.setModelo(modelo);
            nota.setSerie(serie);
            nota.setFornecedorId(fornecedorId);
            
            // Atualizar nota
            NotaEntrada notaAtualizada = notaEntradaService.save(nota);
            System.out.println("Nota atualizada com sucesso!");
            
            return ResponseEntity.ok(new NotaEntradaDTO(notaAtualizada));
            
        } catch (IllegalArgumentException e) {
            System.err.println("ERRO DE VALIDAÇÃO no PUT: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            System.err.println("ERRO RUNTIME no PUT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Nota de entrada não encontrada"));
        } catch (Exception e) {
            System.err.println("ERRO GERAL no PUT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao atualizar nota de entrada"));
        }
    }
    
    @DeleteMapping("/{numero}/{modelo}/{serie}/{fornecedorId}")
    @Operation(summary = "Remove uma nota de entrada")
    public ResponseEntity<?> remover(
            @PathVariable String numero,
            @PathVariable String modelo,
            @PathVariable String serie,
            @PathVariable Long fornecedorId) {
        try {
            System.out.println("=== CONTROLLER DELETE NOTA ENTRADA ===");
            System.out.println("Chave: " + numero + "/" + modelo + "/" + serie + "/" + fornecedorId);
            
            notaEntradaService.deleteByChave(numero, modelo, serie, fornecedorId);
            System.out.println("Nota removida com sucesso!");
            
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            System.err.println("Erro ao deletar nota: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Erro geral ao deletar nota: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Classe auxiliar para resposta de erro
    private static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}

