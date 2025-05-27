# Pizzaria Graff

Sistema de Gerenciamento de Pizzaria desenvolvido com Spring Boot.

## Requisitos

- Java 17
- Maven
- MariaDB
- Node.js (para o frontend)

## Configuração do Banco de Dados

1. Instale o MariaDB
2. Crie um banco de dados chamado `pizzaria_graff`
3. Configure as credenciais no arquivo `application.properties`

## Configuração do Projeto

1. Clone o repositório
2. Navegue até a pasta do projeto
3. Instale as dependências:
```bash
mvn clean install
```

## Executando o Projeto

1. Execute o comando:
```bash
mvn spring:boot run
```

2. Acesse a aplicação em `http://localhost:8081`

## Endpoints da API

### Clientes

- `GET /clientes` - Lista todos os clientes
- `GET /clientes/{id}` - Busca um cliente por ID
- `POST /clientes` - Cadastra um novo cliente
- `PUT /clientes/{id}` - Atualiza um cliente
- `DELETE /clientes/{id}` - Remove um cliente

### Cidades

- `GET /cidades` - Lista todas as cidades
- `GET /cidades/{id}` - Busca uma cidade por ID
- `POST /cidades` - Cadastra uma nova cidade
- `PUT /cidades/{id}` - Atualiza uma cidade
- `DELETE /cidades/{id}` - Remove uma cidade

### Estados

- `GET /estados` - Lista todos os estados
- `GET /estados/{id}` - Busca um estado por ID
- `POST /estados` - Cadastra um novo estado
- `PUT /estados/{id}` - Atualiza um estado
- `DELETE /estados/{id}` - Remove um estado

### Países

- `GET /paises` - Lista todos os países
- `GET /paises/{id}` - Busca um país por ID
- `POST /paises` - Cadastra um novo país
- `PUT /paises/{id}` - Atualiza um país
- `DELETE /paises/{id}` - Remove um país

## Documentação da API

A documentação da API está disponível em `http://localhost:8081/swagger-ui.html` após iniciar a aplicação.

## Tecnologias Utilizadas

- Spring Boot 3.4.4
- Spring JDBC
- MariaDB
- Maven
- Lombok
- Swagger/OpenAPI 