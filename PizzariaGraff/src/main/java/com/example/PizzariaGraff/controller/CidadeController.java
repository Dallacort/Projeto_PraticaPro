package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.CidadeDTO;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Estado;
import com.example.PizzariaGraff.service.CidadeService;
import com.example.PizzariaGraff.service.EstadoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cidades")
@Tag(name = "Cidades", description = "API para gerenciamento de cidades")
public class CidadeController {

    private final CidadeService cidadeService;
    private final EstadoService estadoService;

    public CidadeController(CidadeService cidadeService, EstadoService estadoService) {
        this.cidadeService = cidadeService;
        this.estadoService = estadoService;
    }

    @GetMapping
    @Operation(summary = "Lista todas as cidades")
    public ResponseEntity<?> listar() {
        try {
            List<Cidade> cidades = cidadeService.findAll();
            List<CidadeDTO> cidadesDTO = cidades.stream()
                    .map(CidadeDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(cidadesDTO);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao listar cidades");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca uma cidade por ID")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            Cidade cidade = cidadeService.findById(id);
            return ResponseEntity.ok(CidadeDTO.fromEntity(cidade));
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao buscar cidade");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @GetMapping("/estado/{estadoId}")
    @Operation(summary = "Lista cidades por estado")
    public ResponseEntity<List<CidadeDTO>> listarPorEstado(@PathVariable Long estadoId) {
        List<Cidade> cidades = cidadeService.findByEstadoId(estadoId);
        List<CidadeDTO> cidadesDTO = cidades.stream()
                .map(CidadeDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(cidadesDTO);
    }

    @PostMapping
    @Operation(summary = "Cadastra uma nova cidade")
    public ResponseEntity<?> criar(@RequestBody CidadeDTO cidadeDTO) {
        try {
            Estado estado = estadoService.findById(cidadeDTO.getEstadoId());
            Cidade cidade = cidadeDTO.toEntity(estado);
            cidade = cidadeService.save(cidade);
            return ResponseEntity.status(HttpStatus.CREATED).body(CidadeDTO.fromEntity(cidade));
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao criar cidade");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma cidade")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody CidadeDTO cidadeDTO) {
        try {
            Estado estado = estadoService.findById(cidadeDTO.getEstadoId());
            Cidade cidade = cidadeDTO.toEntity(estado);
            cidade.setId(id);
            cidade = cidadeService.save(cidade);
            return ResponseEntity.ok(CidadeDTO.fromEntity(cidade));
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao atualizar cidade");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove uma cidade")
    public ResponseEntity<?> remover(@PathVariable Long id) {
        try {
            cidadeService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao remover cidade");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }
} 