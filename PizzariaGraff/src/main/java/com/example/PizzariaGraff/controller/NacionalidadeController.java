package com.example.PizzariaGraff.controller;

import com.example.PizzariaGraff.dto.PaisDTO;
import com.example.PizzariaGraff.service.NacionalidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/nacionalidades")
@CrossOrigin(origins = "*")
public class NacionalidadeController {

    private final NacionalidadeService nacionalidadeService;

    @Autowired
    public NacionalidadeController(NacionalidadeService nacionalidadeService) {
        this.nacionalidadeService = nacionalidadeService;
    }

    /**
     * Lista todas as nacionalidades disponíveis
     */
    @GetMapping
    public ResponseEntity<List<PaisDTO>> getAllNacionalidades() {
        try {
            List<PaisDTO> nacionalidades = nacionalidadeService.findAllNacionalidades();
            return ResponseEntity.ok(nacionalidades);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Busca nacionalidade por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaisDTO> getNacionalidadeById(@PathVariable Long id) {
        try {
            Optional<PaisDTO> nacionalidade = nacionalidadeService.findNacionalidadeById(id);
            return nacionalidade.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Busca nacionalidade por nome
     */
    @GetMapping("/buscar")
    public ResponseEntity<PaisDTO> getNacionalidadeByNome(@RequestParam String nome) {
        try {
            Optional<PaisDTO> nacionalidade = nacionalidadeService.findByNacionalidade(nome);
            return nacionalidade.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
} 