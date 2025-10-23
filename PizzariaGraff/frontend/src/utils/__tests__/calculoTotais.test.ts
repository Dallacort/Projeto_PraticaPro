// Teste para verificar cálculo de totais com poucos itens

describe('Cálculo de Totais - Cenários com 1-2 itens', () => {
  it('deve calcular corretamente com 1 item', () => {
    const produtos = [
      {
        produtoId: 1,
        produtoNome: 'Produto Teste',
        quantidade: 2,
        valorUnitario: 10.50,
        valorDesconto: 0,
        valorTotal: 21.00
      }
    ];

    const totalProdutos = produtos.reduce((sum, p) => sum + (p.valorTotal || 0), 0);
    const frete = 5.00;
    const seguro = 0;
    const outras = 0;
    const total = totalProdutos + frete + seguro + outras;

    expect(totalProdutos).toBe(21.00);
    expect(total).toBe(26.00);
  });

  it('deve calcular corretamente com 2 itens', () => {
    const produtos = [
      {
        produtoId: 1,
        produtoNome: 'Produto 1',
        quantidade: 1,
        valorUnitario: 15.00,
        valorDesconto: 0,
        valorTotal: 15.00
      },
      {
        produtoId: 2,
        produtoNome: 'Produto 2',
        quantidade: 2,
        valorUnitario: 8.50,
        valorDesconto: 1.00,
        valorTotal: 16.00
      }
    ];

    const totalProdutos = produtos.reduce((sum, p) => sum + (p.valorTotal || 0), 0);
    const frete = 3.00;
    const seguro = 2.00;
    const outras = 1.00;
    const total = totalProdutos + frete + seguro + outras;

    expect(totalProdutos).toBe(31.00);
    expect(total).toBe(37.00);
  });

  it('deve lidar com valores zero corretamente', () => {
    const produtos = [
      {
        produtoId: 1,
        produtoId: 1,
        produtoNome: 'Produto Gratuito',
        quantidade: 1,
        valorUnitario: 0,
        valorDesconto: 0,
        valorTotal: 0
      }
    ];

    const totalProdutos = produtos.reduce((sum, p) => sum + (p.valorTotal || 0), 0);
    const frete = 0;
    const seguro = 0;
    const outras = 0;
    const total = totalProdutos + frete + seguro + outras;

    expect(totalProdutos).toBe(0);
    expect(total).toBe(0);
  });
});

