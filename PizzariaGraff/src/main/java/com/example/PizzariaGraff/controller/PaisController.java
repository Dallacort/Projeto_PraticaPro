package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.PaisDTO;
import com.example.PizzariaGraff.model.Pais;
import com.example.PizzariaGraff.service.PaisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/paises")
@Tag(name = "Países", description = "API para gerenciamento de países")
public class PaisController {

    private final PaisService paisService;

    public PaisController(PaisService paisService) {
        this.paisService = paisService;
    }

    @GetMapping("/ativos")
    @Operation(summary = "Lista todos os países ativos")
    public ResponseEntity<?> listarAtivos() {
        try {
            System.out.println("Iniciando busca de países ativos para seleção em formulários");
            
            List<Pais> paises = paisService.findAll();
            
            if (paises.isEmpty()) {
                System.out.println("Lista de países está vazia, criando país padrão");
                Pais brasil = new Pais();
                brasil.setNome("Brasil");
                brasil.setCodigo("55");
                brasil.setSigla("BR");
                brasil = paisService.save(brasil);
                paises.add(brasil);
            }
            
            // Formato para dropdown (compatível com o frontend existente)
            List<Map<String, Object>> resultado = new ArrayList<>();
            for (Pais pais : paises) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", pais.getId());
                item.put("nome", pais.getNome());
                resultado.add(item);
            }
            
            System.out.println("Retornando " + resultado.size() + " países ativos");
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Erro ao listar países ativos: " + e.getMessage());
            
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao listar países ativos");
            erro.put("mensagem", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @GetMapping("/simples")
    @Operation(summary = "Lista todos os países em formato simples para seleção em formulários")
    public ResponseEntity<?> listarSimples() {
        try {
            System.out.println("Iniciando busca simplificada de países para seleção em formulários");
            
            List<Pais> paises = paisService.findAll();
            
            if (paises.isEmpty()) {
                System.out.println("Lista de países está vazia, criando país padrão");
                Pais brasil = new Pais();
                brasil.setNome("Brasil");
                brasil.setCodigo("55");
                brasil.setSigla("BR");
                brasil = paisService.save(brasil);
                paises.add(brasil);
            }
            
            // Formato simplificado para dropdown
            List<Map<String, String>> resultado = new ArrayList<>();
            for (Pais pais : paises) {
                Map<String, String> item = new HashMap<>();
                item.put("id", pais.getId());
                item.put("nome", pais.getNome());
                item.put("sigla", pais.getSigla());
                resultado.add(item);
            }
            
            System.out.println("Retornando " + resultado.size() + " países em formato simplificado");
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Erro ao listar países simples: " + e.getMessage());
            
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao listar países");
            erro.put("mensagem", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @GetMapping
    @Operation(summary = "Lista todos os países")
    public ResponseEntity<?> listar() {
        try {
            System.out.println("Iniciando busca de todos os países");
            List<Pais> paises = paisService.findAll();
            System.out.println("Encontrados " + paises.size() + " países");
            
            if (paises.isEmpty()) {
                System.out.println("Lista de países está vazia, verificando se é necessário criar dados iniciais");
                // Criar um país padrão se a lista estiver vazia
                Pais brasil = new Pais();
                brasil.setNome("Brasil");
                brasil.setCodigo("55");
                brasil.setSigla("BR");
                brasil = paisService.save(brasil);
                paises.add(brasil);
                System.out.println("País padrão criado com ID: " + brasil.getId());
            }
            
            List<PaisDTO> paisesDTO = paises.stream()
                    .map(PaisDTO::fromEntity)
                    .collect(Collectors.toList());
            System.out.println("Retornando " + paisesDTO.size() + " países convertidos para DTO");
            return ResponseEntity.ok(paisesDTO);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Erro ao listar países: " + e.getMessage() + 
                               (e.getCause() != null ? " - Causa: " + e.getCause().getMessage() : ""));
            
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao listar países");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um país por ID")
    public ResponseEntity<?> buscarPorId(@PathVariable String id) {
        try {
            Pais pais = paisService.findById(id);
            return ResponseEntity.ok(PaisDTO.fromEntity(pais));
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao buscar país");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo país")
    public ResponseEntity<?> criar(@RequestBody PaisDTO paisDTO) {
        try {
            Pais pais = paisDTO.toEntity();
            pais = paisService.save(pais);
            return ResponseEntity.status(HttpStatus.CREATED).body(PaisDTO.fromEntity(pais));
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao criar país");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um país")
    public ResponseEntity<?> atualizar(@PathVariable String id, @RequestBody PaisDTO paisDTO) {
        try {
            Pais pais = paisDTO.toEntity();
            pais.setId(id);
            pais = paisService.save(pais);
            return ResponseEntity.ok(PaisDTO.fromEntity(pais));
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao atualizar país");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um país")
    public ResponseEntity<?> remover(@PathVariable String id) {
        try {
            paisService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao remover país");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }
} 