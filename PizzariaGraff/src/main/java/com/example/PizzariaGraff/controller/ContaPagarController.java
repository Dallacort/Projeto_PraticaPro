package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.ContaPagarDTO;
import com.example.PizzariaGraff.dto.ContaPagarAvulsaDTO;
import com.example.PizzariaGraff.model.ContaPagar;
import com.example.PizzariaGraff.model.ContaPagarAvulsa;
import com.example.PizzariaGraff.service.ContaPagarService;
import com.example.PizzariaGraff.service.ContaPagarAvulsaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/contas-pagar")
@CrossOrigin(origins = "*")
@Tag(name = "Contas a Pagar", description = "API para gerenciamento de contas a pagar")
public class ContaPagarController {
    
    private final ContaPagarService contaPagarService;
    private final ContaPagarAvulsaService contaPagarAvulsaService;
    
    public ContaPagarController(ContaPagarService contaPagarService,
                                 ContaPagarAvulsaService contaPagarAvulsaService) {
        this.contaPagarService = contaPagarService;
        this.contaPagarAvulsaService = contaPagarAvulsaService;
    }
    
    @GetMapping
    @Operation(summary = "Lista todas as contas a pagar (incluindo avulsas)")
    public ResponseEntity<List<ContaPagarDTO>> listar() {
        try {
            List<ContaPagarDTO> contasDTO = new ArrayList<>();
            
            // Buscar contas normais
            List<ContaPagar> contas = contaPagarService.findAll();
            LocalDate hoje = LocalDate.now();
            
            for (ContaPagar conta : contas) {
                ContaPagarDTO contaDTO = new ContaPagarDTO(conta);
                
                // Se a conta ainda não foi paga, calcular valor total com multa/juros baseado na data atual
                if (!conta.getSituacao().equals("PAGA") && !conta.getSituacao().equals("CANCELADA")) {
                    try {
                        BigDecimal valorTotalCalculado = contaPagarService.calcularValorTotalParaPagamento(
                            conta.getId(), hoje);
                        contaDTO.setValorTotal(valorTotalCalculado);
                    } catch (Exception e) {
                        // Se der erro, usar o valor total original
                        System.err.println("Erro ao calcular valor total para conta " + conta.getId() + ": " + e.getMessage());
                    }
                }
                
                contasDTO.add(contaDTO);
            }
            
            // Buscar contas avulsas e converter para ContaPagarDTO
            try {
                List<ContaPagarAvulsa> contasAvulsasEntities = contaPagarAvulsaService.findAll();
                System.out.println("Total de contas avulsas entities encontradas: " + contasAvulsasEntities.size());
                
                List<ContaPagarAvulsaDTO> contasAvulsas = contasAvulsasEntities.stream()
                        .map(ContaPagarAvulsaDTO::new)
                        .collect(Collectors.toList());
                
                System.out.println("Total de contas avulsas DTOs convertidas: " + contasAvulsas.size());
                
                for (ContaPagarAvulsaDTO contaAvulsa : contasAvulsas) {
                    try {
                        ContaPagarDTO contaDTO = new ContaPagarDTO();
                        // Manter ID original - contas avulsas têm sua própria tabela, então não há conflito
                        contaDTO.setId(contaAvulsa.getId());
                        contaDTO.setNotaNumero(contaAvulsa.getNumeroNota() != null ? contaAvulsa.getNumeroNota() : "");
                        contaDTO.setNotaModelo(contaAvulsa.getModelo() != null ? contaAvulsa.getModelo() : "");
                        contaDTO.setNotaSerie(contaAvulsa.getSerie() != null ? contaAvulsa.getSerie() : "");
                        contaDTO.setFornecedorId(contaAvulsa.getFornecedorId());
                        contaDTO.setFornecedorNome(contaAvulsa.getFornecedorNome() != null ? contaAvulsa.getFornecedorNome() : "");
                        contaDTO.setNumeroParcela(contaAvulsa.getNumParcela() != null ? contaAvulsa.getNumParcela() : 1);
                        contaDTO.setTotalParcelas(1); // Contas avulsas são sempre parcela única
                        contaDTO.setValorOriginal(contaAvulsa.getValorParcela() != null ? contaAvulsa.getValorParcela() : BigDecimal.ZERO);
                        contaDTO.setValorPago(contaAvulsa.getValorPago() != null ? contaAvulsa.getValorPago() : BigDecimal.ZERO);
                        contaDTO.setValorDesconto(contaAvulsa.getDesconto() != null ? contaAvulsa.getDesconto() : BigDecimal.ZERO);
                        contaDTO.setValorJuros(contaAvulsa.getJuros() != null ? contaAvulsa.getJuros() : BigDecimal.ZERO);
                        contaDTO.setValorMulta(contaAvulsa.getMulta() != null ? contaAvulsa.getMulta() : BigDecimal.ZERO);
                        
                        // Se a conta ainda não foi paga, calcular valor total com multa/juros baseado na data atual
                        BigDecimal valorTotal;
                        if (!contaAvulsa.getStatus().equals("PAGA") && !contaAvulsa.getStatus().equals("CANCELADA")) {
                            try {
                                valorTotal = contaPagarAvulsaService.calcularValorTotalParaPagamento(
                                    contaAvulsa.getId(), LocalDate.now());
                            } catch (Exception e) {
                                // Se der erro, calcular manualmente
                                System.err.println("Erro ao calcular valor total para conta avulsa " + contaAvulsa.getId() + ": " + e.getMessage());
                                valorTotal = contaAvulsa.getValorParcela();
                                if (contaAvulsa.getDataVencimento() != null && 
                                    LocalDate.now().isAfter(contaAvulsa.getDataVencimento())) {
                                    valorTotal = valorTotal
                                            .add(contaAvulsa.getJuros() != null ? contaAvulsa.getJuros() : BigDecimal.ZERO)
                                            .add(contaAvulsa.getMulta() != null ? contaAvulsa.getMulta() : BigDecimal.ZERO);
                                }
                                valorTotal = valorTotal.subtract(contaAvulsa.getDesconto() != null ? contaAvulsa.getDesconto() : BigDecimal.ZERO);
                            }
                        } else {
                            // Se já foi paga, usar o valor total já calculado
                            valorTotal = contaAvulsa.getValorParcela();
                            if (contaAvulsa.getDataPagamento() != null && 
                                contaAvulsa.getDataVencimento() != null &&
                                contaAvulsa.getDataPagamento().isAfter(contaAvulsa.getDataVencimento())) {
                                valorTotal = valorTotal
                                        .add(contaAvulsa.getJuros() != null ? contaAvulsa.getJuros() : BigDecimal.ZERO)
                                        .add(contaAvulsa.getMulta() != null ? contaAvulsa.getMulta() : BigDecimal.ZERO);
                            }
                            valorTotal = valorTotal.subtract(contaAvulsa.getDesconto() != null ? contaAvulsa.getDesconto() : BigDecimal.ZERO);
                        }
                        contaDTO.setValorTotal(valorTotal);
                        
                        contaDTO.setDataEmissao(contaAvulsa.getDataEmissao());
                        contaDTO.setDataVencimento(contaAvulsa.getDataVencimento());
                        contaDTO.setDataPagamento(contaAvulsa.getDataPagamento());
                        contaDTO.setFormaPagamentoId(contaAvulsa.getFormaPagamentoId());
                        contaDTO.setFormaPagamentoNome(contaAvulsa.getFormaPagamentoNome());
                        
                        // Mapear status para situação
                        String situacao = contaAvulsa.getStatus();
                        if (situacao != null) {
                            // Converter status para situação (PENDENTE, PAGA, VENCIDA, CANCELADA)
                            if (situacao.equals("PENDENTE")) {
                                contaDTO.setSituacao("PENDENTE");
                            } else if (situacao.equals("PAGA")) {
                                contaDTO.setSituacao("PAGA");
                            } else if (situacao.equals("VENCIDA")) {
                                contaDTO.setSituacao("VENCIDA");
                            } else if (situacao.equals("CANCELADA")) {
                                contaDTO.setSituacao("CANCELADA");
                            } else {
                                contaDTO.setSituacao(situacao); // Usar o status original se não houver mapeamento
                            }
                        } else {
                            contaDTO.setSituacao("PENDENTE");
                        }
                        
                        contaDTO.setObservacoes(contaAvulsa.getObservacao());
                        
                        contasDTO.add(contaDTO);
                        System.out.println("Conta avulsa convertida: ID=" + contaDTO.getId() + ", Fornecedor=" + contaDTO.getFornecedorNome());
                    } catch (Exception ex) {
                        System.err.println("Erro ao converter conta avulsa ID " + contaAvulsa.getId() + ": " + ex.getMessage());
                        ex.printStackTrace();
                    }
                }
            } catch (Exception ex) {
                System.err.println("Erro ao buscar contas avulsas: " + ex.getMessage());
                ex.printStackTrace();
            }
            
            return ResponseEntity.ok(contasDTO);
        } catch (Exception e) {
            System.err.println("Erro ao listar contas a pagar: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ArrayList<>()); // Retornar lista vazia em caso de erro para não quebrar o frontend
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
    
    @GetMapping("/{id}/calcular-valor")
    @Operation(summary = "Calcula o valor total a ser pago (incluindo multa e juros se aplicável)")
    public ResponseEntity<?> calcularValorTotal(
            @PathVariable Long id,
            @RequestParam(required = false) String dataPagamento) {
        try {
            LocalDate dataPag = dataPagamento != null ? LocalDate.parse(dataPagamento) : LocalDate.now();
            
            // Tentar primeiro como conta normal
            try {
                BigDecimal valorTotal = contaPagarService.calcularValorTotalParaPagamento(id, dataPag);
                return ResponseEntity.ok(new ValorTotalResponse(valorTotal));
            } catch (RuntimeException e) {
                // Se não encontrar como conta normal, tentar como conta avulsa
                try {
                    BigDecimal valorTotal = contaPagarAvulsaService.calcularValorTotalParaPagamento(id, dataPag);
                    return ResponseEntity.ok(new ValorTotalResponse(valorTotal));
                } catch (RuntimeException e2) {
                    return ResponseEntity.badRequest().body(new ErrorResponse("Conta a pagar não encontrada: ID " + id));
                }
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erro ao calcular valor total: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao calcular valor total"));
        }
    }
    
    @PostMapping("/{id}/pagar")
    @Operation(summary = "Registra pagamento de uma conta (normal ou avulsa)")
    public ResponseEntity<?> pagar(
            @PathVariable Long id,
            @RequestBody PagamentoRequest request) {
        try {
            // Tentar primeiro como conta normal
            try {
                ContaPagar conta = contaPagarService.pagar(
                        id,
                        request.getValorPago(),
                        request.getDataPagamento(),
                        request.getFormaPagamentoId()
                );
                return ResponseEntity.ok(new ContaPagarDTO(conta));
            } catch (RuntimeException e) {
                // Se não encontrar como conta normal, tentar como conta avulsa
                try {
                    ContaPagarAvulsa contaAvulsa = contaPagarAvulsaService.pagar(
                            id,
                            request.getValorPago(),
                            request.getDataPagamento(),
                            request.getFormaPagamentoId()
                    );
                    // Converter ContaPagarAvulsa para ContaPagarDTO
                    ContaPagarAvulsaDTO contaAvulsaDTO = new ContaPagarAvulsaDTO(contaAvulsa);
                    ContaPagarDTO contaDTO = new ContaPagarDTO();
                    contaDTO.setId(contaAvulsaDTO.getId());
                    contaDTO.setNotaNumero(contaAvulsaDTO.getNumeroNota() != null ? contaAvulsaDTO.getNumeroNota() : "");
                    contaDTO.setNotaModelo(contaAvulsaDTO.getModelo() != null ? contaAvulsaDTO.getModelo() : "");
                    contaDTO.setNotaSerie(contaAvulsaDTO.getSerie() != null ? contaAvulsaDTO.getSerie() : "");
                    contaDTO.setFornecedorId(contaAvulsaDTO.getFornecedorId());
                    contaDTO.setFornecedorNome(contaAvulsaDTO.getFornecedorNome() != null ? contaAvulsaDTO.getFornecedorNome() : "");
                    contaDTO.setNumeroParcela(contaAvulsaDTO.getNumParcela() != null ? contaAvulsaDTO.getNumParcela() : 1);
                    contaDTO.setTotalParcelas(1);
                    contaDTO.setValorOriginal(contaAvulsaDTO.getValorParcela() != null ? contaAvulsaDTO.getValorParcela() : BigDecimal.ZERO);
                    contaDTO.setValorPago(contaAvulsaDTO.getValorPago() != null ? contaAvulsaDTO.getValorPago() : BigDecimal.ZERO);
                    contaDTO.setValorDesconto(contaAvulsaDTO.getDesconto() != null ? contaAvulsaDTO.getDesconto() : BigDecimal.ZERO);
                    contaDTO.setValorJuros(contaAvulsaDTO.getJuros() != null ? contaAvulsaDTO.getJuros() : BigDecimal.ZERO);
                    contaDTO.setValorMulta(contaAvulsaDTO.getMulta() != null ? contaAvulsaDTO.getMulta() : BigDecimal.ZERO);
                    
                    // Calcular valor total
                    BigDecimal valorTotal = contaAvulsaDTO.getValorParcela();
                    if (contaAvulsaDTO.getDataPagamento() != null && 
                        contaAvulsaDTO.getDataVencimento() != null &&
                        contaAvulsaDTO.getDataPagamento().isAfter(contaAvulsaDTO.getDataVencimento())) {
                        valorTotal = valorTotal
                                .add(contaAvulsaDTO.getJuros() != null ? contaAvulsaDTO.getJuros() : BigDecimal.ZERO)
                                .add(contaAvulsaDTO.getMulta() != null ? contaAvulsaDTO.getMulta() : BigDecimal.ZERO);
                    }
                    valorTotal = valorTotal.subtract(contaAvulsaDTO.getDesconto() != null ? contaAvulsaDTO.getDesconto() : BigDecimal.ZERO);
                    contaDTO.setValorTotal(valorTotal);
                    
                    contaDTO.setDataEmissao(contaAvulsaDTO.getDataEmissao());
                    contaDTO.setDataVencimento(contaAvulsaDTO.getDataVencimento());
                    contaDTO.setDataPagamento(contaAvulsaDTO.getDataPagamento());
                    contaDTO.setFormaPagamentoId(contaAvulsaDTO.getFormaPagamentoId());
                    contaDTO.setFormaPagamentoNome(contaAvulsaDTO.getFormaPagamentoNome());
                    contaDTO.setSituacao(contaAvulsaDTO.getStatus());
                    contaDTO.setObservacoes(contaAvulsaDTO.getObservacao());
                    
                    return ResponseEntity.ok(contaDTO);
                } catch (RuntimeException e2) {
                    // Se também não encontrar como conta avulsa, retornar erro
                    throw new RuntimeException("Conta a pagar não encontrada: ID " + id);
                }
            }
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
    
    private static class ValorTotalResponse {
        private BigDecimal valorTotal;
        
        public ValorTotalResponse(BigDecimal valorTotal) {
            this.valorTotal = valorTotal;
        }
        
        public BigDecimal getValorTotal() { return valorTotal; }
        public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
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

