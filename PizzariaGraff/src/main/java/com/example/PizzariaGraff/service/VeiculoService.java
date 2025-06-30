package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.dto.VeiculoDTO;
import com.example.PizzariaGraff.model.Veiculo;
import com.example.PizzariaGraff.repository.TransportadoraRepository;
import com.example.PizzariaGraff.repository.VeiculoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VeiculoService {

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Autowired
    private TransportadoraRepository transportadoraRepository;

    public List<VeiculoDTO> findAll() {
        return veiculoRepository.findAll().stream()
                .map(VeiculoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<VeiculoDTO> findAllAtivos() {
        return veiculoRepository.findByAtivoTrue().stream()
                .map(VeiculoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public VeiculoDTO findById(Long id) {
        return veiculoRepository.findById(id)
                .map(VeiculoDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado"));
    }

    public List<VeiculoDTO> findByTransportadora(Long transportadoraId) {
        return veiculoRepository.findVeiculosByTransportadoraId(transportadoraId).stream()
                .map(VeiculoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public VeiculoDTO save(VeiculoDTO dto) {
        if (dto.getId() == null && veiculoRepository.existsByPlaca(dto.getPlaca())) {
            throw new RuntimeException("Placa já cadastrada");
        }
        if (dto.getId() != null && veiculoRepository.existsByPlacaAndIdNot(dto.getPlaca(), dto.getId())) {
            throw new RuntimeException("Placa já cadastrada para outro veículo");
        }

        Veiculo veiculo = dto.toEntity();
        veiculo = veiculoRepository.save(veiculo);
        return VeiculoDTO.fromEntity(veiculo);
    }

    public void deleteById(Long id) {
        if (!veiculoRepository.findById(id).isPresent()) {
            throw new RuntimeException("Veículo não encontrado");
        }
        veiculoRepository.deleteById(id);
    }
} 