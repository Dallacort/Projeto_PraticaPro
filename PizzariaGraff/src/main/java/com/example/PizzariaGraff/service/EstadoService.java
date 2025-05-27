package com.example.PizzariaGraff.service;

import com.example.PizzariaGraff.model.Estado;
import com.example.PizzariaGraff.repository.EstadoRepository;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EstadoService {
    
    private final EstadoRepository estadoRepository;
    
    public EstadoService(EstadoRepository estadoRepository) {
        this.estadoRepository = estadoRepository;
    }
    
    public List<Estado> findAll() {
        return estadoRepository.findAll();
    }
    
    public Estado findById(Long id) {
        return estadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estado não encontrado com o ID: " + id));
    }
    
    public List<Estado> findByPaisId(String paisId) {
        return estadoRepository.findByPaisId(paisId);
    }
    
    public Estado save(Estado estado) {
        return estadoRepository.save(estado);
    }
    
    public void deleteById(Long id) {
        estadoRepository.deleteById(id);
    }
    
    public Map<String, Object> verificarEstrutura() {
        Map<String, Object> resultado = new HashMap<>();
        List<Map<String, Object>> colunas = new ArrayList<>();
        
        try {
            // Verificar estrutura da tabela
            Connection conn = estadoRepository.getConnection();
            DatabaseMetaData metaData = conn.getMetaData();
            
            // Verificar se a tabela existe
            ResultSet rsTabela = metaData.getTables(null, null, "estado", null);
            boolean tabelaExiste = rsTabela.next();
            resultado.put("tabela_existe", tabelaExiste);
            
            if (tabelaExiste) {
                // Listar colunas
                ResultSet rsColunas = metaData.getColumns(null, null, "estado", null);
                while (rsColunas.next()) {
                    Map<String, Object> coluna = new HashMap<>();
                    coluna.put("nome", rsColunas.getString("COLUMN_NAME"));
                    coluna.put("tipo", rsColunas.getString("TYPE_NAME"));
                    coluna.put("tamanho", rsColunas.getInt("COLUMN_SIZE"));
                    coluna.put("nullable", rsColunas.getBoolean("IS_NULLABLE"));
                    colunas.add(coluna);
                }
                resultado.put("colunas", colunas);
                
                // Verificar chaves estrangeiras
                List<Map<String, Object>> fks = new ArrayList<>();
                ResultSet rsFks = metaData.getImportedKeys(null, null, "estado");
                while (rsFks.next()) {
                    Map<String, Object> fk = new HashMap<>();
                    fk.put("coluna", rsFks.getString("FKCOLUMN_NAME"));
                    fk.put("tabela_referenciada", rsFks.getString("PKTABLE_NAME"));
                    fk.put("coluna_referenciada", rsFks.getString("PKCOLUMN_NAME"));
                    fks.add(fk);
                }
                resultado.put("foreign_keys", fks);
            }
            
            conn.close();
            resultado.put("status", "OK");
        } catch (SQLException e) {
            e.printStackTrace();
            resultado.put("status", "ERRO");
            resultado.put("mensagem", e.getMessage());
        }
        
        return resultado;
    }
} 