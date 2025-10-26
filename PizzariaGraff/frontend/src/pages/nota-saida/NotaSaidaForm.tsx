import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NotaSaida, ProdutoNotaSaida, Cliente, Produto, CondicaoPagamento, Transportadora } from '../../types';
import { createNotaSaida, getNotaSaida, updateNotaSaida } from '../../services/notaSaidaService';
import { getClientes } from '../../services/clienteService';
import { getProdutos } from '../../services/produtoService';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';
import { getTransportadoras } from '../../services/transportadoraService';
import { FaSpinner, FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import FormField from '../../components/FormField';
import { getCurrentDateString } from '../../utils/dateUtils';
import ClienteModal from '../../components/modals/ClienteModal';
import ProdutoModal from '../../components/modals/ProdutoModal';
import TransportadoraModal from '../../components/modals/TransportadoraModal';
import VeiculoModal from '../../components/modals/VeiculoModal';

interface NotaSaidaFormData {
  numero: string;
  modelo: string;
  serie: string;
  clienteId: string;
  dataEmissao: string;
  dataSaida: string;
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

const NotaSaidaForm: React.FC = () => {
  const { numero, modelo, serie, clienteId } = useParams<{ numero: string; modelo: string; serie: string; clienteId: string }>();
  const navigate = useNavigate();
  const isNew = !numero;

  const [formData, setFormData] = useState<NotaSaidaFormData>({
    numero: '',
    modelo: '55',
    serie: '1',
    clienteId: '',
    dataEmissao: getCurrentDateString(),
    dataSaida: getCurrentDateString(),
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

  const [produtosNota, setProdutosNota] = useState<ProdutoNotaSaida[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [condicaoPagamentoSelecionada, setCondicaoPagamentoSelecionada] = useState<CondicaoPagamento | null>(null);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<Transportadora | null>(null);
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [condicoesPagamento, setCondicoesPagamento] = useState<CondicaoPagamento[]>([]);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showTransportadoraModal, setShowTransportadoraModal] = useState(false);
  const [showVeiculoModal, setShowVeiculoModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [clientesData, produtosData, condicoesData, transportadorasData] = await Promise.all([
          getClientes(),
          getProdutos(),
          CondicaoPagamentoService.list(),
          getTransportadoras()
        ]);
        
        setClientes(clientesData);
        setProdutos(produtosData);
        setCondicoesPagamento(condicoesData);
        setTransportadoras(transportadorasData);

        // Carregar nota se for edição
        if (!isNew && numero && modelo && serie && clienteId) {
          const notaData = await getNotaSaida(numero, modelo, serie, parseInt(clienteId));
          
          setFormData({
            numero: notaData.numero,
            modelo: notaData.modelo,
            serie: notaData.serie,
            clienteId: String(notaData.clienteId),
            dataEmissao: notaData.dataEmissao,
            dataSaida: notaData.dataSaida || '',
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
          
          const cliente = clientesData.find(c => c.id === notaData.clienteId);
          if (cliente) {
            setClienteSelecionado(cliente);
            if (cliente.condicaoPagamentoId) {
              const condicao = condicoesData.find(c => c.id === cliente.condicaoPagamentoId);
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
  }, [isNew, numero, modelo, serie, clienteId]);

  // Funções de validação para travamento progressivo
  const isDadosNotaPreenchidos = () => {
    return formData.numero && formData.clienteId && formData.dataEmissao && formData.dataSaida;
  };

  const isProdutosAdicionados = () => {
    return produtosNota.length > 0;
  };

  const isFretePreenchido = () => {
    return formData.tipoFrete && 
           (formData.valorFrete !== '' || formData.valorSeguro !== '' || formData.outrasDespesas !== '');
  };

  // Atualizar condição de pagamento quando cliente mudar
  useEffect(() => {
    if (clienteSelecionado && clienteSelecionado.condicaoPagamentoId) {
      const condicao = condicoesPagamento.find(c => c.id === clienteSelecionado.condicaoPagamentoId);
      if (condicao) {
        setCondicaoPagamentoSelecionada(condicao);
        setFormData(prev => ({ ...prev, condicaoPagamentoId: String(condicao.id) }));
      }
    }
  }, [clienteSelecionado, condicoesPagamento]);

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
      
      // Validar se data de saída não é anterior à nova data de emissão
      if (formData.dataSaida) {
        const dataSaida = new Date(formData.dataSaida);
        if (dataSaida < dataEmissao) {
          alert('A data de saída não pode ser anterior à data de emissão!');
          setFormData(prev => ({ ...prev, [name]: value, dataSaida: value }));
          return;
        }
      }
    }
    
    // Validar data de saída
    if (name === 'dataSaida') {
      const dataSaida = new Date(value);
      const dataEmissao = new Date(formData.dataEmissao);
      
      if (dataSaida < dataEmissao) {
        alert('A data de saída não pode ser anterior à data de emissão!');
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClienteSelect = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setFormData(prev => ({ ...prev, clienteId: String(cliente.id) }));
    setShowClienteModal(false);
  };

  const handleProdutoSelect = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setProdutoTemp(prev => ({
      ...prev,
      produtoId: produto.id,
      produtoNome: produto.produto,
      produtoCodigo: produto.codigoBarras,
      valorUnitario: String(produto.valorVenda || 0)
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

    const novoProduto: ProdutoNotaSaida = {
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

    return {
      totalProdutos,
      totalPagar: total
    };
  }, [produtosNota, formData.valorFrete, formData.valorSeguro, formData.outrasDespesas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clienteSelecionado) {
      alert('Selecione um cliente');
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

    // Validar data de saída
    if (formData.dataSaida) {
      const dataSaida = new Date(formData.dataSaida);
      
      if (dataSaida < dataEmissao) {
        alert('A data de saída não pode ser anterior à data de emissão!');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);


      const notaData: Partial<NotaSaida> = {
        numero: formData.numero,
        modelo: formData.modelo,
        serie: formData.serie,
        clienteId: parseInt(formData.clienteId),
        dataEmissao: formData.dataEmissao,
        dataSaida: formData.dataSaida || undefined,
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
        await createNotaSaida(notaData);
        alert('Nota criada com sucesso! As contas a receber foram geradas automaticamente.');
      } else {
        await updateNotaSaida(numero!, modelo!, serie!, parseInt(clienteId!), notaData);
        alert('Nota atualizada com sucesso! As contas a receber foram atualizadas.');
      }

      navigate('/notas-saida');
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
          {isNew ? 'Cadastro Nota de Venda' : 'Editar Nota de Venda'}
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
                Cliente *
              </label>
              <div 
                onClick={() => setShowClienteModal(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 h-10"
              >
                <input
                  type="text"
                  readOnly
                  value={clienteSelecionado ? clienteSelecionado.cliente : 'Selecione...'}
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
                Data Saída *
              </label>
              <input
                type="date"
                name="dataSaida"
                value={formData.dataSaida}
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
              onClick={() => navigate('/notas-saida')}
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

      {/* Modal Cliente com Cadastro */}
      <ClienteModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onSelect={(cliente) => {
          handleClienteSelect(cliente);
          // Recarregar lista de clientes
          getClientes().then(setClientes);
        }}
      />

      {/* Modal Produto com Cadastro */}
      <ProdutoModal
        isOpen={showProdutoModal}
        onClose={() => setShowProdutoModal(false)}
        onSelect={(produto) => {
          handleProdutoSelect(produto);
          // Recarregar lista de produtos
          getProdutos().then(setProdutos);
        }}
      />

      {/* Modal Transportadora com Cadastro */}
      <TransportadoraModal
        isOpen={showTransportadoraModal}
        onClose={() => setShowTransportadoraModal(false)}
        onSelect={(transportadora) => {
          handleTransportadoraSelect(transportadora);
          // Recarregar lista de transportadoras
          getTransportadoras().then(setTransportadoras);
        }}
      />

      {/* Modal Veículo com Cadastro */}
      <VeiculoModal
        isOpen={showVeiculoModal}
        onClose={() => setShowVeiculoModal(false)}
        transportadoraId={transportadoraSelecionada?.id}
        onSelect={(veiculo) => {
          handleVeiculoSelect(veiculo);
        }}
      />
    </div>
  );
};

export default NotaSaidaForm;

