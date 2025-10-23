package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.ContaReceber;
import com.example.PizzariaGraff.model.CondicaoPagamento;
import com.example.PizzariaGraff.model.NotaSaida;
import com.example.PizzariaGraff.repository.ContaReceberRepository;
import com.example.PizzariaGraff.repository.CondicaoPagamentoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ContaReceberService {
    
    private final ContaReceberRepository contaReceberRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;
    
    public ContaReceberService(ContaReceberRepository contaReceberRepository,
                               CondicaoPagamentoRepository condicaoPagamentoRepository) {
        this.contaReceberRepository = contaReceberRepository;
        this.condicaoPagamentoRepository = condicaoPagamentoRepository;
    }
    
    public List<ContaReceber> findAll() {
        return contaReceberRepository.findAll();
    }
    
    public ContaReceber findById(Long id) {
        return contaReceberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta a receber não encontrada"));
    }
    
    public List<ContaReceber> findByClienteId(Long clienteId) {
        return contaReceberRepository.findByClienteId(clienteId);
    }
    
    public List<ContaReceber> findBySituacao(String situacao) {
        return contaReceberRepository.findBySituacao(situacao);
    }
    
    public List<ContaReceber> findByNota(String numero, String modelo, String serie, Long clienteId) {
        return contaReceberRepository.findByNota(numero, modelo, serie, clienteId);
    }
    
    public List<ContaReceber> findVencidas() {
        return contaReceberRepository.findVencidas();
    }
    
    public ContaReceber save(ContaReceber conta) {
        validarConta(conta);
        return contaReceberRepository.save(conta);
    }
    
    public ContaReceber receber(Long id, BigDecimal valorRecebido, LocalDate dataRecebimento, Long formaPagamentoId) {
        ContaReceber conta = findById(id);
        
        if (conta.getSituacao().equals("RECEBIDA")) {
            throw new IllegalArgumentException("Esta conta já está recebida");
        }
        
        if (conta.getSituacao().equals("CANCELADA")) {
            throw new IllegalArgumentException("Esta conta está cancelada");
        }
        
        conta.setValorRecebido(valorRecebido);
        conta.setDataRecebimento(dataRecebimento);
        conta.setFormaPagamentoId(formaPagamentoId);
        
        // Calcular juros e multa se estiver vencida
        if (dataRecebimento.isAfter(conta.getDataVencimento())) {
            long diasAtraso = java.time.temporal.ChronoUnit.DAYS.between(conta.getDataVencimento(), dataRecebimento);
            
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
        if (valorRecebido.compareTo(valorTotal) >= 0) {
            conta.setSituacao("RECEBIDA");
        } else if (valorRecebido.compareTo(BigDecimal.ZERO) > 0) {
            conta.setSituacao("PARCIALMENTE_RECEBIDA");
        }
        
        return contaReceberRepository.save(conta);
    }
    
    public void cancelar(Long id) {
        ContaReceber conta = findById(id);
        
        if (conta.getSituacao().equals("RECEBIDA")) {
            throw new IllegalArgumentException("Não é possível cancelar uma conta já recebida");
        }
        
        conta.setSituacao("CANCELADA");
        contaReceberRepository.save(conta);
    }
    
    public void deleteById(Long id) {
        contaReceberRepository.deleteById(id);
    }
    
    /**
     * Gera contas a receber automaticamente a partir de uma Nota de Saída
     */
    public List<ContaReceber> gerarContasDaNota(NotaSaida nota) {
        List<ContaReceber> contas = new ArrayList<>();
        
        // Se não tiver condição de pagamento, gera uma parcela única
        if (nota.getCondicaoPagamentoId() == null) {
            ContaReceber conta = new ContaReceber(
                    nota.getNumero(),
                    nota.getModelo(),
                    nota.getSerie(),
                    nota.getClienteId(),
                    1,
                    1,
                    nota.getValorTotal(),
                    nota.getDataEmissao(),
                    nota.getDataEmissao()
            );
            contas.add(contaReceberRepository.save(conta));
            return contas;
        }
        
        // Buscar condição de pagamento
        CondicaoPagamento condicao = condicaoPagamentoRepository.findById(nota.getCondicaoPagamentoId())
                .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada"));
        
        // Obter parcelas da condição de pagamento
        List<com.example.PizzariaGraff.model.ParcelaCondicaoPagamento> parcelas = condicao.getParcelasCondicaoPagamento();
        
        if (parcelas == null || parcelas.isEmpty()) {
            // Se não tiver parcelas definidas, gera uma parcela única
            ContaReceber conta = new ContaReceber(
                    nota.getNumero(),
                    nota.getModelo(),
                    nota.getSerie(),
                    nota.getClienteId(),
                    1,
                    1,
                    nota.getValorTotal(),
                    nota.getDataEmissao(),
                    nota.getDataEmissao()
            );
            contas.add(contaReceberRepository.save(conta));
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
            
            ContaReceber conta = new ContaReceber(
                    nota.getNumero(),
                    nota.getModelo(),
                    nota.getSerie(),
                    nota.getClienteId(),
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
            
            contas.add(contaReceberRepository.save(conta));
            somaParcelasGeradas = somaParcelasGeradas.add(valorDessaParcela);
        }
        
        return contas;
    }
    
    /**
     * Deleta todas as contas de uma nota
     */
    public void deletarContasDaNota(String numero, String modelo, String serie, Long clienteId) {
        contaReceberRepository.deleteByNota(numero, modelo, serie, clienteId);
    }
    
    /**
     * Cancela todas as contas de uma nota
     */
    public void cancelarContasDaNota(String numero, String modelo, String serie, Long clienteId) {
        List<ContaReceber> contas = findByNota(numero, modelo, serie, clienteId);
        
        for (ContaReceber conta : contas) {
            if (!conta.getSituacao().equals("RECEBIDA")) {
                conta.setSituacao("CANCELADA");
                contaReceberRepository.save(conta);
            }
        }
    }
    
    private void validarConta(ContaReceber conta) {
        if (conta.getNotaNumero() == null || conta.getNotaNumero().trim().isEmpty()) {
            throw new IllegalArgumentException("Número da nota é obrigatório");
        }
        
        if (conta.getClienteId() == null) {
            throw new IllegalArgumentException("Cliente é obrigatório");
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

