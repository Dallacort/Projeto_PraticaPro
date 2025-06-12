package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.FuncaoFuncionario;
import com.example.PizzariaGraff.repository.FuncaoFuncionarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FuncaoFuncionarioService {
    
    private final FuncaoFuncionarioRepository funcaoFuncionarioRepository;
    
    public FuncaoFuncionarioService(FuncaoFuncionarioRepository funcaoFuncionarioRepository) {
        this.funcaoFuncionarioRepository = funcaoFuncionarioRepository;
    }
    
    public List<FuncaoFuncionario> findAll() {
        return funcaoFuncionarioRepository.findAll();
    }
    
    public List<FuncaoFuncionario> findAllAtivos() {
        return funcaoFuncionarioRepository.findByAtivo(true);
    }
    
    public FuncaoFuncionario findById(Long id) {
        return funcaoFuncionarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Função de funcionário não encontrada com o ID: " + id));
    }
    
    public FuncaoFuncionario save(FuncaoFuncionario funcao) {
        try {
            System.out.println("=== SERVICE SAVE DEBUG ===");
            System.out.println("Dados recebidos no service:");
            System.out.println("ID: " + funcao.getId());
            System.out.println("FuncaoFuncionario: " + funcao.getFuncaoFuncionario());
            System.out.println("RequerCNH: " + funcao.getRequerCNH());
            System.out.println("CargaHoraria: " + funcao.getCargaHoraria());
            System.out.println("Descricao: " + funcao.getDescricao());
            System.out.println("Observacao: " + funcao.getObservacao());
            System.out.println("SalarioBase: " + funcao.getSalarioBase());
            System.out.println("Ativo: " + funcao.getAtivo());
            
            // VALIDAÇÃO COMENTADA TEMPORARIAMENTE PARA DIAGNÓSTICO
            /*
            // Validações básicas antes de salvar
            // Pelo menos um dos campos principais deve estar preenchido
            if ((funcao.getFuncaoFuncionario() == null || funcao.getFuncaoFuncionario().trim().isEmpty()) &&
                (funcao.getDescricao() == null || funcao.getDescricao().trim().isEmpty())) {
                throw new RuntimeException("Nome da função ou descrição é obrigatório");
            }
            */
            
            System.out.println("Chamando repository.save...");
            FuncaoFuncionario saved = funcaoFuncionarioRepository.save(funcao);
            System.out.println("Repository.save executado com sucesso!");
            
            System.out.println("=== DADOS SALVOS ===");
            System.out.println("ID: " + saved.getId());
            System.out.println("FuncaoFuncionario: " + saved.getFuncaoFuncionario());
            System.out.println("RequerCNH: " + saved.getRequerCNH());
            System.out.println("CargaHoraria: " + saved.getCargaHoraria());
            System.out.println("Descricao: " + saved.getDescricao());
            System.out.println("Observacao: " + saved.getObservacao());
            System.out.println("SalarioBase: " + saved.getSalarioBase());
            System.out.println("Ativo: " + saved.getAtivo());
            System.out.println("===================");
            
            return saved;
            
        } catch (Exception e) {
            System.err.println("ERRO NO SERVICE SAVE:");
            System.err.println("Tipo: " + e.getClass().getSimpleName());
            System.err.println("Mensagem: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public void deleteById(Long id) {
        funcaoFuncionarioRepository.deleteById(id);
    }
} 