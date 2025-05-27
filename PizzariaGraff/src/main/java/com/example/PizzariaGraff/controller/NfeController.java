package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.NfeDTO;
import com.example.PizzariaGraff.model.Cliente;
import com.example.PizzariaGraff.model.Nfe;
import com.example.PizzariaGraff.service.ClienteService;
import com.example.PizzariaGraff.service.NfeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/nfes")
@Tag(name = "Notas Fiscais", description = "API para gerenciamento de notas fiscais")
public class NfeController {

    private final NfeService nfeService;
    private final ClienteService clienteService;

    public NfeController(NfeService nfeService, ClienteService clienteService) {
        this.nfeService = nfeService;
        this.clienteService = clienteService;
    }

    @GetMapping
    @Operation(summary = "Lista todas as notas fiscais")
    public ResponseEntity<List<NfeDTO>> listar() {
        List<Nfe> nfes = nfeService.findAll();
        List<NfeDTO> nfesDTO = nfes.stream()
                .map(NfeDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(nfesDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca uma nota fiscal por ID")
    public ResponseEntity<NfeDTO> buscarPorId(@PathVariable Long id) {
        try {
            Nfe nfe = nfeService.findById(id);
            return ResponseEntity.ok(NfeDTO.fromEntity(nfe));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/cliente/{clienteId}")
    @Operation(summary = "Lista todas as notas fiscais de um cliente")
    public ResponseEntity<List<NfeDTO>> listarPorCliente(@PathVariable Long clienteId) {
        List<Nfe> nfes = nfeService.findByClienteId(clienteId);
        List<NfeDTO> nfesDTO = nfes.stream()
                .map(NfeDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(nfesDTO);
    }

    @PostMapping
    @Operation(summary = "Cadastra uma nova nota fiscal")
    public ResponseEntity<NfeDTO> criar(@RequestBody NfeDTO nfeDTO) {
        try {
            Nfe nfe = nfeDTO.toEntity();
            
            // Aqui podemos carregar as entidades completas, se necessário
            if (nfeDTO.getClienteId() != null) {
                nfe.setCliente(clienteService.findById(nfeDTO.getClienteId()));
            }
            
            nfe = nfeService.save(nfe);
            return ResponseEntity.status(HttpStatus.CREATED).body(NfeDTO.fromEntity(nfe));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma nota fiscal")
    public ResponseEntity<NfeDTO> atualizar(@PathVariable Long id, @RequestBody NfeDTO nfeDTO) {
        try {
            Nfe nfe = nfeDTO.toEntity();
            nfe.setId(id);
            
            // Aqui podemos carregar as entidades completas, se necessário
            if (nfeDTO.getClienteId() != null) {
                nfe.setCliente(clienteService.findById(nfeDTO.getClienteId()));
            }
            
            nfe = nfeService.save(nfe);
            return ResponseEntity.ok(NfeDTO.fromEntity(nfe));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove uma nota fiscal")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        nfeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
} 