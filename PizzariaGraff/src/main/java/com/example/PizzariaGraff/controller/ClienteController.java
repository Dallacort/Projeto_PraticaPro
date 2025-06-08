package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.ClienteDTO;
import com.example.PizzariaGraff.model.Cidade;
import com.example.PizzariaGraff.model.Cliente;
import com.example.PizzariaGraff.service.CidadeService;
import com.example.PizzariaGraff.service.ClienteService;
import com.example.PizzariaGraff.util.CpfCnpjValidator;
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

    /**
     * Valida os dados do cliente
     * @param clienteDTO Dados do cliente a serem validados
     * @return String com erro ou null se válido
     */
    private String validarDadosCliente(ClienteDTO clienteDTO) {
        // Validação de nome obrigatório
        if (clienteDTO.getCliente() == null || clienteDTO.getCliente().trim().isEmpty()) {
            return "Nome do cliente é obrigatório";
        }

        // Verificar se é brasileiro (nacionalidade Brasil tem ID 1)
        boolean isBrasileiro = clienteDTO.getNacionalidadeId() != null && clienteDTO.getNacionalidadeId() == 1;
        
        // Validação de CPF/CNPJ apenas para brasileiros
        String cpfCpnj = clienteDTO.getCpfCpnj();
        if (isBrasileiro) {
            // Para brasileiros, CPF/CNPJ é obrigatório e deve ser válido
            if (cpfCpnj == null || cpfCpnj.trim().isEmpty()) {
                return "CPF/CNPJ é obrigatório para brasileiros";
            }
            
            if (!CpfCnpjValidator.isValidCpfOrCnpj(cpfCpnj)) {
                String tipo = CpfCnpjValidator.getDocumentType(cpfCpnj);
                if ("INVÁLIDO".equals(tipo)) {
                    String limpo = cpfCpnj.replaceAll("[^\\d]", "");
                    if (limpo.length() == 11) {
                        return "CPF inválido";
                    } else if (limpo.length() == 14) {
                        return "CNPJ inválido";
                    } else {
                        return "CPF/CNPJ deve ter 11 ou 14 dígitos";
                    }
                }
                return tipo + " inválido";
            }

            // Verificar consistência com o tipo (1=PF, 2=PJ)
            String limpo = cpfCpnj.replaceAll("[^\\d]", "");
            if (clienteDTO.getTipo() == 1 && limpo.length() != 11) {
                return "Pessoa Física deve ter CPF (11 dígitos)";
            }
            if (clienteDTO.getTipo() == 2 && limpo.length() != 14) {
                return "Pessoa Jurídica deve ter CNPJ (14 dígitos)";
            }
        }
        // Para não brasileiros, CPF/CNPJ é opcional e não é validado

        // Validação de cidade obrigatória
        if (clienteDTO.getCidadeId() == null) {
            return "Cidade é obrigatória";
        }

        // Validação de email
        String email = clienteDTO.getEmail();
        if (email != null && !email.trim().isEmpty()) {
            if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                return "Email inválido";
            }
        }

        return null; // Válido
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

    @GetMapping("/buscar/{nome}")
    @Operation(summary = "Busca clientes por nome")
    public ResponseEntity<List<ClienteDTO>> buscarPorNome(@PathVariable String nome) {
        List<Cliente> clientes = clienteService.findByNomeContaining(nome);
        List<ClienteDTO> clientesDTO = clientes.stream()
                .map(ClienteDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(clientesDTO);
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo cliente")
    public ResponseEntity<?> criar(@RequestBody ClienteDTO clienteDTO) {
        try {
            System.out.println("=== POST CLIENTE DEBUG ===");
            System.out.println("DTO recebido: " + clienteDTO);
            
            // Validação dupla dos dados
            String erro = validarDadosCliente(clienteDTO);
            if (erro != null) {
                System.err.println("Erro de validação: " + erro);
                return ResponseEntity.badRequest().body(erro);
            }
            
            Cliente cliente = clienteDTO.toEntity();
            cliente = clienteService.save(cliente);
            System.out.println("Cliente criado com sucesso: " + cliente.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(new ClienteDTO(cliente));
        } catch (RuntimeException e) {
            System.err.println("Erro no POST: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um cliente")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody ClienteDTO clienteDTO) {
        try {
            System.out.println("=== PUT CLIENTE DEBUG ===");
            System.out.println("ID recebido: " + id);
            System.out.println("DTO recebido: " + clienteDTO);
            System.out.println("JSON completo: " + clienteDTO.toString());
            
            // Validação dupla dos dados
            String erro = validarDadosCliente(clienteDTO);
            if (erro != null) {
                System.err.println("Erro de validação: " + erro);
                return ResponseEntity.badRequest().body(erro);
            }
            
            // Verificar se o cliente existe
            Cliente clienteExistente = clienteService.findById(id);
            System.out.println("Cliente existente encontrado: " + clienteExistente.getId());
            
            // Converter DTO para Entity
            Cliente cliente = clienteDTO.toEntity();
            cliente.setId(id);
            
            System.out.println("Entity criada: " + cliente);
            System.out.println("Ativo: " + cliente.getAtivo());
            System.out.println("CidadeId: " + cliente.getCidadeId());
            System.out.println("CondicaoPagamentoId: " + cliente.getCondicaoPagamentoId());
            System.out.println("DataNascimento: " + cliente.getDataNascimento());
            
            // Salvar
            cliente = clienteService.save(cliente);
            System.out.println("Cliente salvo com sucesso: " + cliente.getId());
            
            return ResponseEntity.ok(new ClienteDTO(cliente));
        } catch (IllegalArgumentException e) {
            System.err.println("Erro de validação no PUT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erro de validação: " + e.getMessage());
        } catch (RuntimeException e) {
            System.err.println("Erro no PUT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Erro geral no PUT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro interno: " + e.getMessage());
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