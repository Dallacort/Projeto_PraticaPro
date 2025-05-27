package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.CondicaoPagamentoDTO;
import com.example.PizzariaGraff.service.CondicaoPagamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/condicoes-pagamento")
@CrossOrigin(origins = "*")
public class CondicaoPagamentoController {

    private final CondicaoPagamentoService condicaoPagamentoService;

    @Autowired
    public CondicaoPagamentoController(CondicaoPagamentoService condicaoPagamentoService) {
        this.condicaoPagamentoService = condicaoPagamentoService;
    }

    @GetMapping
    public ResponseEntity<?> getAllCondicoesPagamento() {
        try {
            List<CondicaoPagamentoDTO> condicoes = condicaoPagamentoService.findAll();
            return ResponseEntity.ok(condicoes);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("erro", "Erro ao buscar condições de pagamento: " + e.getMessage());
            if (e.getCause() != null) {
                response.put("causa", e.getCause().getMessage());
            }
            
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<CondicaoPagamentoDTO>> getCondicoesPagamentoAtivas() {
        List<CondicaoPagamentoDTO> condicoes = condicaoPagamentoService.findAtivos();
        return ResponseEntity.ok(condicoes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CondicaoPagamentoDTO> getCondicaoPagamentoById(@PathVariable Long id) {
        CondicaoPagamentoDTO condicao = condicaoPagamentoService.findById(id);
        if (condicao != null) {
            return ResponseEntity.ok(condicao);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/buscar/{nome}")
    public ResponseEntity<CondicaoPagamentoDTO> getCondicaoPagamentoByNome(@PathVariable String nome) {
        CondicaoPagamentoDTO condicao = condicaoPagamentoService.findByCondicaoPagamento(nome);
        if (condicao != null) {
            return ResponseEntity.ok(condicao);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/pesquisar")
    public ResponseEntity<List<CondicaoPagamentoDTO>> pesquisarCondicoesPagamento(@RequestParam String termo) {
        List<CondicaoPagamentoDTO> condicoes = condicaoPagamentoService.findByTermo(termo);
        return ResponseEntity.ok(condicoes);
    }

    @PostMapping
    @Operation(summary = "Cria uma nova condição de pagamento")
    public ResponseEntity<CondicaoPagamentoDTO> criar(@RequestBody CondicaoPagamentoDTO condicaoDTO) {
        try {
            System.out.println("Recebendo requisição para criar condição de pagamento");
            System.out.println("Dados recebidos: " + condicaoDTO.getCondicaoPagamento());
            System.out.println("Parcelas recebidas: " + 
                (condicaoDTO.getParcelasCondicaoPagamento() != null ? condicaoDTO.getParcelasCondicaoPagamento().size() : 0));
            System.out.println("DTO completo: " + condicaoDTO);
            
            CondicaoPagamentoDTO resultado = condicaoPagamentoService.create(condicaoDTO);
            System.out.println("Condição de pagamento criada com sucesso. ID: " + resultado.getId());
            
            return ResponseEntity.ok(resultado);
        } catch (IllegalArgumentException e) {
            System.err.println("Erro de validação ao criar condição de pagamento: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            System.err.println("Erro ao criar condição de pagamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma condição de pagamento existente")
    public ResponseEntity<CondicaoPagamentoDTO> atualizar(
            @PathVariable Long id, 
            @RequestBody CondicaoPagamentoDTO condicaoDTO) {
        try {
            System.out.println("Recebendo requisição para atualizar condição de pagamento ID: " + id);
            
            if (!id.equals(condicaoDTO.getId())) {
                condicaoDTO.setId(id);
            }
            
            // Verifica se a condição existe
            try {
                condicaoPagamentoService.findById(id);
            } catch (RuntimeException e) {
                System.err.println("Condição de pagamento não encontrada para atualização");
                return ResponseEntity.notFound().build();
            }
            
            CondicaoPagamentoDTO resultado = condicaoPagamentoService.update(condicaoDTO);
            System.out.println("Condição de pagamento atualizada com sucesso");
            
            return ResponseEntity.ok(resultado);
        } catch (IllegalArgumentException e) {
            System.err.println("Erro de validação ao atualizar condição de pagamento: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            System.err.println("Erro ao atualizar condição de pagamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCondicaoPagamento(@PathVariable Long id) {
        try {
            // Verifica se a condição de pagamento existe
            CondicaoPagamentoDTO existingCondicao = condicaoPagamentoService.findById(id);
            if (existingCondicao == null) {
                return ResponseEntity.notFound().build();
            }
            
            condicaoPagamentoService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("erro", "Erro ao excluir condição de pagamento: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 