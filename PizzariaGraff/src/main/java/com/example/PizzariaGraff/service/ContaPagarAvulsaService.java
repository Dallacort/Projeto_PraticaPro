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
        
        // Juros e multa só serão somados ao total se a data de pagamento for depois da data de vencimento
        // Os valores informados estão em porcentagem (ex: 0.21 = 0.21% ao mês), precisam ser calculados como juros compostos
        if (dataPagamento.isAfter(conta.getDataVencimento())) {
            long diasAtraso = java.time.temporal.ChronoUnit.DAYS.between(conta.getDataVencimento(), dataPagamento);
            
            // Calcular multa - aplicada apenas uma vez sobre o valor original
            // Multa informada está em porcentagem (ex: 2.00 = 2%)
            if (conta.getMulta() != null && conta.getMulta().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal multaPercentual = conta.getMulta();
                BigDecimal multaDecimal = multaPercentual.divide(new BigDecimal(100), 4, RoundingMode.HALF_UP);
                BigDecimal multaValor = conta.getValorParcela().multiply(multaDecimal);
                conta.setMulta(multaValor);
            } else {
                conta.setMulta(BigDecimal.ZERO);
            }
            
            // Calcular juros compostos
            // Juros informado está em porcentagem mensal (ex: 0.21 = 0.21% ao mês)
            if (conta.getJuros() != null && conta.getJuros().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal jurosMensalPercentual = conta.getJuros();
                // Converter percentual mensal para decimal (0.21% = 0.0021)
                BigDecimal jurosMensalDecimal = jurosMensalPercentual.divide(new BigDecimal(100), 8, RoundingMode.HALF_UP);
                // Converter para taxa diária (dividir por 30 dias)
                BigDecimal taxaDiaria = jurosMensalDecimal.divide(new BigDecimal(30), 8, RoundingMode.HALF_UP);
                
                // Calcular juros compostos: M = C * (1 + i)^n
                BigDecimal umMaisTaxa = BigDecimal.ONE.add(taxaDiaria);
                BigDecimal montante = conta.getValorParcela();
                
                // Calcular (1 + i)^n usando multiplicação iterativa para precisão
                for (long dia = 0; dia < diasAtraso; dia++) {
                    montante = montante.multiply(umMaisTaxa).setScale(4, RoundingMode.HALF_UP);
                }
                
                // Juros = Montante - Capital
                BigDecimal juros = montante.subtract(conta.getValorParcela()).setScale(2, RoundingMode.HALF_UP);
                conta.setJuros(juros);
            } else {
                conta.setJuros(BigDecimal.ZERO);
            }
        } else {
            // Se pagamento for antes ou no vencimento, zerar juros e multa para não serem somados
            conta.setJuros(BigDecimal.ZERO);
            conta.setMulta(BigDecimal.ZERO);
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

