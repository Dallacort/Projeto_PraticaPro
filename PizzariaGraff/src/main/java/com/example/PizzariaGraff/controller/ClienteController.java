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
                .map(ClienteDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(clientesDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um cliente por ID")
    public ResponseEntity<ClienteDTO> buscarPorId(@PathVariable Long id) {
        try {
            Cliente cliente = clienteService.findById(id);
            return ResponseEntity.ok(new ClienteDTO(cliente));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/cpfcpnj/{cpfCpnj}")
    @Operation(summary = "Busca um cliente por CPF/CNPJ")
    public ResponseEntity<ClienteDTO> buscarPorCpfCpnj(@PathVariable String cpfCpnj) {
        try {
            Cliente cliente = clienteService.findByCpfCpnj(cpfCpnj);
            return ResponseEntity.ok(new ClienteDTO(cliente));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/cidade/{cidadeId}")
    @Operation(summary = "Busca clientes por cidade")
    public ResponseEntity<List<ClienteDTO>> buscarPorCidade(@PathVariable Long cidadeId) {
        List<Cliente> clientes = clienteService.findByCidadeId(cidadeId);
        List<ClienteDTO> clientesDTO = clientes.stream()
                .map(ClienteDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(clientesDTO);
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo cliente")
    public ResponseEntity<ClienteDTO> criar(@RequestBody ClienteDTO clienteDTO) {
        try {
            Cliente cliente = clienteDTO.toEntity();
            cliente = clienteService.save(cliente);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ClienteDTO(cliente));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um cliente")
    public ResponseEntity<ClienteDTO> atualizar(@PathVariable Long id, @RequestBody ClienteDTO clienteDTO) {
        try {
            Cliente cliente = clienteDTO.toEntity();
            cliente.setId(id);
            cliente = clienteService.save(cliente);
            return ResponseEntity.ok(new ClienteDTO(cliente));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um cliente")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        try {
            clienteService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 