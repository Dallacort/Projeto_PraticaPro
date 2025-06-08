package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.dto.CondicaoPagamentoDTO;
import com.example.PizzariaGraff.dto.ParcelaCondicaoPagamentoDTO;
import com.example.PizzariaGraff.model.CondicaoPagamento;
import com.example.PizzariaGraff.model.ParcelaCondicaoPagamento;
import com.example.PizzariaGraff.model.FormaPagamento;
import com.example.PizzariaGraff.repository.CondicaoPagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CondicaoPagamentoService {

    private final CondicaoPagamentoRepository condicaoPagamentoRepository;

    @Autowired
    public CondicaoPagamentoService(CondicaoPagamentoRepository condicaoPagamentoRepository) {
        this.condicaoPagamentoRepository = condicaoPagamentoRepository;
    }

    public List<CondicaoPagamentoDTO> findAll() {
        return condicaoPagamentoRepository.findAll()
                .stream()
                .map(CondicaoPagamentoDTO::new)
                .collect(Collectors.toList());
    }

    public List<CondicaoPagamentoDTO> findAtivos() {
        return condicaoPagamentoRepository.findByAtivoTrue()
                .stream()
                .map(CondicaoPagamentoDTO::new)
                .collect(Collectors.toList());
    }

    public CondicaoPagamentoDTO findById(Long id) {
        Optional<CondicaoPagamento> condicao = condicaoPagamentoRepository.findById(id);
        return condicao.map(CondicaoPagamentoDTO::new).orElse(null);
    }

    public CondicaoPagamentoDTO findByCondicaoPagamento(String condicaoPagamento) {
        Optional<CondicaoPagamento> condicao = condicaoPagamentoRepository.findByCondicaoPagamento(condicaoPagamento);
        return condicao.map(CondicaoPagamentoDTO::new).orElse(null);
    }

    public List<CondicaoPagamentoDTO> findByTermo(String termo) {
        return condicaoPagamentoRepository.findByTermo(termo)
                .stream()
                .map(CondicaoPagamentoDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public CondicaoPagamentoDTO create(CondicaoPagamentoDTO dto) {
        try {
            System.out.println("Iniciando criação de condição de pagamento");
            
            // Validações básicas dos campos obrigatórios
            if (dto.getCondicaoPagamento() == null || dto.getCondicaoPagamento().isEmpty()) {
                throw new IllegalArgumentException("Condição de pagamento não pode ser vazia");
            }
            
            // Validação da condição de pagamento existente
            if (condicaoPagamentoRepository.existsByCondicaoPagamento(dto.getCondicaoPagamento())) {
                throw new IllegalArgumentException("Já existe uma condição de pagamento com o nome: " + dto.getCondicaoPagamento());
            }
            
            // Validações de valores
            if (dto.getNumeroParcelas() != null && dto.getNumeroParcelas() <= 0) {
                throw new IllegalArgumentException("Número de parcelas deve ser maior que zero");
            }
            
            if (dto.getDiasPrimeiraParcela() != null && dto.getDiasPrimeiraParcela() < 0) {
                throw new IllegalArgumentException("Dias da primeira parcela não pode ser negativo");
            }
            
            if (dto.getDiasEntreParcelas() != null && dto.getDiasEntreParcelas() < 0) {
                throw new IllegalArgumentException("Dias entre parcelas não pode ser negativo");
            }
            
            // Validação das parcelas
            if (dto.getParcelasCondicaoPagamento() != null && !dto.getParcelasCondicaoPagamento().isEmpty()) {
                double totalPercentual = 0.0;
                for (ParcelaCondicaoPagamentoDTO parcela : dto.getParcelasCondicaoPagamento()) {
                    if (parcela.getNumero() == null || parcela.getNumero() <= 0) {
                        throw new IllegalArgumentException("Número da parcela deve ser maior que zero");
                    }
                    
                    if (parcela.getDias() == null || parcela.getDias() < 0) {
                        throw new IllegalArgumentException("Dias da parcela não pode ser negativo");
                    }
                    
                    if (parcela.getPercentual() == null || parcela.getPercentual() <= 0) {
                        throw new IllegalArgumentException("Percentual da parcela deve ser maior que zero");
                    }
                    
                    totalPercentual += parcela.getPercentual();
                }
                
                // Verifica se o total é próximo de 100%
                if (Math.abs(totalPercentual - 100.0) > 0.01) {
                    throw new IllegalArgumentException("A soma dos percentuais das parcelas deve ser igual a 100%");
                }
            }
            
            System.out.println("Validação concluída com sucesso");
            
            CondicaoPagamento condicao = fromDTO(dto);
            System.out.println("Convertido para entidade");
            
            CondicaoPagamento savedCondicao = condicaoPagamentoRepository.save(condicao);
            System.out.println("Entidade salva com ID: " + savedCondicao.getId());
            
            // Retorna o DTO com os dados atualizados
            return CondicaoPagamentoDTO.fromEntity(savedCondicao);
        } catch (Exception e) {
            System.err.println("Erro ao criar condição de pagamento: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public CondicaoPagamentoDTO update(CondicaoPagamentoDTO dto) {
        try {
            System.out.println("Iniciando atualização de condição de pagamento ID: " + dto.getId());
            
            // Validações básicas dos campos obrigatórios
            if (dto.getCondicaoPagamento() == null || dto.getCondicaoPagamento().isEmpty()) {
                throw new IllegalArgumentException("Condição de pagamento não pode ser vazia");
            }
            
            // Validações de valores
            if (dto.getNumeroParcelas() != null && dto.getNumeroParcelas() <= 0) {
                throw new IllegalArgumentException("Número de parcelas deve ser maior que zero");
            }
            
            if (dto.getDiasPrimeiraParcela() != null && dto.getDiasPrimeiraParcela() < 0) {
                throw new IllegalArgumentException("Dias da primeira parcela não pode ser negativo");
            }
            
            if (dto.getDiasEntreParcelas() != null && dto.getDiasEntreParcelas() < 0) {
                throw new IllegalArgumentException("Dias entre parcelas não pode ser negativo");
            }
            
            // Primeiro busca a condição atual para verificar se ela existe
            Optional<CondicaoPagamento> condicaoExistente = condicaoPagamentoRepository.findById(dto.getId());
            if (condicaoExistente.isEmpty()) {
                throw new IllegalArgumentException("Condição de pagamento com ID " + dto.getId() + " não encontrada");
            }
            
            // Verificar se o nome está sendo alterado e se já existe outro registro com o mesmo nome
            CondicaoPagamento condicaoAtual = condicaoExistente.get();
            if (!dto.getCondicaoPagamento().equals(condicaoAtual.getCondicaoPagamento())) {
                if (condicaoPagamentoRepository.existsByCondicaoPagamento(dto.getCondicaoPagamento())) {
                    throw new IllegalArgumentException("Já existe uma condição de pagamento com o nome: " + dto.getCondicaoPagamento());
                }
            }
            
            // Validação das parcelas
            if (dto.getParcelasCondicaoPagamento() != null && !dto.getParcelasCondicaoPagamento().isEmpty()) {
                double totalPercentual = 0.0;
                for (ParcelaCondicaoPagamentoDTO parcela : dto.getParcelasCondicaoPagamento()) {
                    if (parcela.getNumero() == null || parcela.getNumero() <= 0) {
                        throw new IllegalArgumentException("Número da parcela deve ser maior que zero");
                    }
                    
                    if (parcela.getDias() == null || parcela.getDias() < 0) {
                        throw new IllegalArgumentException("Dias da parcela não pode ser negativo");
                    }
                    
                    if (parcela.getPercentual() == null || parcela.getPercentual() <= 0) {
                        throw new IllegalArgumentException("Percentual da parcela deve ser maior que zero");
                    }
                    
                    totalPercentual += parcela.getPercentual();
                }
                
                // Verifica se o total é próximo de 100%
                if (Math.abs(totalPercentual - 100.0) > 0.01) {
                    throw new IllegalArgumentException("A soma dos percentuais das parcelas deve ser igual a 100%");
                }
            }
            
            System.out.println("Validação concluída com sucesso");
            
            // Preparar as parcelas para inserção
            if (dto.getParcelasCondicaoPagamento() != null && !dto.getParcelasCondicaoPagamento().isEmpty()) {
                System.out.println("Preparando " + dto.getParcelasCondicaoPagamento().size() + " parcelas para atualização");
                // Reset os IDs das parcelas para forçar inserção
                for (ParcelaCondicaoPagamentoDTO parcela : dto.getParcelasCondicaoPagamento()) {
                    parcela.setId(null); // Força a criação de novas parcelas
                    parcela.setCondicaoPagamentoId(dto.getId()); // Garante que a condição ID seja a correta
                }
            }
            
            CondicaoPagamento condicao = fromDTO(dto);
            System.out.println("Convertido para entidade com " + 
                (condicao.getParcelasCondicaoPagamento() != null ? 
                condicao.getParcelasCondicaoPagamento().size() : 0) + " parcelas");
            
            CondicaoPagamento savedCondicao = condicaoPagamentoRepository.save(condicao);
            System.out.println("Entidade atualizada com ID: " + savedCondicao.getId());
            
            // Retorna o DTO com os dados atualizados
            return CondicaoPagamentoDTO.fromEntity(savedCondicao);
        } catch (Exception e) {
            System.err.println("Erro ao atualizar condição de pagamento: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void deleteById(Long id) {
        try {
            // Verificar se a condição de pagamento existe
            Optional<CondicaoPagamento> condicaoOptional = condicaoPagamentoRepository.findById(id);
            if (condicaoOptional.isEmpty()) {
                throw new RuntimeException("Condição de pagamento não encontrada");
            }
            
            // Implementar exclusão lógica - apenas marcar como inativo
            CondicaoPagamento condicao = condicaoOptional.get();
            condicao.setAtivo(false);
            condicao.setUltimaModificacao(LocalDateTime.now());
            
            // Salvar a condição atualizada
            condicaoPagamentoRepository.save(condicao);
            
            System.out.println("Condição de pagamento ID " + id + " marcada como inativa");
        } catch (Exception e) {
            System.err.println("Erro ao excluir condição de pagamento: " + e.getMessage());
            throw new RuntimeException("Erro ao excluir condição de pagamento", e);
        }
    }

    private void validateCondicaoPagamento(CondicaoPagamentoDTO dto) {
        if (dto.getCondicaoPagamento() == null || dto.getCondicaoPagamento().trim().isEmpty()) {
            throw new IllegalArgumentException("Condição de pagamento não pode ser vazia");
        }
        
        if (dto.getNumeroParcelas() != null && dto.getNumeroParcelas() <= 0) {
            throw new IllegalArgumentException("Número de parcelas deve ser maior que zero");
        }
        
        if (dto.getParcelas() != null && dto.getParcelas() <= 0) {
            throw new IllegalArgumentException("Quantidade de parcelas deve ser maior que zero");
        }
        
        if (dto.getDiasPrimeiraParcela() != null && dto.getDiasPrimeiraParcela() < 0) {
            throw new IllegalArgumentException("Dias para primeira parcela não pode ser negativo");
        }
        
        if (dto.getDiasEntreParcelas() != null && dto.getDiasEntreParcelas() < 0) {
            throw new IllegalArgumentException("Dias entre parcelas não pode ser negativo");
        }
        
        if (dto.getPercentualJuros() != null && dto.getPercentualJuros() < 0) {
            throw new IllegalArgumentException("Percentual de juros não pode ser negativo");
        }
        
        if (dto.getPercentualMulta() != null && dto.getPercentualMulta() < 0) {
            throw new IllegalArgumentException("Percentual de multa não pode ser negativo");
        }
        
        if (dto.getPercentualDesconto() != null && dto.getPercentualDesconto() < 0) {
            throw new IllegalArgumentException("Percentual de desconto não pode ser negativo");
        }
    }

    public CondicaoPagamento fromDTO(CondicaoPagamentoDTO dto) {
        CondicaoPagamento condicao = new CondicaoPagamento();
        
        condicao.setId(dto.getId());
        condicao.setCondicaoPagamento(dto.getCondicaoPagamento());
        condicao.setNumeroParcelas(dto.getNumeroParcelas());
        condicao.setParcelas(dto.getParcelas());
        
        condicao.setDiasPrimeiraParcela(dto.getDiasPrimeiraParcela());
        condicao.setDiasEntreParcelas(dto.getDiasEntreParcelas());
        condicao.setPercentualJuros(dto.getPercentualJuros());
        condicao.setPercentualMulta(dto.getPercentualMulta());
        condicao.setPercentualDesconto(dto.getPercentualDesconto());
        
        condicao.setAtivo(dto.getAtivo());
        condicao.setDataCadastro(dto.getDataCadastro());
        condicao.setUltimaModificacao(dto.getUltimaModificacao());
        
        // Converter parcelas, se existirem
        if (dto.getParcelasCondicaoPagamento() != null && !dto.getParcelasCondicaoPagamento().isEmpty()) {
            List<ParcelaCondicaoPagamento> parcelas = new ArrayList<>();
            
            for (ParcelaCondicaoPagamentoDTO parcelaDTO : dto.getParcelasCondicaoPagamento()) {
                ParcelaCondicaoPagamento parcela = parcelaDTO.toEntity();
                parcela.setCondicaoPagamento(condicao);
                parcelas.add(parcela);
                
                System.out.println("Parcela " + parcela.getNumero() + 
                    " com formaPagamentoId: " + 
                    (parcela.getFormaPagamento() != null ? parcela.getFormaPagamento().getId() : "null"));
            }
            
            condicao.setParcelasCondicaoPagamento(parcelas);
        }
        
        return condicao;
    }
} 