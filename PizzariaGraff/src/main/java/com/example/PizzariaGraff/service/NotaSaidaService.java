package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.NotaSaida;
import com.example.PizzariaGraff.model.ProdutoNotaSaida;
import com.example.PizzariaGraff.repository.NotaSaidaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class NotaSaidaService {
    
    private final NotaSaidaRepository notaSaidaRepository;
    private final ContaReceberService contaReceberService;
    
    public NotaSaidaService(NotaSaidaRepository notaSaidaRepository,
                            ContaReceberService contaReceberService) {
        this.notaSaidaRepository = notaSaidaRepository;
        this.contaReceberService = contaReceberService;
    }
    
    public List<NotaSaida> findAll() {
        return notaSaidaRepository.findAll();
    }
    
    public NotaSaida findByChave(String numero, String modelo, String serie, Long clienteId) {
        return notaSaidaRepository.findByChave(numero, modelo, serie, clienteId)
                .orElseThrow(() -> new RuntimeException("Nota de saída não encontrada"));
    }
    
    public List<NotaSaida> findByClienteId(Long clienteId) {
        return notaSaidaRepository.findByClienteId(clienteId);
    }
    
    public List<NotaSaida> findBySituacao(String situacao) {
        return notaSaidaRepository.findBySituacao(situacao);
    }
    
    public NotaSaida save(NotaSaida nota) {
        // Validações
        validarNota(nota);
        
        // Calcular rateios se houver produtos
        if (nota.getProdutos() != null && !nota.getProdutos().isEmpty()) {
            calcularRateios(nota);
        }
        
        // Salvar nota
        NotaSaida notaSalva = notaSaidaRepository.save(nota);
        
        // Gerar contas a receber automaticamente (sempre que salvar)
        try {
            // Deletar contas antigas se existirem (caso de atualização)
            contaReceberService.deletarContasDaNota(
                notaSalva.getNumero(), 
                notaSalva.getModelo(), 
                notaSalva.getSerie(), 
                notaSalva.getClienteId()
            );
            
            // Gerar novas contas
            contaReceberService.gerarContasDaNota(notaSalva);
        } catch (Exception e) {
            System.err.println("Erro ao gerar contas a receber: " + e.getMessage());
            e.printStackTrace();
            // Não falha o salvamento da nota se houver erro ao gerar contas
        }
        
        return notaSalva;
    }
    
    public void deleteByChave(String numero, String modelo, String serie, Long clienteId) {
        notaSaidaRepository.deleteByChave(numero, modelo, serie, clienteId);
    }
    
    private void validarNota(NotaSaida nota) {
        if (nota.getNumero() == null || nota.getNumero().trim().isEmpty()) {
            throw new IllegalArgumentException("Número da nota é obrigatório");
        }
        
        if (nota.getClienteId() == null) {
            throw new IllegalArgumentException("Cliente é obrigatório");
        }
        
        if (nota.getDataEmissao() == null) {
            throw new IllegalArgumentException("Data de emissão é obrigatória");
        }
        
        if (nota.getProdutos() == null || nota.getProdutos().isEmpty()) {
            throw new IllegalArgumentException("A nota deve conter pelo menos um produto");
        }
        
        // Validar tipo de frete
        if (nota.getTipoFrete() != null) {
            String tipoFrete = nota.getTipoFrete().toUpperCase();
            if (!tipoFrete.equals("CIF") && !tipoFrete.equals("FOB") && !tipoFrete.equals("SEM")) {
                throw new IllegalArgumentException("Tipo de frete deve ser CIF, FOB ou SEM");
            }
        }
        
        // Validar situação
        if (nota.getSituacao() != null) {
            String situacao = nota.getSituacao().toUpperCase();
            if (!situacao.equals("PENDENTE") && !situacao.equals("CONFIRMADA") && !situacao.equals("CANCELADA")) {
                throw new IllegalArgumentException("Situação deve ser PENDENTE, CONFIRMADA ou CANCELADA");
            }
        }
        
        // Validar cada produto
        for (int i = 0; i < nota.getProdutos().size(); i++) {
            ProdutoNotaSaida produto = nota.getProdutos().get(i);
            
            if (produto.getProdutoId() == null) {
                throw new IllegalArgumentException("Produto " + (i + 1) + ": ID do produto é obrigatório");
            }
            
            if (produto.getQuantidade() == null || produto.getQuantidade().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Produto " + (i + 1) + ": Quantidade deve ser maior que zero");
            }
            
            if (produto.getValorUnitario() == null || produto.getValorUnitario().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Produto " + (i + 1) + ": Valor unitário não pode ser negativo");
            }
            
            if (produto.getValorTotal() == null || produto.getValorTotal().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Produto " + (i + 1) + ": Valor total não pode ser negativo");
            }
            
            // Definir sequência se não estiver definida
            if (produto.getSequencia() == null || produto.getSequencia() == 0) {
                produto.setSequencia(i + 1);
            }
        }
    }
    
    private void calcularRateios(NotaSaida nota) {
        List<ProdutoNotaSaida> produtos = nota.getProdutos();
        
        if (produtos.isEmpty()) {
            return;
        }
        
        // Somar valor total dos produtos
        BigDecimal totalProdutos = produtos.stream()
                .map(ProdutoNotaSaida::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalProdutos.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }
        
        // Calcular rateio proporcional para cada produto
        BigDecimal frete = nota.getValorFrete() != null ? nota.getValorFrete() : BigDecimal.ZERO;
        BigDecimal seguro = nota.getValorSeguro() != null ? nota.getValorSeguro() : BigDecimal.ZERO;
        BigDecimal outras = nota.getOutrasDespesas() != null ? nota.getOutrasDespesas() : BigDecimal.ZERO;
        
        BigDecimal totalRateioFrete = BigDecimal.ZERO;
        BigDecimal totalRateioSeguro = BigDecimal.ZERO;
        BigDecimal totalRateioOutras = BigDecimal.ZERO;
        
        for (int i = 0; i < produtos.size(); i++) {
            ProdutoNotaSaida produto = produtos.get(i);
            
            // Calcular proporção do produto no total
            BigDecimal proporcao = produto.getValorTotal().divide(totalProdutos, 10, RoundingMode.HALF_UP);
            
            // Calcular rateios
            BigDecimal rateioFrete = frete.multiply(proporcao).setScale(4, RoundingMode.HALF_UP);
            BigDecimal rateioSeguro = seguro.multiply(proporcao).setScale(4, RoundingMode.HALF_UP);
            BigDecimal rateioOutras = outras.multiply(proporcao).setScale(4, RoundingMode.HALF_UP);
            
            // Se for o último produto, ajustar para evitar erro de arredondamento
            if (i == produtos.size() - 1) {
                rateioFrete = frete.subtract(totalRateioFrete);
                rateioSeguro = seguro.subtract(totalRateioSeguro);
                rateioOutras = outras.subtract(totalRateioOutras);
            }
            
            produto.setRateioFrete(rateioFrete);
            produto.setRateioSeguro(rateioSeguro);
            produto.setRateioOutras(rateioOutras);
            
            // Calcular custo preço final (valor total + rateios)
            BigDecimal custoFinal = produto.getValorTotal()
                    .add(rateioFrete)
                    .add(rateioSeguro)
                    .add(rateioOutras)
                    .setScale(4, RoundingMode.HALF_UP);
            
            produto.setCustoPrecoFinal(custoFinal);
            
            // Acumular totais para ajuste final
            totalRateioFrete = totalRateioFrete.add(rateioFrete);
            totalRateioSeguro = totalRateioSeguro.add(rateioSeguro);
            totalRateioOutras = totalRateioOutras.add(rateioOutras);
        }
    }
}

