package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.NotaSaidaDTO;
import com.example.PizzariaGraff.model.NotaSaida;
import com.example.PizzariaGraff.service.NotaSaidaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notas-saida")
@CrossOrigin(origins = "*")
@Tag(name = "Notas de Saída", description = "API para gerenciamento de notas fiscais de saída")
public class NotaSaidaController {
    
    private final NotaSaidaService notaSaidaService;
    
    public NotaSaidaController(NotaSaidaService notaSaidaService) {
        this.notaSaidaService = notaSaidaService;
    }
    
    @GetMapping
    @Operation(summary = "Lista todas as notas de saída")
    public ResponseEntity<List<NotaSaidaDTO>> listar() {
        try {
            List<NotaSaida> notas = notaSaidaService.findAll();
            List<NotaSaidaDTO> notasDTO = notas.stream()
                    .map(NotaSaidaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(notasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar notas de saída: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{numero}/{modelo}/{serie}/{clienteId}")
    @Operation(summary = "Busca uma nota de saída pela chave composta")
    public ResponseEntity<NotaSaidaDTO> buscarPorChave(
            @PathVariable String numero,
            @PathVariable String modelo,
            @PathVariable String serie,
            @PathVariable Long clienteId) {
        try {
            NotaSaida nota = notaSaidaService.findByChave(numero, modelo, serie, clienteId);
            return ResponseEntity.ok(new NotaSaidaDTO(nota));
        } catch (RuntimeException e) {
            System.err.println("Nota não encontrada: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Erro ao buscar nota: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/cliente/{clienteId}")
    @Operation(summary = "Lista notas de saída por cliente")
    public ResponseEntity<List<NotaSaidaDTO>> listarPorCliente(@PathVariable Long clienteId) {
        try {
            List<NotaSaida> notas = notaSaidaService.findByClienteId(clienteId);
            List<NotaSaidaDTO> notasDTO = notas.stream()
                    .map(NotaSaidaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(notasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar notas por cliente: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/situacao/{situacao}")
    @Operation(summary = "Lista notas de saída por situação")
    public ResponseEntity<List<NotaSaidaDTO>> listarPorSituacao(@PathVariable String situacao) {
        try {
            List<NotaSaida> notas = notaSaidaService.findBySituacao(situacao.toUpperCase());
            List<NotaSaidaDTO> notasDTO = notas.stream()
                    .map(NotaSaidaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(notasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar notas por situação: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    @Operation(summary = "Cadastra uma nova nota de saída")
    public ResponseEntity<?> criar(@RequestBody NotaSaidaDTO notaDTO) {
        try {
            System.out.println("=== CONTROLLER POST NOTA SAÍDA ===");
            System.out.println("DTO recebido:");
            System.out.println("Número: " + notaDTO.getNumero());
            System.out.println("Modelo: " + notaDTO.getModelo());
            System.out.println("Série: " + notaDTO.getSerie());
            System.out.println("Cliente ID: " + notaDTO.getClienteId());
            System.out.println("Data Emissão: " + notaDTO.getDataEmissao());
            System.out.println("Data Saída: " + notaDTO.getDataSaida());
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
            NotaSaida nota = notaDTO.toEntity();
            
            // Salvar nota
            NotaSaida notaSalva = notaSaidaService.save(nota);
            System.out.println("Nota salva com sucesso!");
            System.out.println("Chave: " + notaSalva.getNumero() + "/" + notaSalva.getModelo() + "/" + 
                             notaSalva.getSerie() + "/" + notaSalva.getClienteId());
            
            return new ResponseEntity<>(new NotaSaidaDTO(notaSalva), HttpStatus.CREATED);
            
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
                    .body(new ErrorResponse("Erro ao salvar nota de saída"));
        }
    }
    
    @PutMapping("/{numero}/{modelo}/{serie}/{clienteId}")
    @Operation(summary = "Atualiza uma nota de saída")
    public ResponseEntity<?> atualizar(
            @PathVariable String numero,
            @PathVariable String modelo,
            @PathVariable String serie,
            @PathVariable Long clienteId,
            @RequestBody NotaSaidaDTO notaDTO) {
        try {
            System.out.println("=== CONTROLLER PUT NOTA SAÍDA ===");
            System.out.println("Chave: " + numero + "/" + modelo + "/" + serie + "/" + clienteId);
            
            // Verificar se a nota existe
            notaSaidaService.findByChave(numero, modelo, serie, clienteId);
            
            // Converter DTO para Entity
            NotaSaida nota = notaDTO.toEntity();
            nota.setNumero(numero);
            nota.setModelo(modelo);
            nota.setSerie(serie);
            nota.setClienteId(clienteId);
            
            // Atualizar nota
            NotaSaida notaAtualizada = notaSaidaService.save(nota);
            System.out.println("Nota atualizada com sucesso!");
            
            return ResponseEntity.ok(new NotaSaidaDTO(notaAtualizada));
            
        } catch (IllegalArgumentException e) {
            System.err.println("ERRO DE VALIDAÇÃO no PUT: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            System.err.println("ERRO RUNTIME no PUT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Nota de saída não encontrada"));
        } catch (Exception e) {
            System.err.println("ERRO GERAL no PUT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao atualizar nota de saída"));
        }
    }
    
    @DeleteMapping("/{numero}/{modelo}/{serie}/{clienteId}")
    @Operation(summary = "Remove uma nota de saída")
    public ResponseEntity<?> remover(
            @PathVariable String numero,
            @PathVariable String modelo,
            @PathVariable String serie,
            @PathVariable Long clienteId) {
        try {
            System.out.println("=== CONTROLLER DELETE NOTA SAÍDA ===");
            System.out.println("Chave: " + numero + "/" + modelo + "/" + serie + "/" + clienteId);
            
            notaSaidaService.deleteByChave(numero, modelo, serie, clienteId);
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

