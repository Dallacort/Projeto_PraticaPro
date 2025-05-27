package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.ItemNfe;
import com.example.PizzariaGraff.repository.ItemNfeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemNfeService {
    
    private final ItemNfeRepository itemNfeRepository;
    
    public ItemNfeService(ItemNfeRepository itemNfeRepository) {
        this.itemNfeRepository = itemNfeRepository;
    }
    
    public List<ItemNfe> findAll() {
        return itemNfeRepository.findAll();
    }
    
    public ItemNfe findById(String id) {
        return itemNfeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item de nota fiscal não encontrado com o ID: " + id));
    }
    
    public List<ItemNfe> findByNfeChaveAcesso(String chaveAcesso) {
        return itemNfeRepository.findByNfeChaveAcesso(chaveAcesso);
    }
    
    public ItemNfe save(ItemNfe itemNfe) {
        return itemNfeRepository.save(itemNfe);
    }
    
    public void deleteById(String id) {
        itemNfeRepository.deleteById(id);
    }
} 