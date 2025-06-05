-- Renomear coluna para coincidir com o trigger
ALTER TABLE produto CHANGE data_alteracao ultima_modificacao timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp();

-- Verificar se funcionou
DESCRIBE produto; 