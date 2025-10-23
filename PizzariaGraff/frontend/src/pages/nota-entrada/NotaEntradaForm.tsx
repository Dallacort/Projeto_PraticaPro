import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NotaEntrada, ProdutoNota, Fornecedor, Produto, CondicaoPagamento, Transportadora } from '../../types';
import { createNotaEntrada, getNotaEntrada, updateNotaEntrada } from '../../services/notaEntradaService';
import { getFornecedores } from '../../services/fornecedorService';
import { getProdutos } from '../../services/produtoService';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';
import { getTransportadoras } from '../../services/transportadoraService';
import { FaSpinner, FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import FormField from '../../components/FormField';
import { getCurrentDateString } from '../../utils/dateUtils';

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
  transportadoraId: string;
  placaVeiculo: string;
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
    dataEmissao: getCurrentDateString(),
    dataChegada: getCurrentDateString(),
    tipoFrete: 'CIF',
    valorFrete: '0',
    valorSeguro: '0',
    outrasDespesas: '0',
    condicaoPagamentoId: '',
    transportadoraId: '',
    placaVeiculo: '',
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
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<Transportadora | null>(null);
  
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [condicoesPagamento, setCondicoesPagamento] = useState<CondicaoPagamento[]>([]);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showTransportadoraModal, setShowTransportadoraModal] = useState(false);
  const [showVeiculoModal, setShowVeiculoModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fornecedoresData, produtosData, condicoesData, transportadorasData] = await Promise.all([
          getFornecedores(),
          getProdutos(),
          CondicaoPagamentoService.list(),
          getTransportadoras()
        ]);
        
        setFornecedores(fornecedoresData);
        setProdutos(produtosData);
        setCondicoesPagamento(condicoesData);
        setTransportadoras(transportadorasData);

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
            transportadoraId: String(notaData.transportadoraId || ''),
            placaVeiculo: notaData.placaVeiculo || '',
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
          
          // Carregar transportadora se houver
          if (notaData.transportadoraId) {
            const transportadora = transportadorasData.find(t => t.id === notaData.transportadoraId);
            if (transportadora) {
              setTransportadoraSelecionada(transportadora);
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

  // Funções de validação para travamento progressivo
  const isDadosNotaPreenchidos = () => {
    return formData.numero && formData.fornecedorId && formData.dataEmissao && formData.dataChegada;
  };

  const isProdutosAdicionados = () => {
    return produtosNota.length > 0;
  };

  const isFretePreenchido = () => {
    return formData.tipoFrete && 
           (formData.valorFrete !== '' || formData.valorSeguro !== '' || formData.outrasDespesas !== '');
  };

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
    
    // Validar data de emissão
    if (name === 'dataEmissao') {
      const dataEmissao = new Date(value);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (dataEmissao > hoje) {
        alert('A data de emissão não pode ser futura!');
        return;
      }
      
      // Validar se data de chegada não é anterior à nova data de emissão
      if (formData.dataChegada) {
        const dataChegada = new Date(formData.dataChegada);
        if (dataChegada < dataEmissao) {
          alert('A data de chegada não pode ser anterior à data de emissão!');
          setFormData(prev => ({ ...prev, [name]: value, dataChegada: value }));
          return;
        }
      }
    }
    
    // Validar data de chegada
    if (name === 'dataChegada') {
      const dataChegada = new Date(value);
      const dataEmissao = new Date(formData.dataEmissao);
      
      if (dataChegada < dataEmissao) {
        alert('A data de chegada não pode ser anterior à data de emissão!');
        return;
      }
    }
    
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

  const handleTransportadoraSelect = async (transportadora: Transportadora) => {
    setTransportadoraSelecionada(transportadora);
    setFormData(prev => ({ ...prev, transportadoraId: String(transportadora.id), placaVeiculo: '' }));
    setShowTransportadoraModal(false);
    
    // Buscar veículos da transportadora
    try {
      const response = await fetch(`/api/veiculos/transportadora/${transportadora.id}`);
      if (response.ok) {
        const veiculosData = await response.json();
        setVeiculos(veiculosData);
      } else {
        setVeiculos([]);
      }
    } catch (err) {
      console.error('Erro ao buscar veículos:', err);
      setVeiculos([]);
    }
  };

  const handleVeiculoSelect = (veiculo: any) => {
    setFormData(prev => ({ ...prev, placaVeiculo: veiculo.placa }));
    setShowVeiculoModal(false);
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

    // Recalcular valor total para garantir precisão
    const quantidade = parseFloat(produtoTemp.quantidade);
    const valorUnitario = parseFloat(produtoTemp.valorUnitario);
    const valorDesconto = parseFloat(produtoTemp.valorDesconto) || 0;
    const valorTotalCalculado = (quantidade * valorUnitario) - valorDesconto;

    const novoProduto: ProdutoNota = {
      produtoId: produtoTemp.produtoId,
      produtoNome: produtoTemp.produtoNome,
      produtoCodigo: produtoTemp.produtoCodigo,
      sequencia: produtosNota.length + 1,
      quantidade: quantidade,
      valorUnitario: valorUnitario,
      valorDesconto: valorDesconto,
      percentualDesconto: parseFloat(produtoTemp.percentualDesconto) || 0,
      valorTotal: valorTotalCalculado,
      rateioFrete: 0,
      rateioSeguro: 0,
      rateioOutras: 0,
      custoPrecoFinal: valorTotalCalculado
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

  // Usar useMemo para garantir recálculo correto dos totais
  const totais = useMemo(() => {
    const totalProdutos = produtosNota.reduce((sum, p) => sum + (p.valorTotal || 0), 0);
    const frete = parseFloat(formData.valorFrete) || 0;
    const seguro = parseFloat(formData.valorSeguro) || 0;
    const outras = parseFloat(formData.outrasDespesas) || 0;
    const total = totalProdutos + frete + seguro + outras;

    // Debug para verificar cálculos
    console.log('Cálculo de totais:', {
      produtos: produtosNota.map(p => ({ nome: p.produtoNome, valor: p.valorTotal })),
      totalProdutos,
      frete,
      seguro,
      outras,
      total
    });

    return {
      totalProdutos,
      totalPagar: total
    };
  }, [produtosNota, formData.valorFrete, formData.valorSeguro, formData.outrasDespesas]);

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

    // Validar data de emissão
    const dataEmissao = new Date(formData.dataEmissao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataEmissao > hoje) {
      alert('A data de emissão não pode ser futura!');
      return;
    }

    // Validar data de chegada
    if (formData.dataChegada) {
      const dataChegada = new Date(formData.dataChegada);
      
      if (dataChegada < dataEmissao) {
        alert('A data de chegada não pode ser anterior à data de emissão!');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);


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
        transportadoraId: formData.transportadoraId ? parseInt(formData.transportadoraId) : undefined,
        placaVeiculo: formData.placaVeiculo || undefined,
        observacoes: formData.observacoes,
        situacao: 'PENDENTE',
        produtos: produtosNota
      };

      if (isNew) {
        await createNotaEntrada(notaData);
        alert('Nota criada com sucesso! As contas a pagar foram geradas automaticamente.');
      } else {
        await updateNotaEntrada(numero!, modelo!, serie!, parseInt(fornecedorId!), notaData);
        alert('Nota atualizada com sucesso! As contas a pagar foram atualizadas.');
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número *
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                required
                disabled={!isNew}
                placeholder="22232"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                placeholder="55"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Série
              </label>
              <input
                type="text"
                name="serie"
                value={formData.serie}
                onChange={handleChange}
                placeholder="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right"
              />
            </div>
            
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Emissão *
              </label>
              <input
                type="date"
                name="dataEmissao"
                value={formData.dataEmissao}
                onChange={handleChange}
                max={getCurrentDateString()}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Chegada *
              </label>
              <input
                type="date"
                name="dataChegada"
                value={formData.dataChegada}
                onChange={handleChange}
                min={formData.dataEmissao}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              />
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Produtos</h2>
          
          <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: '60px 1fr 80px 100px 120px 120px' }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cód *
              </label>
              <div 
                onClick={() => isDadosNotaPreenchidos() && setShowProdutoModal(true)}
                className={`flex items-center justify-center px-2 py-2 border border-gray-300 rounded-md h-10 ${
                  isDadosNotaPreenchidos() 
                    ? 'bg-gray-100 cursor-pointer hover:bg-gray-200' 
                    : 'bg-gray-200 cursor-not-allowed opacity-50'
                }`}
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
                className="w-full px-2 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10"
                placeholder=""
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade
              </label>
              <input
                type="text"
                value="UN"
                readOnly
                disabled
                className="w-full px-2 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10 text-center"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qtd *
              </label>
              <input
                type="number"
                name="quantidade"
                value={produtoTemp.quantidade}
                onChange={handleProdutoTempChange}
                disabled={!isDadosNotaPreenchidos()}
                placeholder="1"
                step="0.01"
                min="0"
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right disabled:bg-gray-200 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Unit. *
              </label>
              <input
                type="number"
                name="valorUnitario"
                value={produtoTemp.valorUnitario}
                onChange={handleProdutoTempChange}
                disabled={!isDadosNotaPreenchidos()}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right disabled:bg-gray-200 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desconto R$
              </label>
              <input
                type="number"
                name="valorDesconto"
                value={produtoTemp.valorDesconto}
                onChange={handleProdutoTempChange}
                disabled={!isDadosNotaPreenchidos()}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right disabled:bg-gray-200 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleAdicionarProduto}
              disabled={!isDadosNotaPreenchidos()}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                    <th className="px-3 py-2 text-left">UND</th>
                    <th className="px-3 py-2 text-right">QTD</th>
                    <th className="px-3 py-2 text-right">PREÇO UN</th>
                    <th className="px-3 py-2 text-right">TOTAL</th>
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
                        <td className="px-3 py-2 text-right">R$ {produto.valorTotal.toFixed(2)}</td>
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
              
              <div className="mt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleLimparProdutos}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  <FaTrash />
                  Limpar Todos os Produtos
                </button>
                
                {/* Total dos Produtos */}
                <div className="text-lg font-semibold">
                  Total Produtos: R$ {totais.totalProdutos.toFixed(2).replace('.', ',')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Frete e Outras Despesas */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Frete e Outras Despesas</h2>
          
          <div className="flex items-end gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Frete</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tipoFrete"
                    value="CIF"
                    checked={formData.tipoFrete === 'CIF'}
                    onChange={handleChange}
                    disabled={!isProdutosAdicionados()}
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
                    disabled={!isProdutosAdicionados()}
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
                    disabled={!isProdutosAdicionados()}
                    className="mr-2"
                  />
                  SEM
                </label>
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Frete
              </label>
              <input
                type="number"
                name="valorFrete"
                value={formData.valorFrete}
                onChange={handleChange}
                disabled={!isProdutosAdicionados()}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right disabled:bg-gray-200 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Seguro
              </label>
              <input
                type="number"
                name="valorSeguro"
                value={formData.valorSeguro}
                onChange={handleChange}
                disabled={!isProdutosAdicionados()}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right disabled:bg-gray-200 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outras Despesas
              </label>
              <input
                type="number"
                name="outrasDespesas"
                value={formData.outrasDespesas}
                onChange={handleChange}
                disabled={!isProdutosAdicionados()}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 text-right disabled:bg-gray-200 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Transportadora e Placa */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cód. Transportadora
              </label>
              <div 
                onClick={() => isProdutosAdicionados() && setShowTransportadoraModal(true)}
                className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md h-10 ${
                  isProdutosAdicionados()
                    ? 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                    : 'bg-gray-200 cursor-not-allowed opacity-50'
                }`}
              >
                <input
                  type="text"
                  readOnly
                  value={transportadoraSelecionada ? transportadoraSelecionada.transportadora : 'Selecione...'}
                  className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                  placeholder="Selecione..."
                  disabled={!isProdutosAdicionados()}
                />
                <FaSearch className="text-gray-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placa Veículo
              </label>
              <div 
                onClick={() => transportadoraSelecionada && isProdutosAdicionados() && setShowVeiculoModal(true)}
                className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md h-10 ${
                  transportadoraSelecionada && isProdutosAdicionados()
                    ? 'bg-gray-100 cursor-pointer hover:bg-gray-200'
                    : 'bg-gray-200 cursor-not-allowed opacity-50'
                }`}
              >
                <input
                  type="text"
                  readOnly
                  value={formData.placaVeiculo || 'Selecione...'}
                  className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                  placeholder="Selecione..."
                  disabled={!transportadoraSelecionada || !isProdutosAdicionados()}
                />
                <FaSearch className="text-gray-500" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="text-lg font-semibold text-right">
              Total da Nota: R$ {totais.totalPagar.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>

        {/* Condição de Pagamento */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Condição de Pagamento</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cód. Cond. Pgto
              </label>
              <input
                type="text"
                name="condicaoPagamentoId"
                value={formData.condicaoPagamentoId}
                onChange={handleChange}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10 text-right"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condição de Pagamento
              </label>
              <input
                type="text"
                name="condicaoPagamentoNome"
                value={condicaoPagamentoSelecionada?.condicaoPagamento || ''}
                onChange={() => {}}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10"
              />
            </div>
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
                    <td className="px-3 py-2">{new Date(formData.dataEmissao).toLocaleDateString('pt-BR')}</td>
                    <td className="px-3 py-2 text-right font-semibold">
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

        <div className="flex justify-between items-end pt-6 border-t mt-6">
          {/* Botões de Ação */}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/notas-entrada')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
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

      {/* Modal Transportadora */}
      {showTransportadoraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Selecionar Transportadora</h3>
              <button
                onClick={() => setShowTransportadoraModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {transportadoras.map(transportadora => (
                <div
                  key={transportadora.id}
                  onClick={() => handleTransportadoraSelect(transportadora)}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-semibold">{transportadora.transportadora}</div>
                  <div className="text-sm text-gray-600">
                    {transportadora.email || 'Sem email'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Veículo */}
      {showVeiculoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Selecionar Veículo</h3>
              <button
                onClick={() => setShowVeiculoModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {veiculos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum veículo cadastrado para esta transportadora
              </div>
            ) : (
              <div className="space-y-2">
                {veiculos.map((veiculo, index) => (
                  <div
                    key={index}
                    onClick={() => handleVeiculoSelect(veiculo)}
                    className="p-3 border rounded cursor-pointer hover:bg-gray-100"
                  >
                    <div className="font-semibold">{veiculo.placa}</div>
                    <div className="text-sm text-gray-600">
                      {veiculo.modelo || 'Sem modelo'} - {veiculo.marca || 'Sem marca'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotaEntradaForm;

