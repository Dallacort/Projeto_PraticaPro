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
    
    /**
     * Calcula o valor total que deve ser pago (incluindo desconto, multa e juros se aplicável)
     * sem salvar a conta
     */
    public BigDecimal calcularValorTotalParaPagamento(Long id, LocalDate dataPagamento) {
        ContaPagar conta = findById(id);
        
        if (conta.getSituacao().equals("PAGA")) {
            throw new IllegalArgumentException("Esta conta já está paga");
        }
        
        if (conta.getSituacao().equals("CANCELADA")) {
            throw new IllegalArgumentException("Esta conta está cancelada");
        }
        
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
        
        BigDecimal valorJuros = BigDecimal.ZERO;
        BigDecimal valorMulta = BigDecimal.ZERO;
        BigDecimal valorDesconto = BigDecimal.ZERO;
        
        // Comparar datas (sem hora)
        boolean pagamentoAntesVencimento = dataPagamento.isBefore(conta.getDataVencimento());
        boolean pagamentoDepoisVencimento = dataPagamento.isAfter(conta.getDataVencimento());
        
        // Se pagamento ANTES do vencimento: aplicar DESCONTO
        if (pagamentoAntesVencimento) {
            Double percentualDesconto = (condicao != null && condicao.getPercentualDesconto() != null) 
                ? condicao.getPercentualDesconto() 
                : 0.0;
            
            // Percentual já está no formato correto (0.20 = 20%), usar diretamente
            BigDecimal descontoDecimal = new BigDecimal(percentualDesconto);
            valorDesconto = conta.getValorOriginal().multiply(descontoDecimal).setScale(2, RoundingMode.HALF_UP);
            
            System.out.println("Pagamento ANTES do vencimento - Aplicando desconto: " + percentualDesconto + " (20% se for 0.20) = " + valorDesconto);
        }
        // Se pagamento DEPOIS do vencimento: aplicar MULTA e JUROS
        else if (pagamentoDepoisVencimento) {
            // Calcular multa usando percentual da condição de pagamento
            // Multa é aplicada apenas uma vez sobre o valor original
            Double percentualMulta = (condicao != null && condicao.getPercentualMulta() != null) 
                ? condicao.getPercentualMulta() 
                : 0.0;
            
            // Percentual já está no formato correto (0.20 = 20%), usar diretamente
            BigDecimal multaDecimal = new BigDecimal(percentualMulta);
            valorMulta = conta.getValorOriginal().multiply(multaDecimal).setScale(2, RoundingMode.HALF_UP);
            
            // Calcular juros usando percentual da condição de pagamento
            // Juros aplicado como porcentagem fixa sobre o valor original (igual à multa)
            Double percentualJuros = (condicao != null && condicao.getPercentualJuros() != null) 
                ? condicao.getPercentualJuros() 
                : 0.0;
            
            long diasAtraso = java.time.temporal.ChronoUnit.DAYS.between(conta.getDataVencimento(), dataPagamento);
            
            if (diasAtraso > 0 && percentualJuros > 0) {
                // Percentual já está no formato correto (0.20 = 20%), aplicar diretamente sobre o valor
                BigDecimal jurosDecimal = new BigDecimal(percentualJuros);
                valorJuros = conta.getValorOriginal()
                    .multiply(jurosDecimal)
                    .setScale(2, RoundingMode.HALF_UP);
            }
            
            System.out.println("Pagamento DEPOIS do vencimento - Aplicando multa: " + percentualMulta + " (20% se for 0.20) = " + valorMulta + 
                             ", Juros: " + percentualJuros + " (20% ao mês se for 0.20) = " + valorJuros + " (dias atraso: " + diasAtraso + ")");
        }
        // Se pagamento NO DIA do vencimento: sem desconto, multa ou juros
        else {
            System.out.println("Pagamento NO DIA do vencimento - Sem desconto, multa ou juros");
        }
        
        // Calcular valor total: Original + Juros + Multa - Desconto
        BigDecimal valorTotal = conta.getValorOriginal()
                .add(valorJuros)
                .add(valorMulta)
                .subtract(valorDesconto);
        
        System.out.println("Valor Original: " + conta.getValorOriginal() + 
                         ", Juros: " + valorJuros + 
                         ", Multa: " + valorMulta + 
                         ", Desconto: " + valorDesconto + 
                         ", Total: " + valorTotal);
        
        return valorTotal.setScale(2, RoundingMode.HALF_UP);
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
        
        // Comparar datas (sem hora)
        boolean pagamentoAntesVencimento = dataPagamento.isBefore(conta.getDataVencimento());
        boolean pagamentoDepoisVencimento = dataPagamento.isAfter(conta.getDataVencimento());
        
        // Se pagamento ANTES do vencimento: aplicar DESCONTO
        if (pagamentoAntesVencimento) {
            Double percentualDesconto = (condicao != null && condicao.getPercentualDesconto() != null) 
                ? condicao.getPercentualDesconto() 
                : 0.0;
            
            // Percentual já está no formato correto (0.20 = 20%), usar diretamente
            BigDecimal descontoDecimal = new BigDecimal(percentualDesconto);
            BigDecimal desconto = conta.getValorOriginal().multiply(descontoDecimal).setScale(2, RoundingMode.HALF_UP);
            conta.setValorDesconto(desconto);
            conta.setValorJuros(BigDecimal.ZERO);
            conta.setValorMulta(BigDecimal.ZERO);
            
            System.out.println("Pagamento ANTES do vencimento - Aplicando desconto: " + percentualDesconto + " (20% se for 0.20) = " + desconto);
        }
        // Se pagamento DEPOIS do vencimento: aplicar MULTA e JUROS
        else if (pagamentoDepoisVencimento) {
            // Calcular multa usando percentual da condição de pagamento
            // Multa é aplicada apenas uma vez sobre o valor original
            Double percentualMulta = (condicao != null && condicao.getPercentualMulta() != null) 
                ? condicao.getPercentualMulta() 
                : 0.0;
            
            // Percentual já está no formato correto (0.20 = 20%), usar diretamente
            BigDecimal multaDecimal = new BigDecimal(percentualMulta);
            BigDecimal multa = conta.getValorOriginal().multiply(multaDecimal).setScale(2, RoundingMode.HALF_UP);
            conta.setValorMulta(multa);
            
            // Calcular juros usando percentual da condição de pagamento
            // Juros aplicado como porcentagem fixa sobre o valor original (igual à multa)
            Double percentualJuros = (condicao != null && condicao.getPercentualJuros() != null) 
                ? condicao.getPercentualJuros() 
                : 0.0;
            
            long diasAtraso = java.time.temporal.ChronoUnit.DAYS.between(conta.getDataVencimento(), dataPagamento);
            
            BigDecimal juros = BigDecimal.ZERO;
            if (diasAtraso > 0 && percentualJuros > 0) {
                // Percentual já está no formato correto (0.20 = 20%), aplicar diretamente sobre o valor
                BigDecimal jurosDecimal = new BigDecimal(percentualJuros);
                juros = conta.getValorOriginal()
                    .multiply(jurosDecimal)
                    .setScale(2, RoundingMode.HALF_UP);
            }
            conta.setValorJuros(juros);
            conta.setValorDesconto(BigDecimal.ZERO);
            
            System.out.println("Pagamento DEPOIS do vencimento - Aplicando multa: " + percentualMulta + " (20% se for 0.20) = " + multa + 
                             ", Juros: " + percentualJuros + " (20% ao mês se for 0.20) = " + juros + " (dias atraso: " + diasAtraso + ")");
        }
        // Se pagamento NO DIA do vencimento: sem desconto, multa ou juros
        else {
            conta.setValorJuros(BigDecimal.ZERO);
            conta.setValorMulta(BigDecimal.ZERO);
            conta.setValorDesconto(BigDecimal.ZERO);
            System.out.println("Pagamento NO DIA do vencimento - Sem desconto, multa ou juros");
        }
        
        // Calcular valor total: Original + Juros + Multa - Desconto
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

