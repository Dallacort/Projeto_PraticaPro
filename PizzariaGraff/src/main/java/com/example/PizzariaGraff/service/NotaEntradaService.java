package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.NotaEntrada;
import com.example.PizzariaGraff.model.ProdutoNota;
import com.example.PizzariaGraff.repository.NotaEntradaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class NotaEntradaService {
    
    private final NotaEntradaRepository notaEntradaRepository;
    private final ContaPagarService contaPagarService;
    
    public NotaEntradaService(NotaEntradaRepository notaEntradaRepository,
                              ContaPagarService contaPagarService) {
        this.notaEntradaRepository = notaEntradaRepository;
        this.contaPagarService = contaPagarService;
    }
    
    public List<NotaEntrada> findAll() {
        return notaEntradaRepository.findAll();
    }
    
    public NotaEntrada findByChave(String numero, String modelo, String serie, Long fornecedorId) {
        return notaEntradaRepository.findByChave(numero, modelo, serie, fornecedorId)
                .orElseThrow(() -> new RuntimeException("Nota de entrada não encontrada"));
    }
    
    public List<NotaEntrada> findByFornecedorId(Long fornecedorId) {
        return notaEntradaRepository.findByFornecedorId(fornecedorId);
    }
    
    public List<NotaEntrada> findBySituacao(String situacao) {
        return notaEntradaRepository.findBySituacao(situacao);
    }
    
    public NotaEntrada save(NotaEntrada nota) {
        // Validações
        validarNota(nota);
        
        // Calcular rateios se houver produtos
        if (nota.getProdutos() != null && !nota.getProdutos().isEmpty()) {
            calcularRateios(nota);
        }
        
        // Salvar nota
        NotaEntrada notaSalva = notaEntradaRepository.save(nota);
        
        // Gerar contas a pagar automaticamente (sempre que salvar)
        try {
            // Deletar contas antigas se existirem (caso de atualização)
            contaPagarService.deletarContasDaNota(
                notaSalva.getNumero(), 
                notaSalva.getModelo(), 
                notaSalva.getSerie(), 
                notaSalva.getFornecedorId()
            );
            
            // Gerar novas contas
            contaPagarService.gerarContasDaNota(notaSalva);
        } catch (Exception e) {
            System.err.println("Erro ao gerar contas a pagar: " + e.getMessage());
            e.printStackTrace();
            // Não falha o salvamento da nota se houver erro ao gerar contas
        }
        
        return notaSalva;
    }
    
    public void deleteByChave(String numero, String modelo, String serie, Long fornecedorId) {
        notaEntradaRepository.deleteByChave(numero, modelo, serie, fornecedorId);
    }
    
    public void cancelarNota(String numero, String modelo, String serie, Long fornecedorId) {
        NotaEntrada nota = findByChave(numero, modelo, serie, fornecedorId);
        
        if (nota.getSituacao().equals("CANCELADA")) {
            throw new IllegalArgumentException("Esta nota já está cancelada");
        }
        
        // Cancelar a nota
        nota.setSituacao("CANCELADA");
        notaEntradaRepository.save(nota);
        
        // Cancelar todas as contas a pagar relacionadas
        try {
            contaPagarService.cancelarContasDaNota(numero, modelo, serie, fornecedorId);
        } catch (Exception e) {
            System.err.println("Erro ao cancelar contas a pagar: " + e.getMessage());
            e.printStackTrace();
            // Não falha o cancelamento da nota se houver erro ao cancelar contas
        }
    }
    
    private void validarNota(NotaEntrada nota) {
        if (nota.getNumero() == null || nota.getNumero().trim().isEmpty()) {
            throw new IllegalArgumentException("Número da nota é obrigatório");
        }
        
        if (nota.getFornecedorId() == null) {
            throw new IllegalArgumentException("Fornecedor é obrigatório");
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
            ProdutoNota produto = nota.getProdutos().get(i);
            
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
    
    private void calcularRateios(NotaEntrada nota) {
        List<ProdutoNota> produtos = nota.getProdutos();
        
        if (produtos.isEmpty()) {
            return;
        }
        
        // Somar valor total dos produtos
        BigDecimal totalProdutos = produtos.stream()
                .map(ProdutoNota::getValorTotal)
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
            ProdutoNota produto = produtos.get(i);
            
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

