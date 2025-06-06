#!/bin/bash

# Script de teste para Condição de Pagamento - Correção de Campos
# Use estes comandos curl para testar se os campos estão sendo salvos corretamente

# Configure a URL base do seu backend
BASE_URL="http://localhost:8080"

echo "=== TESTE DE CONDIÇÃO DE PAGAMENTO - CORREÇÃO DE CAMPOS ==="
echo ""
echo "Configure a variável BASE_URL para a URL do seu backend"
echo "Atualmente configurada para: $BASE_URL"
echo ""

echo "1. TESTE BÁSICO - À Vista com 5% Desconto"
echo "================================================================"
curl -X POST "$BASE_URL/condicoes-pagamento" \
  -H "Content-Type: application/json" \
  -d '{
    "condicaoPagamento": "À Vista com 5% Desconto",
    "numeroParcelas": 1,
    "parcelas": 1,
    "ativo": true,
    "diasPrimeiraParcela": 0,
    "diasEntreParcelas": 0,
    "percentualJuros": 0.0,
    "percentualMulta": 0.0,
    "percentualDesconto": 5.0,
    "parcelasCondicaoPagamento": [
      {
        "numero": 1,
        "dias": 0,
        "percentual": 100.0,
        "formaPagamentoId": 5
      }
    ]
  }'
echo ""
echo ""

echo "2. TESTE PARCELADO - 2x com 1.5% Juros"
echo "================================================================"
curl -X POST "$BASE_URL/condicoes-pagamento" \
  -H "Content-Type: application/json" \
  -d '{
    "condicaoPagamento": "2x com 1.5% Juros",
    "numeroParcelas": 2,
    "parcelas": 2,
    "ativo": true,
    "diasPrimeiraParcela": 30,
    "diasEntreParcelas": 30,
    "percentualJuros": 1.5,
    "percentualMulta": 2.0,
    "percentualDesconto": 0.0,
    "parcelasCondicaoPagamento": [
      {
        "numero": 1,
        "dias": 30,
        "percentual": 50.0,
        "formaPagamentoId": 2
      },
      {
        "numero": 2,
        "dias": 60,
        "percentual": 50.0,
        "formaPagamentoId": 2
      }
    ]
  }'
echo ""
echo ""

echo "3. TESTE COMPLEXO - 3x Especial 15/30/45 dias"
echo "================================================================"
curl -X POST "$BASE_URL/condicoes-pagamento" \
  -H "Content-Type: application/json" \
  -d '{
    "condicaoPagamento": "3x Especial - 15/30/45 dias",
    "numeroParcelas": 3,
    "parcelas": 3,
    "ativo": true,
    "diasPrimeiraParcela": 15,
    "diasEntreParcelas": 15,
    "percentualJuros": 2.5,
    "percentualMulta": 3.0,
    "percentualDesconto": 0.0,
    "parcelasCondicaoPagamento": [
      {
        "numero": 1,
        "dias": 15,
        "percentual": 40.0,
        "formaPagamentoId": 4
      },
      {
        "numero": 2,
        "dias": 30,
        "percentual": 30.0,
        "formaPagamentoId": 2
      },
      {
        "numero": 3,
        "dias": 45,
        "percentual": 30.0,
        "formaPagamentoId": 2
      }
    ]
  }'
echo ""
echo ""

echo "4. TESTE ENTRADA + PARCELAS - Com 3% Desconto"
echo "================================================================"
curl -X POST "$BASE_URL/condicoes-pagamento" \
  -H "Content-Type: application/json" \
  -d '{
    "condicaoPagamento": "Entrada + 2x - Desconto 3%",
    "numeroParcelas": 3,
    "parcelas": 3,
    "ativo": true,
    "diasPrimeiraParcela": 0,
    "diasEntreParcelas": 30,
    "percentualJuros": 0.0,
    "percentualMulta": 1.0,
    "percentualDesconto": 3.0,
    "parcelasCondicaoPagamento": [
      {
        "numero": 1,
        "dias": 0,
        "percentual": 50.0,
        "formaPagamentoId": 5
      },
      {
        "numero": 2,
        "dias": 30,
        "percentual": 25.0,
        "formaPagamentoId": 2
      },
      {
        "numero": 3,
        "dias": 60,
        "percentual": 25.0,
        "formaPagamentoId": 2
      }
    ]
  }'
echo ""
echo ""

echo "5. VERIFICAÇÃO - Listar todas as condições de pagamento"
echo "================================================================"
echo "Verificando se os campos foram salvos corretamente..."
curl -X GET "$BASE_URL/condicoes-pagamento" \
  -H "Content-Type: application/json"
echo ""
echo ""

echo "=== COMANDOS PARA WINDOWS POWERSHELL ==="
echo ""
echo "No PowerShell do Windows, use Invoke-RestMethod:"
echo ""
echo '# Teste 1 - À Vista com Desconto'
echo 'Invoke-RestMethod -Uri "http://localhost:8080/condicoes-pagamento" -Method POST -ContentType "application/json" -Body @"'
echo '{'
echo '  "condicaoPagamento": "À Vista com 5% Desconto",'
echo '  "numeroParcelas": 1,'
echo '  "parcelas": 1,'
echo '  "ativo": true,'
echo '  "diasPrimeiraParcela": 0,'
echo '  "diasEntreParcelas": 0,'
echo '  "percentualJuros": 0.0,'
echo '  "percentualMulta": 0.0,'
echo '  "percentualDesconto": 5.0,'
echo '  "parcelasCondicaoPagamento": ['
echo '    {'
echo '      "numero": 1,'
echo '      "dias": 0,'
echo '      "percentual": 100.0,'
echo '      "formaPagamentoId": 5'
echo '    }'
echo '  ]'
echo '}'
echo '"@'
echo ""
echo '# Verificar resultados'
echo 'Invoke-RestMethod -Uri "http://localhost:8080/condicoes-pagamento" -Method GET'
echo ""

echo "=== PONTOS DE VERIFICAÇÃO ==="
echo ""
echo "Após executar os testes, verifique se:"
echo "✓ diasPrimeiraParcela não está mais sempre 0"
echo "✓ diasEntreParcelas não está mais sempre 0" 
echo "✓ percentualJuros não está mais sempre 0.0"
echo "✓ percentualMulta não está mais sempre 0.0"
echo "✓ percentualDesconto não está mais sempre 0.0"
echo ""
echo "Se algum campo ainda estiver zerado, há problema no backend!" 