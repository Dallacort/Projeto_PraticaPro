package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.dto.PaisDTO;
import com.example.PizzariaGraff.model.Pais;
import com.example.PizzariaGraff.repository.PaisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NacionalidadeService {

    private final PaisRepository paisRepository;

    @Autowired
    public NacionalidadeService(PaisRepository paisRepository) {
        this.paisRepository = paisRepository;
    }

    /**
     * Lista todas as nacionalidades (países) ativas
     */
    public List<PaisDTO> findAllNacionalidades() {
        return paisRepository.findAllAtivos().stream()
                .filter(pais -> pais.getNacionalidade() != null && !pais.getNacionalidade().trim().isEmpty())
                .map(PaisDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Busca nacionalidade por ID
     */
    public Optional<PaisDTO> findNacionalidadeById(Long id) {
        return paisRepository.findById(id)
                .filter(pais -> pais.getNacionalidade() != null && !pais.getNacionalidade().trim().isEmpty())
                .map(PaisDTO::fromEntity);
    }

    /**
     * Busca nacionalidade por nome
     */
    public Optional<PaisDTO> findByNacionalidade(String nacionalidade) {
        return paisRepository.findAllAtivos().stream()
                .filter(pais -> nacionalidade.equalsIgnoreCase(pais.getNacionalidade()))
                .findFirst()
                .map(PaisDTO::fromEntity);
    }

    /**
     * Busca ou cria uma nacionalidade
     * Se não existir, cria um novo país com a nacionalidade informada
     */
    public PaisDTO findOrCreateNacionalidade(String nacionalidade) {
        // Primeiro tenta encontrar
        Optional<PaisDTO> existing = findByNacionalidade(nacionalidade);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Se não encontrar, cria um novo país
        Pais novoPais = new Pais();
        novoPais.setNome(nacionalidade.replace("a", "").replace("o", "")); // Remove sufixos de gênero
        novoPais.setNacionalidade(nacionalidade);
        novoPais.setSigla(nacionalidade.substring(0, Math.min(2, nacionalidade.length())).toUpperCase());
        novoPais.setAtivo(true);

        Pais savedPais = paisRepository.save(novoPais);
        return PaisDTO.fromEntity(savedPais);
    }
} 