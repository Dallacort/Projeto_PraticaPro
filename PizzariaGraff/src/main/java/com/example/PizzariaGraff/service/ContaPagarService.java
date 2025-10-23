package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.ContaPagar;
import com.example.PizzariaGraff.model.CondicaoPagamento;
import com.example.PizzariaGraff.model.NotaEntrada;
import com.example.PizzariaGraff.repository.ContaPagarRepository;
import com.example.PizzariaGraff.repository.CondicaoPagamentoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ContaPagarService {
    
    private final ContaPagarRepository contaPagarRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;
    
    public ContaPagarService(ContaPagarRepository contaPagarRepository,
                             CondicaoPagamentoRepository condicaoPagamentoRepository) {
        this.contaPagarRepository = contaPagarRepository;
        this.condicaoPagamentoRepository = condicaoPagamentoRepository;
    }
    
    public List<ContaPagar> findAll() {
        return contaPagarRepository.findAll();
    }
    
    public ContaPagar findById(Long id) {
        return contaPagarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta a pagar não encontrada"));
    }
    
    public List<ContaPagar> findByFornecedorId(Long fornecedorId) {
        return contaPagarRepository.findByFornecedorId(fornecedorId);
    }
    
    public List<ContaPagar> findBySituacao(String situacao) {
        return contaPagarRepository.findBySituacao(situacao);
    }
    
    public List<ContaPagar> findByNota(String numero, String modelo, String serie, Long fornecedorId) {
        return contaPagarRepository.findByNota(numero, modelo, serie, fornecedorId);
    }
    
    public List<ContaPagar> findVencidas() {
        return contaPagarRepository.findVencidas();
    }
    
    public ContaPagar save(ContaPagar conta) {
        validarConta(conta);
        return contaPagarRepository.save(conta);
    }
    
    public ContaPagar pagar(Long id, BigDecimal valorPago, LocalDate dataPagamento, Long formaPagamentoId) {
        ContaPagar conta = findById(id);
        
        if (conta.getSituacao().equals("PAGA")) {
            throw new IllegalArgumentException("Esta conta já está paga");
        }
        
        if (conta.getSituacao().equals("CANCELADA")) {
            throw new IllegalArgumentException("Esta conta está cancelada");
        }
        
        conta.setValorPago(valorPago);
        conta.setDataPagamento(dataPagamento);
        conta.setFormaPagamentoId(formaPagamentoId);
        
        // Calcular juros e multa se estiver vencida
        if (dataPagamento.isAfter(conta.getDataVencimento())) {
            long diasAtraso = java.time.temporal.ChronoUnit.DAYS.between(conta.getDataVencimento(), dataPagamento);
            
            // Multa de 2%
            BigDecimal multa = conta.getValorOriginal().multiply(new BigDecimal("0.02"));
            conta.setValorMulta(multa);
            
            // Juros de 0.033% ao dia (1% ao mês)
            BigDecimal juros = conta.getValorOriginal()
                    .multiply(new BigDecimal("0.00033"))
                    .multiply(new BigDecimal(diasAtraso));
            conta.setValorJuros(juros);
        }
        
        // Calcular valor total
        BigDecimal valorTotal = conta.getValorOriginal()
                .add(conta.getValorJuros())
                .add(conta.getValorMulta())
                .subtract(conta.getValorDesconto());
        conta.setValorTotal(valorTotal);
        
        // Atualizar situação
        if (valorPago.compareTo(valorTotal) >= 0) {
            conta.setSituacao("PAGA");
        } else if (valorPago.compareTo(BigDecimal.ZERO) > 0) {
            conta.setSituacao("PARCIALMENTE_PAGA");
        }
        
        return contaPagarRepository.save(conta);
    }
    
    public void cancelar(Long id) {
        ContaPagar conta = findById(id);
        
        if (conta.getSituacao().equals("PAGA")) {
            throw new IllegalArgumentException("Não é possível cancelar uma conta já paga");
        }
        
        conta.setSituacao("CANCELADA");
        contaPagarRepository.save(conta);
    }
    
    public void deleteById(Long id) {
        contaPagarRepository.deleteById(id);
    }
    
    /**
     * Gera contas a pagar automaticamente a partir de uma Nota de Entrada
     */
    public List<ContaPagar> gerarContasDaNota(NotaEntrada nota) {
        List<ContaPagar> contas = new ArrayList<>();
        
        // Se não tiver condição de pagamento, gera uma parcela única
        if (nota.getCondicaoPagamentoId() == null) {
            ContaPagar conta = new ContaPagar(
                    nota.getNumero(),
                    nota.getModelo(),
                    nota.getSerie(),
                    nota.getFornecedorId(),
                    1,
                    1,
                    nota.getValorTotal(),
                    nota.getDataEmissao(),
                    nota.getDataEmissao()
            );
            contas.add(contaPagarRepository.save(conta));
            return contas;
        }
        
        // Buscar condição de pagamento
        CondicaoPagamento condicao = condicaoPagamentoRepository.findById(nota.getCondicaoPagamentoId())
                .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada"));
        
        // Obter parcelas da condição de pagamento
        List<com.example.PizzariaGraff.model.ParcelaCondicaoPagamento> parcelas = condicao.getParcelasCondicaoPagamento();
        
        if (parcelas == null || parcelas.isEmpty()) {
            // Se não tiver parcelas definidas, gera uma parcela única
            ContaPagar conta = new ContaPagar(
                    nota.getNumero(),
                    nota.getModelo(),
                    nota.getSerie(),
                    nota.getFornecedorId(),
                    1,
                    1,
                    nota.getValorTotal(),
                    nota.getDataEmissao(),
                    nota.getDataEmissao()
            );
            contas.add(contaPagarRepository.save(conta));
            return contas;
        }
        
        // Calcular valor de cada parcela
        BigDecimal valorTotal = nota.getValorTotal();
        int totalParcelas = parcelas.size();
        BigDecimal valorParcela = valorTotal.divide(new BigDecimal(totalParcelas), 2, RoundingMode.HALF_UP);
        BigDecimal somaParcelasGeradas = BigDecimal.ZERO;
        
        // Gerar uma conta para cada parcela
        for (int i = 0; i < parcelas.size(); i++) {
            com.example.PizzariaGraff.model.ParcelaCondicaoPagamento parcela = parcelas.get(i);
            
            // Para a última parcela, ajustar o valor para evitar erro de arredondamento
            BigDecimal valorDessaParcela = valorParcela;
            if (i == parcelas.size() - 1) {
                valorDessaParcela = valorTotal.subtract(somaParcelasGeradas);
            }
            
            // Calcular data de vencimento
            LocalDate dataVencimento = nota.getDataEmissao().plusDays(parcela.getDias());
            
            ContaPagar conta = new ContaPagar(
                    nota.getNumero(),
                    nota.getModelo(),
                    nota.getSerie(),
                    nota.getFornecedorId(),
                    i + 1,
                    totalParcelas,
                    valorDessaParcela,
                    nota.getDataEmissao(),
                    dataVencimento
            );
            
            // Definir forma de pagamento da parcela
            if (parcela.getFormaPagamento() != null && parcela.getFormaPagamento().getId() != null) {
                conta.setFormaPagamentoId(parcela.getFormaPagamento().getId());
            }
            
            contas.add(contaPagarRepository.save(conta));
            somaParcelasGeradas = somaParcelasGeradas.add(valorDessaParcela);
        }
        
        return contas;
    }
    
    /**
     * Deleta todas as contas de uma nota
     */
    public void deletarContasDaNota(String numero, String modelo, String serie, Long fornecedorId) {
        contaPagarRepository.deleteByNota(numero, modelo, serie, fornecedorId);
    }
    
    /**
     * Cancela todas as contas de uma nota
     */
    public void cancelarContasDaNota(String numero, String modelo, String serie, Long fornecedorId) {
        List<ContaPagar> contas = findByNota(numero, modelo, serie, fornecedorId);
        
        for (ContaPagar conta : contas) {
            if (!conta.getSituacao().equals("PAGA")) {
                conta.setSituacao("CANCELADA");
                contaPagarRepository.save(conta);
            }
        }
    }
    
    private void validarConta(ContaPagar conta) {
        if (conta.getNotaNumero() == null || conta.getNotaNumero().trim().isEmpty()) {
            throw new IllegalArgumentException("Número da nota é obrigatório");
        }
        
        if (conta.getFornecedorId() == null) {
            throw new IllegalArgumentException("Fornecedor é obrigatório");
        }
        
        if (conta.getValorOriginal() == null || conta.getValorOriginal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor original deve ser maior que zero");
        }
        
        if (conta.getDataEmissao() == null) {
            throw new IllegalArgumentException("Data de emissão é obrigatória");
        }
        
        if (conta.getDataVencimento() == null) {
            throw new IllegalArgumentException("Data de vencimento é obrigatória");
        }
    }
}

