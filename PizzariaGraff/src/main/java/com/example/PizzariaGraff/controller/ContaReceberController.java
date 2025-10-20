package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.ContaReceberDTO;
import com.example.PizzariaGraff.model.ContaReceber;
import com.example.PizzariaGraff.service.ContaReceberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/contas-receber")
@CrossOrigin(origins = "*")
@Tag(name = "Contas a Receber", description = "API para gerenciamento de contas a receber")
public class ContaReceberController {
    
    private final ContaReceberService contaReceberService;
    
    public ContaReceberController(ContaReceberService contaReceberService) {
        this.contaReceberService = contaReceberService;
    }
    
    @GetMapping
    @Operation(summary = "Lista todas as contas a receber")
    public ResponseEntity<List<ContaReceberDTO>> listar() {
        try {
            List<ContaReceber> contas = contaReceberService.findAll();
            List<ContaReceberDTO> contasDTO = contas.stream()
                    .map(ContaReceberDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas a receber: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Busca uma conta a receber por ID")
    public ResponseEntity<ContaReceberDTO> buscarPorId(@PathVariable Long id) {
        try {
            ContaReceber conta = contaReceberService.findById(id);
            return ResponseEntity.ok(new ContaReceberDTO(conta));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Erro ao buscar conta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/cliente/{clienteId}")
    @Operation(summary = "Lista contas por cliente")
    public ResponseEntity<List<ContaReceberDTO>> listarPorCliente(@PathVariable Long clienteId) {
        try {
            List<ContaReceber> contas = contaReceberService.findByClienteId(clienteId);
            List<ContaReceberDTO> contasDTO = contas.stream()
                    .map(ContaReceberDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas por cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/situacao/{situacao}")
    @Operation(summary = "Lista contas por situação")
    public ResponseEntity<List<ContaReceberDTO>> listarPorSituacao(@PathVariable String situacao) {
        try {
            List<ContaReceber> contas = contaReceberService.findBySituacao(situacao.toUpperCase());
            List<ContaReceberDTO> contasDTO = contas.stream()
                    .map(ContaReceberDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas por situação: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/vencidas")
    @Operation(summary = "Lista contas vencidas")
    public ResponseEntity<List<ContaReceberDTO>> listarVencidas() {
        try {
            List<ContaReceber> contas = contaReceberService.findVencidas();
            List<ContaReceberDTO> contasDTO = contas.stream()
                    .map(ContaReceberDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas vencidas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/receber")
    @Operation(summary = "Registra recebimento de uma conta")
    public ResponseEntity<?> receber(
            @PathVariable Long id,
            @RequestBody RecebimentoRequest request) {
        try {
            ContaReceber conta = contaReceberService.receber(
                    id,
                    request.getValorRecebido(),
                    request.getDataRecebimento(),
                    request.getFormaPagamentoId()
            );
            return ResponseEntity.ok(new ContaReceberDTO(conta));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erro ao registrar recebimento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao registrar recebimento"));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma conta a receber")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody ContaReceberDTO contaDTO) {
        try {
            contaDTO.setId(id);
            ContaReceber conta = contaDTO.toEntity();
            ContaReceber contaAtualizada = contaReceberService.save(conta);
            return ResponseEntity.ok(new ContaReceberDTO(contaAtualizada));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erro ao atualizar conta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao atualizar conta"));
        }
    }
    
    @DeleteMapping("/{id}/cancelar")
    @Operation(summary = "Cancela uma conta a receber")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        try {
            contaReceberService.cancelar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erro ao cancelar conta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Remove uma conta a receber")
    public ResponseEntity<?> remover(@PathVariable Long id) {
        try {
            contaReceberService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Erro ao deletar conta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Classes auxiliares
    private static class RecebimentoRequest {
        private BigDecimal valorRecebido;
        private LocalDate dataRecebimento;
        private Long formaPagamentoId;
        
        public BigDecimal getValorRecebido() { return valorRecebido; }
        public void setValorRecebido(BigDecimal valorRecebido) { this.valorRecebido = valorRecebido; }
        
        public LocalDate getDataRecebimento() { return dataRecebimento; }
        public void setDataRecebimento(LocalDate dataRecebimento) { this.dataRecebimento = dataRecebimento; }
        
        public Long getFormaPagamentoId() { return formaPagamentoId; }
        public void setFormaPagamentoId(Long formaPagamentoId) { this.formaPagamentoId = formaPagamentoId; }
    }
    
    private static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}

