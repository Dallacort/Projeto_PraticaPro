package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.ContaPagarDTO;
import com.example.PizzariaGraff.model.ContaPagar;
import com.example.PizzariaGraff.service.ContaPagarService;
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
@RequestMapping("/contas-pagar")
@CrossOrigin(origins = "*")
@Tag(name = "Contas a Pagar", description = "API para gerenciamento de contas a pagar")
public class ContaPagarController {
    
    private final ContaPagarService contaPagarService;
    
    public ContaPagarController(ContaPagarService contaPagarService) {
        this.contaPagarService = contaPagarService;
    }
    
    @GetMapping
    @Operation(summary = "Lista todas as contas a pagar")
    public ResponseEntity<List<ContaPagarDTO>> listar() {
        try {
            List<ContaPagar> contas = contaPagarService.findAll();
            List<ContaPagarDTO> contasDTO = contas.stream()
                    .map(ContaPagarDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas a pagar: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Busca uma conta a pagar por ID")
    public ResponseEntity<ContaPagarDTO> buscarPorId(@PathVariable Long id) {
        try {
            ContaPagar conta = contaPagarService.findById(id);
            return ResponseEntity.ok(new ContaPagarDTO(conta));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Erro ao buscar conta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/fornecedor/{fornecedorId}")
    @Operation(summary = "Lista contas por fornecedor")
    public ResponseEntity<List<ContaPagarDTO>> listarPorFornecedor(@PathVariable Long fornecedorId) {
        try {
            List<ContaPagar> contas = contaPagarService.findByFornecedorId(fornecedorId);
            List<ContaPagarDTO> contasDTO = contas.stream()
                    .map(ContaPagarDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas por fornecedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/situacao/{situacao}")
    @Operation(summary = "Lista contas por situação")
    public ResponseEntity<List<ContaPagarDTO>> listarPorSituacao(@PathVariable String situacao) {
        try {
            List<ContaPagar> contas = contaPagarService.findBySituacao(situacao.toUpperCase());
            List<ContaPagarDTO> contasDTO = contas.stream()
                    .map(ContaPagarDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas por situação: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/vencidas")
    @Operation(summary = "Lista contas vencidas")
    public ResponseEntity<List<ContaPagarDTO>> listarVencidas() {
        try {
            List<ContaPagar> contas = contaPagarService.findVencidas();
            List<ContaPagarDTO> contasDTO = contas.stream()
                    .map(ContaPagarDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas vencidas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/pagar")
    @Operation(summary = "Registra pagamento de uma conta")
    public ResponseEntity<?> pagar(
            @PathVariable Long id,
            @RequestBody PagamentoRequest request) {
        try {
            ContaPagar conta = contaPagarService.pagar(
                    id,
                    request.getValorPago(),
                    request.getDataPagamento(),
                    request.getFormaPagamentoId()
            );
            return ResponseEntity.ok(new ContaPagarDTO(conta));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erro ao registrar pagamento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao registrar pagamento"));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma conta a pagar")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody ContaPagarDTO contaDTO) {
        try {
            contaDTO.setId(id);
            ContaPagar conta = contaDTO.toEntity();
            ContaPagar contaAtualizada = contaPagarService.save(conta);
            return ResponseEntity.ok(new ContaPagarDTO(contaAtualizada));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erro ao atualizar conta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao atualizar conta"));
        }
    }
    
    @DeleteMapping("/{id}/cancelar")
    @Operation(summary = "Cancela uma conta a pagar")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        try {
            contaPagarService.cancelar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erro ao cancelar conta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Remove uma conta a pagar")
    public ResponseEntity<?> remover(@PathVariable Long id) {
        try {
            contaPagarService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Erro ao deletar conta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Classes auxiliares
    private static class PagamentoRequest {
        private BigDecimal valorPago;
        private LocalDate dataPagamento;
        private Long formaPagamentoId;
        
        public BigDecimal getValorPago() { return valorPago; }
        public void setValorPago(BigDecimal valorPago) { this.valorPago = valorPago; }
        
        public LocalDate getDataPagamento() { return dataPagamento; }
        public void setDataPagamento(LocalDate dataPagamento) { this.dataPagamento = dataPagamento; }
        
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

