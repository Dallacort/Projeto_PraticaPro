package com.example.PizzariaGraff.repository;

import java.sql.Connection;
import java.sql.SQLException;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

/**
 * Classe responsável por gerenciar conexões com o banco de dados.
 */
public class DatabaseConnection {
    
    private final String jdbcUrl;
    private final String username;
    private final String password;
    private final HikariDataSource dataSource;

    public DatabaseConnection(String jdbcUrl, String username, String password) {
        this.jdbcUrl = jdbcUrl;
        this.username = username;
        this.password = password;
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        
        this.dataSource = new HikariDataSource(config);
    }

    /**
     * Obtém uma conexão com o banco de dados.
     * 
     * @return A conexão com o banco de dados.
     * @throws SQLException Se ocorrer um erro ao conectar ao banco de dados.
     */
    public Connection getConnection() throws SQLException {
        try {
            System.out.println("Obtendo conexão do pool. URL: " + jdbcUrl);
            Connection conn = dataSource.getConnection();
            System.out.println("Conexão obtida com sucesso.");
            return conn;
        } catch (SQLException e) {
            System.err.println("ERRO AO CONECTAR AO BANCO: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Fecha a conexão com o banco de dados.
     * 
     * @param connection A conexão a ser fechada.
     */
    public void closeConnection(Connection connection) {
        if (connection != null) {
            try {
                connection.close();
            } catch (SQLException e) {
                System.err.println("Erro ao fechar conexão: " + e.getMessage());
            }
        }
    }
    
    /**
     * Fecha o pool de conexões ao encerrar a aplicação.
     */
    public void close() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
        }
    }
} 