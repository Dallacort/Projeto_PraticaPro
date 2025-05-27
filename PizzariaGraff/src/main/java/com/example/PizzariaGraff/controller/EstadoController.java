package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.EstadoDTO;
import com.example.PizzariaGraff.model.Estado;
import com.example.PizzariaGraff.model.Pais;
import com.example.PizzariaGraff.service.EstadoService;
import com.example.PizzariaGraff.service.PaisService;
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
@RequestMapping("/estados")
@Tag(name = "Estados", description = "API para gerenciamento de estados")
public class EstadoController {

    private final EstadoService estadoService;
    private final PaisService paisService;

    public EstadoController(EstadoService estadoService, PaisService paisService) {
        this.estadoService = estadoService;
        this.paisService = paisService;
    }

    @GetMapping
    @Operation(summary = "Lista todos os estados")
    public ResponseEntity<?> listar() {
        try {
            List<Estado> estados = estadoService.findAll();
            List<EstadoDTO> estadosDTO = estados.stream()
                    .map(EstadoDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(estadosDTO);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao listar estados");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @GetMapping("/ativos")
    @Operation(summary = "Lista todos os estados ativos para seleção em formulários")
    public ResponseEntity<?> listarAtivos() {
        try {
            System.out.println("Iniciando busca de estados ativos para seleção em formulários");
            
            List<Estado> estados = estadoService.findAll();
            System.out.println("Encontrados " + estados.size() + " estados ativos");
            
            List<EstadoDTO> estadosDTO = estados.stream()
                    .map(EstadoDTO::fromEntity)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(estadosDTO);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Erro ao listar estados ativos: " + e.getMessage());
            
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao listar estados ativos");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um estado por ID")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            Estado estado = estadoService.findById(id);
            return ResponseEntity.ok(EstadoDTO.fromEntity(estado));
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao buscar estado");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @GetMapping("/pais/{paisId}")
    @Operation(summary = "Lista estados por país")
    public ResponseEntity<?> listarPorPais(@PathVariable String paisId) {
        try {
            System.out.println("Buscando estados para o país com ID: " + paisId);
            
            // Verificar se o país existe
            try {
                Pais pais = paisService.findById(paisId);
                System.out.println("País encontrado: " + pais.getNome());
            } catch (Exception e) {
                System.err.println("País não encontrado com ID: " + paisId);
                Map<String, String> erro = new HashMap<>();
                erro.put("erro", "País não encontrado");
                erro.put("mensagem", "Não foi possível encontrar o país com ID: " + paisId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
            }
            
            List<Estado> estados = estadoService.findByPaisId(paisId);
            System.out.println("Encontrados " + estados.size() + " estados para o país " + paisId);
            
            List<EstadoDTO> estadosDTO = estados.stream()
                    .map(EstadoDTO::fromEntity)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(estadosDTO);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Erro ao listar estados por país: " + e.getMessage());
            
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao listar estados por país");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo estado")
    public ResponseEntity<?> criar(@RequestBody EstadoDTO estadoDTO) {
        try {
            System.out.println("Iniciando cadastro de novo estado: " + estadoDTO.getNome() + " (" + estadoDTO.getUf() + ")");
            System.out.println("Dados recebidos: País ID=" + estadoDTO.getPaisId());
            
            if (estadoDTO.getPaisId() == null || estadoDTO.getPaisId().trim().isEmpty()) {
                Map<String, String> erro = new HashMap<>();
                erro.put("erro", "ID do país não informado");
                erro.put("mensagem", "É necessário informar o ID do país");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
            }
            
            try {
                Pais pais = paisService.findById(estadoDTO.getPaisId());
                System.out.println("País encontrado: " + pais.getNome() + " (ID: " + pais.getId() + ")");
                
                Estado estado = estadoDTO.toEntity(pais);
                estado = estadoService.save(estado);
                
                System.out.println("Estado cadastrado com sucesso. ID: " + estado.getId());
                return ResponseEntity.status(HttpStatus.CREATED).body(EstadoDTO.fromEntity(estado));
            } catch (Exception e) {
                System.err.println("Erro ao buscar país com ID: " + estadoDTO.getPaisId());
                System.err.println("Detalhes do erro: " + e.getMessage());
                
                Map<String, String> erro = new HashMap<>();
                erro.put("erro", "País não encontrado");
                erro.put("mensagem", "Não foi possível encontrar o país com ID: " + estadoDTO.getPaisId());
                erro.put("detalhes", e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Erro ao criar estado: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("Causa: " + e.getCause().getMessage());
            }
            
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao criar estado");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @PostMapping("/diagnostico")
    @Operation(summary = "Diagnóstico para salvar estado - apenas para depuração")
    public ResponseEntity<?> diagnosticoSalvar(@RequestBody Map<String, Object> dados) {
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("dados_recebidos", dados);
        
        try {
            String paisId = null;
            if (dados.containsKey("paisId")) {
                paisId = String.valueOf(dados.get("paisId"));
                resultado.put("pais_id_extraido", paisId);
                
                try {
                    Pais pais = paisService.findById(paisId);
                    Map<String, Object> infoPais = new HashMap<>();
                    infoPais.put("id", pais.getId());
                    infoPais.put("nome", pais.getNome());
                    infoPais.put("sigla", pais.getSigla());
                    resultado.put("pais_encontrado", infoPais);
                    resultado.put("pais_valido", true);
                } catch (Exception e) {
                    resultado.put("pais_valido", false);
                    resultado.put("erro_pais", e.getMessage());
                }
            } else {
                resultado.put("erro", "Campo 'paisId' não encontrado no JSON");
            }
            
            // Outros campos importantes
            if (dados.containsKey("nome")) {
                resultado.put("nome_valido", !String.valueOf(dados.get("nome")).trim().isEmpty());
            }
            
            if (dados.containsKey("uf")) {
                String uf = String.valueOf(dados.get("uf"));
                resultado.put("uf_valido", uf != null && uf.length() == 2);
            }
            
            // Verificar estrutura da tabela estado
            try {
                Map<String, Object> estruturaTabela = estadoService.verificarEstrutura();
                resultado.put("estrutura_tabela", estruturaTabela);
            } catch (Exception e) {
                resultado.put("erro_estrutura", e.getMessage());
            }
            
            resultado.put("status", "OK");
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            resultado.put("status", "ERRO");
            resultado.put("mensagem", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resultado);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um estado")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody EstadoDTO estadoDTO) {
        try {
            Pais pais = paisService.findById(estadoDTO.getPaisId());
            Estado estado = estadoDTO.toEntity(pais);
            estado.setId(id);
            estado = estadoService.save(estado);
            return ResponseEntity.ok(EstadoDTO.fromEntity(estado));
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao atualizar estado");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um estado")
    public ResponseEntity<?> remover(@PathVariable Long id) {
        try {
            estadoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> erro = new HashMap<>();
            erro.put("erro", "Erro ao remover estado");
            erro.put("mensagem", e.getMessage());
            erro.put("causa", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
        }
    }
} 