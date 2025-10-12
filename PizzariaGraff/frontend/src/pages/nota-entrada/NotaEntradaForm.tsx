import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NotaEntrada, ProdutoNota, Fornecedor, Produto, CondicaoPagamento } from '../../types';
import { createNotaEntrada, getNotaEntrada, updateNotaEntrada } from '../../services/notaEntradaService';
import { getFornecedores } from '../../services/fornecedorService';
import { getProdutos } from '../../services/produtoService';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';
import { FaSpinner, FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import FormField from '../../components/FormField';

interface NotaEntradaFormData {
  numero: string;
  modelo: string;
  serie: string;
  fornecedorId: string;
  dataEmissao: string;
  dataChegada: string;
  tipoFrete: string;
  valorFrete: string;
  valorSeguro: string;
  outrasDespesas: string;
  condicaoPagamentoId: string;
  observacoes: string;
  situacao: string;
}

interface ProdutoTemp {
  produtoId: number;
  produtoNome?: string;
  produtoCodigo?: string;
  quantidade: string;
  valorUnitario: string;
  valorDesconto: string;
  percentualDesconto: string;
  valorTotal: number;
}

const NotaEntradaForm: React.FC = () => {
  const { numero, modelo, serie, fornecedorId } = useParams<{ numero: string; modelo: string; serie: string; fornecedorId: string }>();
  const navigate = useNavigate();
  const isNew = !numero;

  const [formData, setFormData] = useState<NotaEntradaFormData>({
    numero: '',
    modelo: '55',
    serie: '1',
    fornecedorId: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    dataChegada: new Date().toISOString().split('T')[0],
    tipoFrete: 'CIF',
    valorFrete: '0',
    valorSeguro: '0',
    outrasDespesas: '0',
    condicaoPagamentoId: '',
    observacoes: '',
    situacao: 'PENDENTE'
  });

  const [produtoTemp, setProdutoTemp] = useState<ProdutoTemp>({
    produtoId: 0,
    quantidade: '1',
    valorUnitario: '0',
    valorDesconto: '0',
    percentualDesconto: '0',
    valorTotal: 0
  });

  const [produtosNota, setProdutosNota] = useState<ProdutoNota[]>([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [condicaoPagamentoSelecionada, setCondicaoPagamentoSelecionada] = useState<CondicaoPagamento | null>(null);
  
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [condicoesPagamento, setCondicoesPagamento] = useState<CondicaoPagamento[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fornecedoresData, produtosData, condicoesData] = await Promise.all([
          getFornecedores(),
          getProdutos(),
          CondicaoPagamentoService.list()
        ]);
        
        setFornecedores(fornecedoresData);
        setProdutos(produtosData);
        setCondicoesPagamento(condicoesData);

        // Carregar nota se for edição
        if (!isNew && numero && modelo && serie && fornecedorId) {
          const notaData = await getNotaEntrada(numero, modelo, serie, parseInt(fornecedorId));
          
          setFormData({
            numero: notaData.numero,
            modelo: notaData.modelo,
            serie: notaData.serie,
            fornecedorId: String(notaData.fornecedorId),
            dataEmissao: notaData.dataEmissao,
            dataChegada: notaData.dataChegada || '',
            tipoFrete: notaData.tipoFrete,
            valorFrete: String(notaData.valorFrete || 0),
            valorSeguro: String(notaData.valorSeguro || 0),
            outrasDespesas: String(notaData.outrasDespesas || 0),
            condicaoPagamentoId: String(notaData.condicaoPagamentoId || ''),
            observacoes: notaData.observacoes || '',
            situacao: notaData.situacao || 'PENDENTE'
          });

          setProdutosNota(notaData.produtos || []);
          
          const fornecedor = fornecedoresData.find(f => f.id === notaData.fornecedorId);
          if (fornecedor) {
            setFornecedorSelecionado(fornecedor);
            if (fornecedor.condicaoPagamentoId) {
              const condicao = condicoesData.find(c => c.id === fornecedor.condicaoPagamentoId);
              if (condicao) {
                setCondicaoPagamentoSelecionada(condicao);
                setFormData(prev => ({ ...prev, condicaoPagamentoId: String(condicao.id) }));
              }
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isNew, numero, modelo, serie, fornecedorId]);

  // Atualizar condição de pagamento quando fornecedor mudar
  useEffect(() => {
    if (fornecedorSelecionado && fornecedorSelecionado.condicaoPagamentoId) {
      const condicao = condicoesPagamento.find(c => c.id === fornecedorSelecionado.condicaoPagamentoId);
      if (condicao) {
        setCondicaoPagamentoSelecionada(condicao);
        setFormData(prev => ({ ...prev, condicaoPagamentoId: String(condicao.id) }));
      }
    }
  }, [fornecedorSelecionado, condicoesPagamento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFornecedorSelect = (fornecedor: Fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setFormData(prev => ({ ...prev, fornecedorId: String(fornecedor.id) }));
    setShowFornecedorModal(false);
  };

  const handleProdutoSelect = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setProdutoTemp(prev => ({
      ...prev,
      produtoId: produto.id,
      produtoNome: produto.produto,
      produtoCodigo: produto.codigoBarras,
      valorUnitario: String(produto.valorCompra || 0)
    }));
    setShowProdutoModal(false);
  };

  const handleProdutoTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProdutoTemp(prev => {
      const updated = { ...prev, [name]: value };
      
      // Recalcular valor total
      const quantidade = parseFloat(updated.quantidade) || 0;
      const valorUnitario = parseFloat(updated.valorUnitario) || 0;
      const valorDesconto = parseFloat(updated.valorDesconto) || 0;
      
      updated.valorTotal = (quantidade * valorUnitario) - valorDesconto;
      
      return updated;
    });
  };

  const handleAdicionarProduto = () => {
    if (!produtoSelecionado) {
      alert('Selecione um produto');
      return;
    }

    if (parseFloat(produtoTemp.quantidade) <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }

    const novoProduto: ProdutoNota = {
      produtoId: produtoTemp.produtoId,
      produtoNome: produtoTemp.produtoNome,
      produtoCodigo: produtoTemp.produtoCodigo,
      sequencia: produtosNota.length + 1,
      quantidade: parseFloat(produtoTemp.quantidade),
      valorUnitario: parseFloat(produtoTemp.valorUnitario),
      valorDesconto: parseFloat(produtoTemp.valorDesconto) || 0,
      percentualDesconto: parseFloat(produtoTemp.percentualDesconto) || 0,
      valorTotal: produtoTemp.valorTotal,
      rateioFrete: 0,
      rateioSeguro: 0,
      rateioOutras: 0,
      custoPrecoFinal: produtoTemp.valorTotal
    };

    setProdutosNota(prev => [...prev, novoProduto]);
    
    // Limpar campos
    setProdutoSelecionado(null);
    setProdutoTemp({
      produtoId: 0,
      quantidade: '1',
      valorUnitario: '0',
      valorDesconto: '0',
      percentualDesconto: '0',
      valorTotal: 0
    });
  };

  const handleRemoverProduto = (index: number) => {
    setProdutosNota(prev => prev.filter((_, i) => i !== index));
  };

  const handleLimparProdutos = () => {
    if (window.confirm('Deseja realmente limpar todos os produtos?')) {
      setProdutosNota([]);
    }
  };

  const calcularTotais = () => {
    const totalProdutos = produtosNota.reduce((sum, p) => sum + p.valorTotal, 0);
    const frete = parseFloat(formData.valorFrete) || 0;
    const seguro = parseFloat(formData.valorSeguro) || 0;
    const outras = parseFloat(formData.outrasDespesas) || 0;
    const total = totalProdutos + frete + seguro + outras;

    return {
      totalProdutos,
      totalPagar: total
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fornecedorSelecionado) {
      alert('Selecione um fornecedor');
      return;
    }

    if (produtosNota.length === 0) {
      alert('Adicione pelo menos um produto');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const totais = calcularTotais();

      const notaData: Partial<NotaEntrada> = {
        numero: formData.numero,
        modelo: formData.modelo,
        serie: formData.serie,
        fornecedorId: parseInt(formData.fornecedorId),
        dataEmissao: formData.dataEmissao,
        dataChegada: formData.dataChegada || undefined,
        tipoFrete: formData.tipoFrete,
        valorProdutos: totais.totalProdutos,
        valorFrete: parseFloat(formData.valorFrete) || 0,
        valorSeguro: parseFloat(formData.valorSeguro) || 0,
        outrasDespesas: parseFloat(formData.outrasDespesas) || 0,
        valorDesconto: 0,
        valorTotal: totais.totalPagar,
        condicaoPagamentoId: formData.condicaoPagamentoId ? parseInt(formData.condicaoPagamentoId) : undefined,
        observacoes: formData.observacoes,
        situacao: formData.situacao,
        produtos: produtosNota
      };

      if (isNew) {
        await createNotaEntrada(notaData);
        alert('Nota criada com sucesso!');
      } else {
        await updateNotaEntrada(numero!, modelo!, serie!, parseInt(fornecedorId!), notaData);
        alert('Nota atualizada com sucesso!');
      }

      navigate('/notas-entrada');
    } catch (err: any) {
      console.error('Erro ao salvar nota:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao salvar nota';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const totais = calcularTotais();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <FaSpinner className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-7xl w-full mx-auto my-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">
          {isNew ? 'Cadastro Nota de Compra' : 'Editar Nota de Compra'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Dados da Nota */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Dados da Nota</h2>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            <FormField
              label="Número *"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              required
              disabled={!isNew}
              placeholder="22232"
            />
            
            <FormField
              label="Modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              placeholder="55"
            />
            
            <FormField
              label="Série"
              name="serie"
              value={formData.serie}
              onChange={handleChange}
              placeholder="1"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor *
              </label>
              <div 
                onClick={() => setShowFornecedorModal(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 h-10"
              >
                <input
                  type="text"
                  readOnly
                  value={fornecedorSelecionado ? fornecedorSelecionado.fornecedor : 'Selecione...'}
                  className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                  placeholder="Selecione..."
                />
                <FaSearch className="text-gray-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Data Emissão *"
              name="dataEmissao"
              type="date"
              value={formData.dataEmissao}
              onChange={handleChange}
              required
            />
            
            <FormField
              label="Data Chegada *"
              name="dataChegada"
              type="date"
              value={formData.dataChegada}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Produtos */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Produtos</h2>
          
          <div className="grid grid-cols-6 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cód. Produto *
              </label>
              <div 
                onClick={() => setShowProdutoModal(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 h-10"
              >
                <FaSearch className="text-gray-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produto
              </label>
              <input
                type="text"
                value={produtoSelecionado?.produto || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10"
                placeholder=""
              />
            </div>
            
            <FormField
              label="Unidade"
              name="unidade"
              value="1"
              onChange={() => {}}
              disabled
            />
            
            <FormField
              label="Quantidade *"
              name="quantidade"
              type="number"
              value={produtoTemp.quantidade}
              onChange={handleProdutoTempChange}
              placeholder="1"
              step="0.01"
            />
            
            <FormField
              label="Preço *"
              name="valorUnitario"
              type="number"
              value={produtoTemp.valorUnitario}
              onChange={handleProdutoTempChange}
              placeholder="0"
              step="0.01"
            />
            
            <FormField
              label="R$ Desconto"
              name="valorDesconto"
              type="number"
              value={produtoTemp.valorDesconto}
              onChange={handleProdutoTempChange}
              placeholder="0"
              step="0.01"
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium">
              Total: R$ {totais.totalProdutos.toFixed(2).replace('.', ',')}
            </div>
            <button
              type="button"
              onClick={handleAdicionarProduto}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              <FaPlus />
              Adicionar
            </button>
          </div>

          {/* Grid de Produtos */}
          {produtosNota.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">CODIGO</th>
                    <th className="px-3 py-2 text-left">PRODUTO</th>
                    <th className="px-3 py-2 text-left">UNIDADE</th>
                    <th className="px-3 py-2 text-right">QTD</th>
                    <th className="px-3 py-2 text-right">PREÇO UN</th>
                    <th className="px-3 py-2 text-right">DESC UN</th>
                    <th className="px-3 py-2 text-right">LIQUIDO UN</th>
                    <th className="px-3 py-2 text-right">TOTAL</th>
                    <th className="px-3 py-2 text-right">RATEIO</th>
                    <th className="px-3 py-2 text-right">CUSTO FINAL UN</th>
                    <th className="px-3 py-2 text-right">CUSTO FINAL</th>
                    <th className="px-3 py-2 text-center">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosNota.map((produto, index) => {
                    // Calcular rateio proporcional em tempo real
                    const totalProdutosNota = produtosNota.reduce((sum, p) => sum + p.valorTotal, 0);
                    const frete = parseFloat(formData.valorFrete) || 0;
                    const seguro = parseFloat(formData.valorSeguro) || 0;
                    const outras = parseFloat(formData.outrasDespesas) || 0;
                    
                    const proporcao = totalProdutosNota > 0 ? produto.valorTotal / totalProdutosNota : 0;
                    const rateioFrete = frete * proporcao;
                    const rateioSeguro = seguro * proporcao;
                    const rateioOutras = outras * proporcao;
                    const rateioTotal = rateioFrete + rateioSeguro + rateioOutras;
                    const custoFinalTotal = produto.valorTotal + rateioTotal;
                    const custoFinalUnitario = custoFinalTotal / produto.quantidade;
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{produto.sequencia}</td>
                        <td className="px-3 py-2">{produto.produtoNome}</td>
                        <td className="px-3 py-2">UN</td>
                        <td className="px-3 py-2 text-right">{produto.quantidade.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">R$ {produto.valorUnitario.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">R$ {(produto.valorDesconto || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">R$ {produto.valorUnitario.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">R$ {produto.valorTotal.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">R$ {rateioTotal.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">R$ {custoFinalUnitario.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">R$ {custoFinalTotal.toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoverProduto(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <button
                type="button"
                onClick={handleLimparProdutos}
                className="mt-2 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                <FaTrash />
                Limpar Todos os Produtos
              </button>
            </div>
          )}
        </div>

        {/* Frete e Outras Despesas */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Frete e Outras Despesas</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Frete</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoFrete"
                  value="CIF"
                  checked={formData.tipoFrete === 'CIF'}
                  onChange={handleChange}
                  className="mr-2"
                />
                CIF
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoFrete"
                  value="FOB"
                  checked={formData.tipoFrete === 'FOB'}
                  onChange={handleChange}
                  className="mr-2"
                />
                FOB
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoFrete"
                  value="SEM"
                  checked={formData.tipoFrete === 'SEM'}
                  onChange={handleChange}
                  className="mr-2"
                />
                SEM
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <FormField
              label="Valor Frete"
              name="valorFrete"
              type="number"
              value={formData.valorFrete}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
            />
            
            <FormField
              label="Valor Seguro"
              name="valorSeguro"
              type="number"
              value={formData.valorSeguro}
              onChange={handleChange}
              placeholder="100"
              step="0.01"
            />
            
            <FormField
              label="Outras Despesas"
              name="outrasDespesas"
              type="number"
              value={formData.outrasDespesas}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-lg font-semibold">
              Total Produtos: R$ {totais.totalProdutos.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-lg font-semibold text-right">
              Total a Pagar: R$ {totais.totalPagar.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>

        {/* Condição de Pagamento */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Condição de Pagamento</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField
              label="Cód. Cond. Pgto"
              name="condicaoPagamentoId"
              value={formData.condicaoPagamentoId}
              onChange={handleChange}
              disabled
            />
            
            <FormField
              label="Condição de Pagamento"
              name="condicaoPagamentoNome"
              value={condicaoPagamentoSelecionada?.condicaoPagamento || ''}
              onChange={() => {}}
              disabled
            />
          </div>

          {/* Parcelas de Pagamento */}
          {condicaoPagamentoSelecionada && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">PARCELA</th>
                    <th className="px-3 py-2 text-left">CÓD. FORMA PGTO</th>
                    <th className="px-3 py-2 text-left">FORMA DE PAGAMENTO</th>
                    <th className="px-3 py-2 text-left">DATA VENCIMENTO</th>
                    <th className="px-3 py-2 text-right">VALOR PARCELA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">PIX</td>
                    <td className="px-3 py-2">{formData.dataEmissao}</td>
                    <td className="px-3 py-2 text-right text-green-600 font-semibold">
                      R$ {totais.totalPagar.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Observação */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Observação</h2>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            placeholder="Digite observações sobre a nota..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/notas-entrada')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Sair
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                Salvando...
              </span>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </form>

      {/* Modal Fornecedor */}
      {showFornecedorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Selecionar Fornecedor</h3>
              <button
                onClick={() => setShowFornecedorModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {fornecedores.map(fornecedor => (
                <div
                  key={fornecedor.id}
                  onClick={() => handleFornecedorSelect(fornecedor)}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-semibold">{fornecedor.fornecedor}</div>
                  <div className="text-sm text-gray-600">{fornecedor.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Produto */}
      {showProdutoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Selecionar Produto</h3>
              <button
                onClick={() => setShowProdutoModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {produtos.map(produto => (
                <div
                  key={produto.id}
                  onClick={() => handleProdutoSelect(produto)}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-semibold">{produto.produto}</div>
                  <div className="text-sm text-gray-600">
                    Código: {produto.codigoBarras} | Valor: R$ {produto.valorCompra?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotaEntradaForm;

