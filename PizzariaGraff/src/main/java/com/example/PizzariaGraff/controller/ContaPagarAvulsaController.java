package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.ContaPagarAvulsaDTO;
import com.example.PizzariaGraff.model.ContaPagarAvulsa;
import com.example.PizzariaGraff.service.ContaPagarAvulsaService;
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
@RequestMapping("/contas-pagar-avulsa")
@CrossOrigin(origins = "*")
@Tag(name = "Contas a Pagar Avulsa", description = "API para gerenciamento de contas a pagar avulsas")
public class ContaPagarAvulsaController {
    
    private final ContaPagarAvulsaService contaPagarAvulsaService;
    
    public ContaPagarAvulsaController(ContaPagarAvulsaService contaPagarAvulsaService) {
        this.contaPagarAvulsaService = contaPagarAvulsaService;
    }
    
    @GetMapping
    @Operation(summary = "Lista todas as contas a pagar avulsas")
    public ResponseEntity<List<ContaPagarAvulsaDTO>> listar() {
        try {
            List<ContaPagarAvulsa> contas = contaPagarAvulsaService.findAll();
            List<ContaPagarAvulsaDTO> contasDTO = contas.stream()
                    .map(ContaPagarAvulsaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas a pagar avulsas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Busca uma conta a pagar avulsa por ID")
    public ResponseEntity<ContaPagarAvulsaDTO> buscarPorId(@PathVariable Long id) {
        try {
            ContaPagarAvulsa conta = contaPagarAvulsaService.findById(id);
            return ResponseEntity.ok(new ContaPagarAvulsaDTO(conta));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Erro ao buscar conta avulsa: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/fornecedor/{fornecedorId}")
    @Operation(summary = "Lista contas avulsas por fornecedor")
    public ResponseEntity<List<ContaPagarAvulsaDTO>> listarPorFornecedor(@PathVariable Long fornecedorId) {
        try {
            List<ContaPagarAvulsa> contas = contaPagarAvulsaService.findByFornecedorId(fornecedorId);
            List<ContaPagarAvulsaDTO> contasDTO = contas.stream()
                    .map(ContaPagarAvulsaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas por fornecedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Lista contas avulsas por status")
    public ResponseEntity<List<ContaPagarAvulsaDTO>> listarPorStatus(@PathVariable String status) {
        try {
            List<ContaPagarAvulsa> contas = contaPagarAvulsaService.findByStatus(status.toUpperCase());
            List<ContaPagarAvulsaDTO> contasDTO = contas.stream()
                    .map(ContaPagarAvulsaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas por status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/vencidas")
    @Operation(summary = "Lista contas avulsas vencidas")
    public ResponseEntity<List<ContaPagarAvulsaDTO>> listarVencidas() {
        try {
            List<ContaPagarAvulsa> contas = contaPagarAvulsaService.findVencidas();
            List<ContaPagarAvulsaDTO> contasDTO = contas.stream()
                    .map(ContaPagarAvulsaDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas vencidas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    @Operation(summary = "Cria uma nova conta a pagar avulsa")
    public ResponseEntity<?> criar(@RequestBody ContaPagarAvulsaDTO contaDTO) {
        try {
            ContaPagarAvulsa conta = contaDTO.toEntity();
            ContaPagarAvulsa contaSalva = contaPagarAvulsaService.save(conta);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ContaPagarAvulsaDTO(contaSalva));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erro ao criar conta avulsa: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao criar conta avulsa"));
        }
    }
    
    @PostMapping("/{id}/pagar")
    @Operation(summary = "Registra pagamento de uma conta avulsa")
    public ResponseEntity<?> pagar(
            @PathVariable Long id,
            @RequestBody PagamentoRequest request) {
        try {
            // Se data de pagamento não for fornecida, usar data atual
            LocalDate dataPagamento = request.getDataPagamento();
            if (dataPagamento == null) {
                dataPagamento = LocalDate.now();
            }
            
            ContaPagarAvulsa conta = contaPagarAvulsaService.pagar(
                    id,
                    request.getValorPago(),
                    dataPagamento,
                    request.getFormaPagamentoId()
            );
            return ResponseEntity.ok(new ContaPagarAvulsaDTO(conta));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erro ao registrar pagamento: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao registrar pagamento"));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma conta a pagar avulsa")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody ContaPagarAvulsaDTO contaDTO) {
        try {
            contaDTO.setId(id);
            ContaPagarAvulsa conta = contaDTO.toEntity();
            ContaPagarAvulsa contaAtualizada = contaPagarAvulsaService.save(conta);
            return ResponseEntity.ok(new ContaPagarAvulsaDTO(contaAtualizada));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erro ao atualizar conta avulsa: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao atualizar conta avulsa"));
        }
    }
    
    @DeleteMapping("/{id}/cancelar")
    @Operation(summary = "Cancela uma conta a pagar avulsa")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        try {
            contaPagarAvulsaService.cancelar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erro ao cancelar conta avulsa: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Remove uma conta a pagar avulsa")
    public ResponseEntity<?> remover(@PathVariable Long id) {
        try {
            contaPagarAvulsaService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Erro ao deletar conta avulsa: " + e.getMessage());
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

