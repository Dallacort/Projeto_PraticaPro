package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Marca;
import com.example.PizzariaGraff.repository.MarcaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MarcaService {

    private final MarcaRepository marcaRepository;

    public MarcaService(MarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    }

    public List<Marca> listarTodas() {
        return marcaRepository.findAll();
    }

    public Optional<Marca> buscarPorId(Long id) {
        return marcaRepository.findById(id);
    }

    public List<Marca> buscarPorNome(String nome) {
        return marcaRepository.findByMarca(nome);
    }

    public Marca salvar(Marca marca) {
        return marcaRepository.save(marca);
    }

    public Marca atualizar(Long id, Marca marcaAtualizada) {
        Optional<Marca> marcaExistente = marcaRepository.findById(id);
        if (marcaExistente.isPresent()) {
            marcaAtualizada.setId(id);
            return marcaRepository.save(marcaAtualizada);
        } else {
            throw new RuntimeException("Marca não encontrada com ID: " + id);
        }
    }

    public void deletar(Long id) {
        Optional<Marca> marca = marcaRepository.findById(id);
        if (marca.isPresent()) {
            marcaRepository.deleteById(id);
        } else {
            throw new RuntimeException("Marca não encontrada com ID: " + id);
        }
    }
} 