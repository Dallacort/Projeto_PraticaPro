package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.ContaPagarAvulsa;
import com.example.PizzariaGraff.repository.ContaPagarAvulsaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ContaPagarAvulsaService {
    
    private final ContaPagarAvulsaRepository contaPagarAvulsaRepository;
    
    public ContaPagarAvulsaService(ContaPagarAvulsaRepository contaPagarAvulsaRepository) {
        this.contaPagarAvulsaRepository = contaPagarAvulsaRepository;
    }
    
    public List<ContaPagarAvulsa> findAll() {
        return contaPagarAvulsaRepository.findAll();
    }
    
    public ContaPagarAvulsa findById(Long id) {
        return contaPagarAvulsaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta a pagar avulsa não encontrada"));
    }
    
    public List<ContaPagarAvulsa> findByFornecedorId(Long fornecedorId) {
        return contaPagarAvulsaRepository.findByFornecedorId(fornecedorId);
    }
    
    public List<ContaPagarAvulsa> findByStatus(String status) {
        return contaPagarAvulsaRepository.findByStatus(status);
    }
    
    public List<ContaPagarAvulsa> findVencidas() {
        return contaPagarAvulsaRepository.findVencidas();
    }
    
    public ContaPagarAvulsa save(ContaPagarAvulsa conta) {
        validarConta(conta);
        
        // Verificar se já existe uma conta avulsa com os mesmos dados da nota (para evitar duplicação)
        if (conta.getId() == null && conta.getNumeroNota() != null && !conta.getNumeroNota().trim().isEmpty() &&
            conta.getModelo() != null && !conta.getModelo().trim().isEmpty() &&
            conta.getSerie() != null && !conta.getSerie().trim().isEmpty()) {
            
            Optional<ContaPagarAvulsa> contaExistente = contaPagarAvulsaRepository.findByNota(
                conta.getNumeroNota(), 
                conta.getModelo(), 
                conta.getSerie(), 
                conta.getFornecedorId()
            );
            
            if (contaExistente.isPresent()) {
                throw new IllegalArgumentException("Já existe uma conta avulsa cadastrada para esta nota: " + 
                    conta.getNumeroNota() + "/" + conta.getModelo() + "/" + conta.getSerie());
            }
        }
        
        return contaPagarAvulsaRepository.save(conta);
    }
    
    /**
     * Calcula o valor total que deve ser pago (incluindo desconto, multa e juros se aplicável)
     * sem salvar a conta
     */
    public BigDecimal calcularValorTotalParaPagamento(Long id, LocalDate dataPagamento) {
        ContaPagarAvulsa conta = findById(id);
        
        if (conta.getStatus().equals("PAGA")) {
            throw new IllegalArgumentException("Esta conta já está paga");
        }
        
        if (conta.getStatus().equals("CANCELADA")) {
            throw new IllegalArgumentException("Esta conta está cancelada");
        }
        
        BigDecimal valorJuros = BigDecimal.ZERO;
        BigDecimal valorMulta = BigDecimal.ZERO;
        BigDecimal valorDesconto = BigDecimal.ZERO;
        
        // Comparar datas (sem hora)
        boolean pagamentoAntesVencimento = dataPagamento.isBefore(conta.getDataVencimento());
        boolean pagamentoNoDiaVencimento = dataPagamento.isEqual(conta.getDataVencimento());
        boolean pagamentoDepoisVencimento = dataPagamento.isAfter(conta.getDataVencimento());
        
        // Se pagamento ANTES ou NO DIA do vencimento: aplicar DESCONTO
        if (pagamentoAntesVencimento || pagamentoNoDiaVencimento) {
            // Desconto informado já está no formato correto (ex: 0.20 = 20%), usar diretamente
            if (conta.getDesconto() != null && conta.getDesconto().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal descontoPercentual = conta.getDesconto();
                valorDesconto = conta.getValorParcela().multiply(descontoPercentual).setScale(2, RoundingMode.HALF_UP);
            }
            if (pagamentoAntesVencimento) {
                System.out.println("Conta Avulsa - Pagamento ANTES do vencimento - Aplicando desconto: " + valorDesconto);
            } else {
                System.out.println("Conta Avulsa - Pagamento NO DIA do vencimento - Aplicando desconto: " + valorDesconto);
            }
        }
        // Se pagamento DEPOIS do vencimento: aplicar MULTA e JUROS
        else if (pagamentoDepoisVencimento) {
            long diasAtraso = java.time.temporal.ChronoUnit.DAYS.between(conta.getDataVencimento(), dataPagamento);
            
            // Calcular multa - aplicada apenas uma vez sobre o valor original
            // Multa informada já está no formato correto (ex: 0.20 = 20%), usar diretamente
            if (conta.getMulta() != null && conta.getMulta().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal multaPercentual = conta.getMulta();
                valorMulta = conta.getValorParcela().multiply(multaPercentual).setScale(2, RoundingMode.HALF_UP);
            }
            
            // Calcular juros
            // Juros aplicado como porcentagem fixa sobre o valor original (igual à multa)
            if (conta.getJuros() != null && conta.getJuros().compareTo(BigDecimal.ZERO) > 0 && diasAtraso > 0) {
                BigDecimal jurosPercentual = conta.getJuros();
                // Percentual já está no formato correto (0.20 = 20%), aplicar diretamente sobre o valor
                valorJuros = conta.getValorParcela()
                    .multiply(jurosPercentual)
                    .setScale(2, RoundingMode.HALF_UP);
            }
            
            System.out.println("Conta Avulsa - Pagamento DEPOIS do vencimento - Aplicando multa: " + valorMulta + 
                             ", Juros: " + valorJuros + " (dias atraso: " + diasAtraso + ")");
        }
        
        // Calcular valor total: Original + Juros + Multa - Desconto
        BigDecimal valorTotal = conta.getValorParcela()
                .add(valorJuros)
                .add(valorMulta)
                .subtract(valorDesconto);
        
        System.out.println("Conta Avulsa - Valor Original: " + conta.getValorParcela() + 
                         ", Juros: " + valorJuros + 
                         ", Multa: " + valorMulta + 
                         ", Desconto: " + valorDesconto + 
                         ", Total: " + valorTotal);
        
        return valorTotal.setScale(2, RoundingMode.HALF_UP);
    }
    
    public ContaPagarAvulsa pagar(Long id, BigDecimal valorPago, LocalDate dataPagamento, Long formaPagamentoId) {
        ContaPagarAvulsa conta = findById(id);
        
        if (conta.getStatus().equals("PAGA")) {
            throw new IllegalArgumentException("Esta conta já está paga");
        }
        
        if (conta.getStatus().equals("CANCELADA")) {
            throw new IllegalArgumentException("Esta conta está cancelada");
        }
        
        conta.setValorPago(valorPago);
        conta.setDataPagamento(dataPagamento);
        conta.setFormaPagamentoId(formaPagamentoId);
        
        // Comparar datas (sem hora)
        boolean pagamentoAntesVencimento = dataPagamento.isBefore(conta.getDataVencimento());
        boolean pagamentoNoDiaVencimento = dataPagamento.isEqual(conta.getDataVencimento());
        boolean pagamentoDepoisVencimento = dataPagamento.isAfter(conta.getDataVencimento());
        
        // Se pagamento ANTES ou NO DIA do vencimento: aplicar DESCONTO
        if (pagamentoAntesVencimento || pagamentoNoDiaVencimento) {
            // Desconto informado já está no formato correto (ex: 0.20 = 20%), usar diretamente
            BigDecimal descontoCalculado = BigDecimal.ZERO;
            if (conta.getDesconto() != null && conta.getDesconto().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal descontoPercentual = conta.getDesconto();
                descontoCalculado = conta.getValorParcela().multiply(descontoPercentual).setScale(2, RoundingMode.HALF_UP);
            }
            conta.setDesconto(descontoCalculado);
            conta.setJuros(BigDecimal.ZERO);
            conta.setMulta(BigDecimal.ZERO);
            
            if (pagamentoAntesVencimento) {
                System.out.println("Conta Avulsa - Pagamento ANTES do vencimento - Aplicando desconto: " + descontoCalculado);
            } else {
                System.out.println("Conta Avulsa - Pagamento NO DIA do vencimento - Aplicando desconto: " + descontoCalculado);
            }
        }
        // Se pagamento DEPOIS do vencimento: aplicar MULTA e JUROS
        else if (pagamentoDepoisVencimento) {
            long diasAtraso = java.time.temporal.ChronoUnit.DAYS.between(conta.getDataVencimento(), dataPagamento);
            
            // Calcular multa - aplicada apenas uma vez sobre o valor original
            // Multa informada já está no formato correto (ex: 0.20 = 20%), usar diretamente
            BigDecimal multaCalculada = BigDecimal.ZERO;
            if (conta.getMulta() != null && conta.getMulta().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal multaPercentual = conta.getMulta();
                multaCalculada = conta.getValorParcela().multiply(multaPercentual).setScale(2, RoundingMode.HALF_UP);
            }
            conta.setMulta(multaCalculada);
            
            // Calcular juros
            // Juros aplicado como porcentagem fixa sobre o valor original (igual à multa)
            BigDecimal jurosCalculado = BigDecimal.ZERO;
            if (conta.getJuros() != null && conta.getJuros().compareTo(BigDecimal.ZERO) > 0 && diasAtraso > 0) {
                BigDecimal jurosPercentual = conta.getJuros();
                // Percentual já está no formato correto (0.20 = 20%), aplicar diretamente sobre o valor
                jurosCalculado = conta.getValorParcela()
                    .multiply(jurosPercentual)
                    .setScale(2, RoundingMode.HALF_UP);
            }
            conta.setJuros(jurosCalculado);
            conta.setDesconto(BigDecimal.ZERO);
            
            System.out.println("Conta Avulsa - Pagamento DEPOIS do vencimento - Aplicando multa: " + multaCalculada + 
                             ", Juros: " + jurosCalculado + " (dias atraso: " + diasAtraso + ")");
        }
        
        // Atualizar situação
        BigDecimal valorTotal = conta.calcularValorTotal();
        if (valorPago.compareTo(valorTotal) >= 0) {
            conta.setStatus("PAGA");
        } else if (valorPago.compareTo(BigDecimal.ZERO) > 0) {
            conta.setStatus("PARCIALMENTE_PAGA");
        }
        
        return contaPagarAvulsaRepository.save(conta);
    }
    
    public ContaPagarAvulsa cancelar(Long id) {
        ContaPagarAvulsa conta = findById(id);
        
        if (conta.getStatus().equals("PAGA")) {
            throw new IllegalArgumentException("Não é possível cancelar uma conta já paga");
        }
        
        conta.setStatus("CANCELADA");
        return contaPagarAvulsaRepository.save(conta);
    }
    
    public void deleteById(Long id) {
        ContaPagarAvulsa conta = findById(id);
        
        if (conta.getStatus().equals("PAGA")) {
            throw new IllegalArgumentException("Não é possível deletar uma conta já paga");
        }
        
        contaPagarAvulsaRepository.deleteById(id);
    }
    
    private void validarConta(ContaPagarAvulsa conta) {
        if (conta.getFornecedorId() == null) {
            throw new IllegalArgumentException("Fornecedor é obrigatório");
        }
        
        if (conta.getValorParcela() == null || conta.getValorParcela().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor da parcela deve ser maior que zero");
        }
        
        if (conta.getDataEmissao() == null) {
            throw new IllegalArgumentException("Data de emissão é obrigatória");
        }
        
        if (conta.getDataVencimento() == null) {
            throw new IllegalArgumentException("Data de vencimento é obrigatória");
        }
        
        if (conta.getDataVencimento().isBefore(conta.getDataEmissao())) {
            throw new IllegalArgumentException("Data de vencimento não pode ser anterior à data de emissão");
        }
        
        if (conta.getNumParcela() == null || conta.getNumParcela() <= 0) {
            throw new IllegalArgumentException("Número da parcela deve ser maior que zero");
        }
    }
}

