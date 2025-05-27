package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.ClienteDTO;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Cliente;
import com.example.PizzariaGraff.service.CidadeService;
import com.example.PizzariaGraff.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/clientes")
@Tag(name = "Clientes", description = "API para gerenciamento de clientes")
public class ClienteController {

    private final ClienteService clienteService;
    private final CidadeService cidadeService;

    public ClienteController(ClienteService clienteService, CidadeService cidadeService) {
        this.clienteService = clienteService;
        this.cidadeService = cidadeService;
    }

    @GetMapping
    @Operation(summary = "Lista todos os clientes")
    public ResponseEntity<List<ClienteDTO>> listar() {
        List<Cliente> clientes = clienteService.findAll();
        List<ClienteDTO> clientesDTO = clientes.stream()
                .map(ClienteDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(clientesDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um cliente por ID")
    public ResponseEntity<ClienteDTO> buscarPorId(@PathVariable Long id) {
        try {
            Cliente cliente = clienteService.findById(id);
            return ResponseEntity.ok(ClienteDTO.fromEntity(cliente));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/cpf/{cpf}")
    @Operation(summary = "Busca um cliente por CPF")
    public ResponseEntity<ClienteDTO> buscarPorCpf(@PathVariable String cpf) {
        try {
            Cliente cliente = clienteService.findByCpf(cpf);
            return ResponseEntity.ok(ClienteDTO.fromEntity(cliente));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/cnpj/{cnpj}")
    @Operation(summary = "Busca um cliente por CNPJ")
    public ResponseEntity<ClienteDTO> buscarPorCnpj(@PathVariable String cnpj) {
        try {
            Cliente cliente = clienteService.findByCnpj(cnpj);
            return ResponseEntity.ok(ClienteDTO.fromEntity(cliente));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo cliente")
    public ResponseEntity<ClienteDTO> criar(@RequestBody ClienteDTO clienteDTO) {
        try {
            Cidade cidade = cidadeService.findById(clienteDTO.getCidadeId());
            Cliente cliente = clienteDTO.toEntity(cidade);
            cliente = clienteService.save(cliente);
            return ResponseEntity.status(HttpStatus.CREATED).body(ClienteDTO.fromEntity(cliente));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um cliente")
    public ResponseEntity<ClienteDTO> atualizar(@PathVariable Long id, @RequestBody ClienteDTO clienteDTO) {
        try {
            Cidade cidade = cidadeService.findById(clienteDTO.getCidadeId());
            Cliente cliente = clienteDTO.toEntity(cidade);
            cliente.setId(id);
            cliente = clienteService.save(cliente);
            return ResponseEntity.ok(ClienteDTO.fromEntity(cliente));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um cliente")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        clienteService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
} 