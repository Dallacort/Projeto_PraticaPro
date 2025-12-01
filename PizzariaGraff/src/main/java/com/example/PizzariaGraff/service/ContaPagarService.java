package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.ContaPagar;
import com.example.PizzariaGraff.model.CondicaoPagamento;
import com.example.PizzariaGraff.model.NotaEntrada;
import com.example.PizzariaGraff.repository.ContaPagarRepository;
import com.example.PizzariaGraff.repository.CondicaoPagamentoRepository;
import com.example.PizzariaGraff.repository.NotaEntradaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ContaPagarService {
    
    private final ContaPagarRepository contaPagarRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;
    private final NotaEntradaRepository notaEntradaRepository;
    
    public ContaPagarService(ContaPagarRepository contaPagarRepository,
                             CondicaoPagamentoRepository condicaoPagamentoRepository,
                             NotaEntradaRepository notaEntradaRepository) {
        this.contaPagarRepository = contaPagarRepository;
        this.condicaoPagamentoRepository = condicaoPagamentoRepository;
        this.notaEntradaRepository = notaEntradaRepository;
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
        
        // Calcular juros e multa apenas se o pagamento for depois do vencimento
        if (dataPagamento.isAfter(conta.getDataVencimento())) {
            // Buscar a condição de pagamento da nota para obter os percentuais
            CondicaoPagamento condicao = null;
            try {
                // Buscar nota de entrada para obter a condição de pagamento
                Optional<NotaEntrada> notaOpt = notaEntradaRepository.findByChave(
                    conta.getNotaNumero(),
                    conta.getNotaModelo(),
                    conta.getNotaSerie(),
                    conta.getFornecedorId()
                );
                
                if (notaOpt.isPresent() && notaOpt.get().getCondicaoPagamentoId() != null) {
                    condicao = condicaoPagamentoRepository.findById(notaOpt.get().getCondicaoPagamentoId())
                        .orElse(null);
                }
            } catch (Exception e) {
                // Se não conseguir buscar a condição, usar valores padrão
                System.err.println("Erro ao buscar condição de pagamento: " + e.getMessage());
            }
            
            // Calcular multa usando percentual da condição de pagamento (ou padrão 2%)
            // Multa é aplicada apenas uma vez sobre o valor original
            Double percentualMulta = (condicao != null && condicao.getPercentualMulta() != null) 
                ? condicao.getPercentualMulta() 
                : 2.0;
            // Converter percentual para decimal (2% = 0.02, 21% = 0.21)
            BigDecimal multaDecimal = new BigDecimal(percentualMulta).divide(new BigDecimal(100), 4, RoundingMode.HALF_UP);
            BigDecimal multa = conta.getValorOriginal().multiply(multaDecimal);
            conta.setValorMulta(multa);
            
            // Calcular juros compostos usando percentual da condição de pagamento
            // Juros compostos: M = C * (1 + i)^n, onde J = M - C
            Double percentualJuros = (condicao != null && condicao.getPercentualJuros() != null) 
                ? condicao.getPercentualJuros() 
                : 1.0; // 1% ao mês
            long diasAtraso = java.time.temporal.ChronoUnit.DAYS.between(conta.getDataVencimento(), dataPagamento);
            
            // Converter percentual mensal para diário (1% ao mês = 0.033% ao dia)
            BigDecimal jurosMensalDecimal = new BigDecimal(percentualJuros).divide(new BigDecimal(100), 8, RoundingMode.HALF_UP);
            BigDecimal taxaDiaria = jurosMensalDecimal.divide(new BigDecimal(30), 8, RoundingMode.HALF_UP);
            
            // Calcular juros compostos: M = C * (1 + i)^n
            // Usando BigDecimal para precisão
            BigDecimal umMaisTaxa = BigDecimal.ONE.add(taxaDiaria);
            BigDecimal montante = conta.getValorOriginal();
            
            // Calcular (1 + i)^n usando multiplicação iterativa para precisão
            for (long dia = 0; dia < diasAtraso; dia++) {
                montante = montante.multiply(umMaisTaxa).setScale(4, RoundingMode.HALF_UP);
            }
            
            // Juros = Montante - Capital
            BigDecimal juros = montante.subtract(conta.getValorOriginal()).setScale(2, RoundingMode.HALF_UP);
            conta.setValorJuros(juros);
        } else {
            // Se pagamento for antes ou no vencimento, zerar juros e multa
            conta.setValorJuros(BigDecimal.ZERO);
            conta.setValorMulta(BigDecimal.ZERO);
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
        
        // Calcular valor de cada parcela usando o percentual definido na condição de pagamento
        BigDecimal valorTotal = nota.getValorTotal();
        int totalParcelas = parcelas.size();
        BigDecimal somaParcelasGeradas = BigDecimal.ZERO;
        
        System.out.println("Gerando contas para nota " + nota.getNumero() + " com valor total: " + valorTotal);
        System.out.println("Total de parcelas: " + totalParcelas);
        
        // Gerar uma conta para cada parcela
        for (int i = 0; i < parcelas.size(); i++) {
            com.example.PizzariaGraff.model.ParcelaCondicaoPagamento parcela = parcelas.get(i);
            
            // Verificar se a parcela tem percentual definido
            Double percentualDouble = parcela.getPercentual();
            System.out.println("Parcela " + (i + 1) + " - Percentual lido: " + percentualDouble);
            
            // Calcular valor da parcela usando o percentual
            BigDecimal percentual;
            if (percentualDouble != null && percentualDouble > 0 && percentualDouble <= 100) {
                percentual = new BigDecimal(percentualDouble);
                System.out.println("✓ Usando percentual da parcela: " + percentual + "%");
            } else {
                // Se não tiver percentual válido, dividir igualmente (fallback)
                percentual = new BigDecimal(100).divide(new BigDecimal(totalParcelas), 2, RoundingMode.HALF_UP);
                System.out.println("⚠ Percentual inválido ou não encontrado (valor: " + percentualDouble + "), dividindo igualmente: " + percentual + "%");
            }
            
            // Converter percentual para decimal (20% = 0.20)
            BigDecimal percentualDecimal = percentual.divide(new BigDecimal(100), 4, RoundingMode.HALF_UP);
            
            // Calcular valor da parcela
            BigDecimal valorDessaParcela = valorTotal.multiply(percentualDecimal).setScale(2, RoundingMode.HALF_UP);
            
            System.out.println("Valor calculado da parcela " + (i + 1) + ": " + valorDessaParcela);
            
            // Para a última parcela, ajustar o valor para evitar erro de arredondamento
            if (i == parcelas.size() - 1) {
                BigDecimal valorAjustado = valorTotal.subtract(somaParcelasGeradas);
                System.out.println("Ajustando última parcela de " + valorDessaParcela + " para " + valorAjustado);
                valorDessaParcela = valorAjustado;
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
        
        System.out.println("Total de parcelas geradas: " + contas.size() + ", Soma: " + somaParcelasGeradas);
        
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

