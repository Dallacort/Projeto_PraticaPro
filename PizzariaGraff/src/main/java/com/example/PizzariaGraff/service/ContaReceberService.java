package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.ContaReceber;
import com.example.PizzariaGraff.model.CondicaoPagamento;
import com.example.PizzariaGraff.model.NotaSaida;
import com.example.PizzariaGraff.repository.ContaReceberRepository;
import com.example.PizzariaGraff.repository.CondicaoPagamentoRepository;
import com.example.PizzariaGraff.repository.NotaSaidaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ContaReceberService {
    
    private final ContaReceberRepository contaReceberRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;
    private final NotaSaidaRepository notaSaidaRepository;
    
    public ContaReceberService(ContaReceberRepository contaReceberRepository,
                               CondicaoPagamentoRepository condicaoPagamentoRepository,
                               NotaSaidaRepository notaSaidaRepository) {
        this.contaReceberRepository = contaReceberRepository;
        this.condicaoPagamentoRepository = condicaoPagamentoRepository;
        this.notaSaidaRepository = notaSaidaRepository;
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
    
    /**
     * Calcula o valor total que deve ser recebido (incluindo desconto, multa e juros se aplicável)
     * sem salvar a conta
     */
    public BigDecimal calcularValorTotalParaRecebimento(Long id, LocalDate dataRecebimento) {
        ContaReceber conta = findById(id);
        
        if (conta.getSituacao().equals("RECEBIDA")) {
            throw new IllegalArgumentException("Esta conta já está recebida");
        }
        
        if (conta.getSituacao().equals("CANCELADA")) {
            throw new IllegalArgumentException("Esta conta está cancelada");
        }
        
        // Buscar a condição de pagamento da nota para obter os percentuais
        CondicaoPagamento condicao = null;
        try {
            // Buscar nota de saída para obter a condição de pagamento
            Optional<NotaSaida> notaOpt = notaSaidaRepository.findByChave(
                conta.getNotaNumero(),
                conta.getNotaModelo(),
                conta.getNotaSerie(),
                conta.getClienteId()
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
        boolean recebimentoAntesVencimento = dataRecebimento.isBefore(conta.getDataVencimento());
        boolean recebimentoNoDiaVencimento = dataRecebimento.isEqual(conta.getDataVencimento());
        boolean recebimentoDepoisVencimento = dataRecebimento.isAfter(conta.getDataVencimento());
        
        // Se recebimento ANTES ou NO DIA do vencimento: aplicar DESCONTO
        if (recebimentoAntesVencimento || recebimentoNoDiaVencimento) {
            Double percentualDesconto = (condicao != null && condicao.getPercentualDesconto() != null) 
                ? condicao.getPercentualDesconto() 
                : 0.0;
            
            // Percentual já está no formato correto (0.20 = 20%), usar diretamente
            BigDecimal descontoDecimal = new BigDecimal(percentualDesconto);
            valorDesconto = conta.getValorOriginal().multiply(descontoDecimal).setScale(2, RoundingMode.HALF_UP);
            
            if (recebimentoAntesVencimento) {
                System.out.println("Recebimento ANTES do vencimento - Aplicando desconto: " + percentualDesconto + " (20% se for 0.20) = " + valorDesconto);
            } else {
                System.out.println("Recebimento NO DIA do vencimento - Aplicando desconto: " + percentualDesconto + " (20% se for 0.20) = " + valorDesconto);
            }
        }
        // Se recebimento DEPOIS do vencimento: aplicar MULTA e JUROS
        else if (recebimentoDepoisVencimento) {
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
            
            long diasAtraso = java.time.temporal.ChronoUnit.DAYS.between(conta.getDataVencimento(), dataRecebimento);
            
            if (diasAtraso > 0 && percentualJuros > 0) {
                // Percentual já está no formato correto (0.20 = 20%), aplicar diretamente sobre o valor
                BigDecimal jurosDecimal = new BigDecimal(percentualJuros);
                valorJuros = conta.getValorOriginal()
                    .multiply(jurosDecimal)
                    .setScale(2, RoundingMode.HALF_UP);
            }
            
            System.out.println("Recebimento DEPOIS do vencimento - Aplicando multa: " + percentualMulta + " (20% se for 0.20) = " + valorMulta + 
                             ", Juros: " + percentualJuros + " (20% se for 0.20) = " + valorJuros + " (dias atraso: " + diasAtraso + ")");
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
        
        System.out.println("\n=== REGISTRANDO RECEBIMENTO ===");
        System.out.println("Conta ID: " + conta.getId());
        System.out.println("Nota: " + conta.getNotaNumero() + "/" + conta.getNotaModelo() + "/" + conta.getNotaSerie());
        System.out.println("Cliente ID: " + conta.getClienteId());
        System.out.println("Data Recebimento: " + dataRecebimento);
        System.out.println("Data Vencimento: " + conta.getDataVencimento());
        System.out.println("Valor Original: R$ " + conta.getValorOriginal());
        System.out.println("Valor Recebido: R$ " + valorRecebido);
        
        // Buscar a condição de pagamento da nota para obter os percentuais
        CondicaoPagamento condicao = null;
        try {
            // Buscar nota de saída para obter a condição de pagamento
            Optional<NotaSaida> notaOpt = notaSaidaRepository.findByChave(
                conta.getNotaNumero(),
                conta.getNotaModelo(),
                conta.getNotaSerie(),
                conta.getClienteId()
            );
            
            if (notaOpt.isPresent()) {
                NotaSaida nota = notaOpt.get();
                System.out.println("Nota encontrada. Condição Pagamento ID: " + nota.getCondicaoPagamentoId());
                
                if (nota.getCondicaoPagamentoId() != null) {
                    condicao = condicaoPagamentoRepository.findById(nota.getCondicaoPagamentoId())
                        .orElse(null);
                    
                    if (condicao != null) {
                        System.out.println("Condição de pagamento encontrada: " + condicao.getCondicaoPagamento());
                        System.out.println("  Percentual Desconto: " + condicao.getPercentualDesconto());
                        System.out.println("  Percentual Multa: " + condicao.getPercentualMulta());
                        System.out.println("  Percentual Juros: " + condicao.getPercentualJuros());
                    } else {
                        System.out.println("⚠ Condição de pagamento não encontrada no banco");
                    }
                } else {
                    System.out.println("⚠ Nota não possui condição de pagamento vinculada");
                }
            } else {
                System.out.println("⚠ Nota de saída não encontrada");
            }
        } catch (Exception e) {
            // Se não conseguir buscar a condição, usar valores padrão
            System.err.println("❌ Erro ao buscar condição de pagamento: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Comparar datas (sem hora)
        boolean recebimentoAntesVencimento = dataRecebimento.isBefore(conta.getDataVencimento());
        boolean recebimentoNoDiaVencimento = dataRecebimento.isEqual(conta.getDataVencimento());
        boolean recebimentoDepoisVencimento = dataRecebimento.isAfter(conta.getDataVencimento());
        
        // Se recebimento ANTES ou NO DIA do vencimento: aplicar DESCONTO
        if (recebimentoAntesVencimento || recebimentoNoDiaVencimento) {
            if (recebimentoAntesVencimento) {
                System.out.println("✓ Recebimento ANTES do vencimento - Aplicando DESCONTO");
            } else {
                System.out.println("✓ Recebimento NO DIA do vencimento - Aplicando DESCONTO");
            }
            Double percentualDesconto = (condicao != null && condicao.getPercentualDesconto() != null) 
                ? condicao.getPercentualDesconto() 
                : 0.0;
            
            System.out.println("  Percentual Desconto da condição: " + percentualDesconto);
            
            // Percentual já está no formato correto (0.20 = 20%), usar diretamente
            BigDecimal descontoDecimal = new BigDecimal(percentualDesconto);
            BigDecimal desconto = conta.getValorOriginal().multiply(descontoDecimal).setScale(2, RoundingMode.HALF_UP);
            conta.setValorDesconto(desconto);
            conta.setValorJuros(BigDecimal.ZERO);
            conta.setValorMulta(BigDecimal.ZERO);
            
            System.out.println("  Desconto calculado: R$ " + desconto + " (sobre R$ " + conta.getValorOriginal() + ")");
        }
        // Se recebimento DEPOIS do vencimento: aplicar MULTA e JUROS
        else if (recebimentoDepoisVencimento) {
            System.out.println("✓ Recebimento DEPOIS do vencimento - Aplicando MULTA e JUROS");
            
            // Calcular multa usando percentual da condição de pagamento
            // Multa é aplicada apenas uma vez sobre o valor original
            Double percentualMulta = (condicao != null && condicao.getPercentualMulta() != null) 
                ? condicao.getPercentualMulta() 
                : 0.0;
            
            System.out.println("  Percentual Multa da condição: " + percentualMulta);
            
            // Percentual já está no formato correto (0.20 = 20%), usar diretamente
            BigDecimal multaDecimal = new BigDecimal(percentualMulta);
            BigDecimal multa = conta.getValorOriginal().multiply(multaDecimal).setScale(2, RoundingMode.HALF_UP);
            conta.setValorMulta(multa);
            
            System.out.println("  Multa calculada: R$ " + multa + " (sobre R$ " + conta.getValorOriginal() + ")");
            
            // Calcular juros usando percentual da condição de pagamento
            // Juros aplicado como porcentagem fixa sobre o valor original (igual à multa)
            Double percentualJuros = (condicao != null && condicao.getPercentualJuros() != null) 
                ? condicao.getPercentualJuros() 
                : 0.0;
            
            System.out.println("  Percentual Juros da condição: " + percentualJuros);
            
            long diasAtraso = java.time.temporal.ChronoUnit.DAYS.between(conta.getDataVencimento(), dataRecebimento);
            System.out.println("  Dias de atraso: " + diasAtraso);
            
            BigDecimal juros = BigDecimal.ZERO;
            if (diasAtraso > 0 && percentualJuros > 0) {
                // Percentual já está no formato correto (0.20 = 20%), aplicar diretamente sobre o valor
                BigDecimal jurosDecimal = new BigDecimal(percentualJuros);
                juros = conta.getValorOriginal()
                    .multiply(jurosDecimal)
                    .setScale(2, RoundingMode.HALF_UP);
                
                System.out.println("  Juros calculado: R$ " + juros + " (sobre R$ " + conta.getValorOriginal() + ")");
            } else {
                System.out.println("  Juros não aplicado (dias atraso: " + diasAtraso + ", percentual: " + percentualJuros + ")");
            }
            conta.setValorJuros(juros);
            conta.setValorDesconto(BigDecimal.ZERO);
        }
        
        // Calcular valor total: Original + Juros + Multa - Desconto
        BigDecimal valorTotal = conta.getValorOriginal()
                .add(conta.getValorJuros())
                .add(conta.getValorMulta())
                .subtract(conta.getValorDesconto());
        conta.setValorTotal(valorTotal);
        
        System.out.println("\n=== VALORES FINAIS ===");
        System.out.println("Valor Original: R$ " + conta.getValorOriginal());
        System.out.println("Juros: R$ " + conta.getValorJuros());
        System.out.println("Multa: R$ " + conta.getValorMulta());
        System.out.println("Desconto: R$ " + conta.getValorDesconto());
        System.out.println("Valor Total: R$ " + valorTotal);
        System.out.println("=====================\n");
        
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
        
        System.out.println("=== GERANDO CONTAS A RECEBER ===");
        System.out.println("Nota: " + nota.getNumero() + " | Valor Total: " + nota.getValorTotal());
        System.out.println("Condição de Pagamento ID: " + condicao.getId() + " | Nome: " + condicao.getCondicaoPagamento());
        
        // Obter parcelas da condição de pagamento
        List<com.example.PizzariaGraff.model.ParcelaCondicaoPagamento> parcelas = condicao.getParcelasCondicaoPagamento();
        
        System.out.println("Parcelas carregadas: " + (parcelas != null ? parcelas.size() : 0));
        
        // Se as parcelas não foram carregadas, tentar recarregar
        if (parcelas == null || parcelas.isEmpty()) {
            System.out.println("⚠ Parcelas não foram carregadas com a condição. Tentando recarregar...");
            // Recarregar a condição para garantir que as parcelas sejam carregadas
            condicao = condicaoPagamentoRepository.findById(nota.getCondicaoPagamentoId())
                    .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada"));
            parcelas = condicao.getParcelasCondicaoPagamento();
            System.out.println("Parcelas após recarregar: " + (parcelas != null ? parcelas.size() : 0));
        }
        
        // Log detalhado das parcelas
        if (parcelas != null && !parcelas.isEmpty()) {
            System.out.println("Detalhes das parcelas:");
            for (int i = 0; i < parcelas.size(); i++) {
                com.example.PizzariaGraff.model.ParcelaCondicaoPagamento p = parcelas.get(i);
                System.out.println("  Parcela " + (i + 1) + ": Número=" + p.getNumero() + 
                                 ", Dias=" + p.getDias() + 
                                 ", Percentual=" + p.getPercentual());
            }
        }
        
        if (parcelas == null || parcelas.isEmpty()) {
            System.out.println("⚠ AVISO: Condição de pagamento não possui parcelas definidas. Gerando parcela única.");
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
        
        System.out.println("Total de parcelas geradas: " + contas.size() + ", Soma: " + somaParcelasGeradas);
        
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

