package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Categoria;
import com.example.PizzariaGraff.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    public List<Categoria> listarAtivos() {
        return categoriaRepository.findByAtivoTrue();
    }

    public Optional<Categoria> buscarPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    public List<Categoria> buscarPorNome(String nome) {
        return categoriaRepository.findByCategoria(nome);
    }

    public Categoria salvar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public Categoria atualizar(Long id, Categoria categoriaAtualizada) {
        Optional<Categoria> categoriaExistente = categoriaRepository.findById(id);
        if (categoriaExistente.isPresent()) {
            categoriaAtualizada.setId(id);
            return categoriaRepository.save(categoriaAtualizada);
        } else {
            throw new RuntimeException("Categoria não encontrada com ID: " + id);
        }
    }

    public void deletar(Long id) {
        Optional<Categoria> categoria = categoriaRepository.findById(id);
        if (categoria.isPresent()) {
            categoriaRepository.deleteById(id);
        } else {
            throw new RuntimeException("Categoria não encontrada com ID: " + id);
        }
    }
} 