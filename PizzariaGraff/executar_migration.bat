@echo off
echo Executando migration da tabela cliente...
echo.

REM Tenta encontrar o psql em locais comuns
set PSQL_PATH=""
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set PSQL_PATH="C:\Program Files\PostgreSQL\16\bin\psql.exe"
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" set PSQL_PATH="C:\Program Files\PostgreSQL\15\bin\psql.exe"
if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" set PSQL_PATH="C:\Program Files\PostgreSQL\14\bin\psql.exe"

if %PSQL_PATH%=="" (
    echo ERRO: PostgreSQL nao encontrado. Instale o PostgreSQL ou ajuste o PATH.
    pause
    exit /b 1
)

echo Usando PostgreSQL em: %PSQL_PATH%
echo.

REM Executa o script SQL
%PSQL_PATH% -U postgres -d pizzariagraff -f migration_cliente_cleanup.sql

if %ERRORLEVEL%==0 (
    echo.
    echo Migration executada com sucesso!
) else (
    echo.
    echo ERRO ao executar migration!
)

pause 