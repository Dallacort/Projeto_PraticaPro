import React, { useState, useEffect, useCallback } from 'react';
import { Produto, Marca, UnidadeMedida, Categoria } from '../../types';
import { getProdutos, createProduto } from '../../services/produtoService';
import MarcaModal from './MarcaModal';
import UnidadeMedidaModal from './UnidadeMedidaModal';
import CategoriaModal from './CategoriaModal';
import FormField from '../FormField';
import { FaSpinner, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface ProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (produto: Produto) => void;
}

const ProdutoModal: React.FC<ProdutoModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    produto: '',
    nome: '',
    codigoBarras: '',
    referencia: '',
    descricao: '',
    observacoes: '',
    valorCompra: 0,
    valorVenda: 0,
    percentualLucro: 0,
    quantidade: 0,
    quantidadeMinima: 0,
    marcaId: '',
    unidadeMedidaId: '',
    categoriaId: '',
    ativo: true,
  });

  const [marcaSelecionada, setMarcaSelecionada] = useState<Marca | null>(null);
  const [unidadeMedidaSelecionada, setUnidadeMedidaSelecionada] = useState<UnidadeMedida | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | null>(null);
  
  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
  const [isUnidadeMedidaModalOpen, setIsUnidadeMedidaModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProdutos();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProdutos();
      setSelectedProduto(null);
      setShowForm(false);
      setSearchTerm('');
      resetForm();
    }
  }, [isOpen, fetchProdutos]);

  const resetForm = () => {
    setFormData({
      produto: '',
      nome: '',
      codigoBarras: '',
      referencia: '',
      descricao: '',
      observacoes: '',
      valorCompra: 0,
      valorVenda: 0,
      percentualLucro: 0,
      quantidade: 0,
      quantidadeMinima: 0,
      marcaId: '',
      unidadeMedidaId: '',
      categoriaId: '',
      ativo: true,
    });
    setMarcaSelecionada(null);
    setUnidadeMedidaSelecionada(null);
    setCategoriaSelecionada(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProdutos = produtos.filter(produto =>
    produto.produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigoBarras?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.referencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProdutoRow = (produto: Produto) => {
    setSelectedProduto(produto);
  };

  const handleConfirmSelection = () => {
    if (selectedProduto) {
      onSelect(selectedProduto);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    };

    // Se o valor alterado for de compra ou venda, recalcula o lucro
    if (name === 'valorCompra' || name === 'valorVenda') {
      const valorCompra = name === 'valorCompra' ? Number(value) : formData.valorCompra;
      const valorVenda = name === 'valorVenda' ? Number(value) : formData.valorVenda;
      
      if (valorCompra > 0) {
        const lucro = ((valorVenda - valorCompra) / valorCompra) * 100;
        newFormData.percentualLucro = Number(lucro.toFixed(2));
      } else {
        newFormData.percentualLucro = 0;
      }
    }
    
    setFormData(newFormData);
  };

  const handleSelectMarca = (marca: Marca) => {
    setFormData(prev => ({ ...prev, marcaId: String(marca.id) }));
    setMarcaSelecionada(marca);
    setIsMarcaModalOpen(false);
  };

  const handleSelectUnidadeMedida = (unidadeMedida: UnidadeMedida) => {
    setFormData(prev => ({ ...prev, unidadeMedidaId: String(unidadeMedida.id) }));
    setUnidadeMedidaSelecionada(unidadeMedida);
    setIsUnidadeMedidaModalOpen(false);
  };

  const handleSelectCategoria = (categoria: Categoria) => {
    setFormData(prev => ({ ...prev, categoriaId: String(categoria.id) }));
    setCategoriaSelecionada(categoria);
    setIsCategoriaModalOpen(false);
  };

  const validateForm = () => {
    if (!formData.produto.trim()) {
      toast.error('Nome do produto é obrigatório.');
      return false;
    }
    if (!formData.marcaId) {
      toast.error('Marca é obrigatória.');
      return false;
    }
    if (!formData.unidadeMedidaId) {
      toast.error('Unidade de Medida é obrigatória.');
      return false;
    }
    if (!formData.categoriaId) {
      toast.error('Categoria é obrigatória.');
      return false;
    }
    if (formData.valorCompra < 0) {
      toast.error('Valor de compra não pode ser negativo.');
      return false;
    }
    if (formData.valorVenda < 0) {
      toast.error('Valor de venda não pode ser negativo.');
      return false;
    }
    return true;
  };

  const handleSaveNovoProduto = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        produto: formData.produto,
        nome: formData.nome || formData.produto,
        codigoBarras: formData.codigoBarras,
        referencia: formData.referencia,
        descricao: formData.descricao,
        observacoes: formData.observacoes,
        valorCompra: formData.valorCompra,
        valorVenda: formData.valorVenda,
        percentualLucro: formData.percentualLucro,
        quantidade: formData.quantidade,
        quantidadeMinima: formData.quantidadeMinima,
        marcaId: Number(formData.marcaId),
        unidadeMedidaId: Number(formData.unidadeMedidaId),
        categoriaId: Number(formData.categoriaId),
        ativo: formData.ativo,
      };

      const produtoCriado = await createProduto(payload);
      toast.success('Produto criado com sucesso!');
      onSelect(produtoCriado);
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      toast.error(error?.response?.data?.message || 'Erro ao criar produto.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh]">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              {showForm ? 'Novo Produto' : 'Selecionar Produto'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>

          {/* Corpo */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {!showForm ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="relative w-full sm:w-2/3">
                    <input
                      type="text"
                      placeholder="Buscar por nome, código de barras ou referência..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1 text-sm"
                  >
                    <FaPlus />
                    <span>Novo Produto</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                  </div>
                ) : (
                  <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                    {filteredProdutos.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referência</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor Compra</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor Venda</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredProdutos.map((produto) => (
                            <tr
                              key={produto.id}
                              onClick={() => handleSelectProdutoRow(produto)}
                              className={`cursor-pointer hover:bg-gray-100 ${selectedProduto?.id === produto.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                            >
                              <td className="px-4 py-3 text-sm text-gray-900">{produto.produto || produto.nome}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{produto.codigoBarras}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{produto.referencia}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">R$ {produto.valorCompra?.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">R$ {produto.valorVenda?.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${produto.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {produto.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Nenhum produto encontrado.</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {/* Toggle Ativo */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Cadastrar Novo Produto</h3>
                  <label className="flex items-center cursor-pointer">
                    <span className="mr-2 text-sm font-medium text-gray-700">Habilitado</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="ativo"
                        checked={formData.ativo}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`block w-14 h-8 rounded-full ${formData.ativo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ${formData.ativo ? 'translate-x-6' : ''}`}></div>
                    </div>
                  </label>
                </div>

                {/* Primeira linha */}
                <div className="grid gap-4 grid-cols-3">
                  <FormField
                    label="Produto"
                    name="produto"
                    value={formData.produto}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Pizza Margherita"
                  />

                  <FormField
                    label="Código de Barras"
                    name="codigoBarras"
                    value={formData.codigoBarras}
                    onChange={handleChange}
                    placeholder="Ex: 7891234567890"
                  />

                  <FormField
                    label="Referência"
                    name="referencia"
                    value={formData.referencia}
                    onChange={handleChange}
                    placeholder="Ex: PROD-001"
                  />
                </div>

                {/* Segunda linha */}
                <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca <span className="text-red-500">*</span>
                    </label>
                    <div 
                      onClick={() => setIsMarcaModalOpen(true)} 
                      className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200"
                    >
                      <input
                        type="text"
                        readOnly
                        value={marcaSelecionada ? marcaSelecionada.marca : 'Selecione...'}
                        className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                        placeholder="Selecione..."
                      />
                      <FaSearch className="text-gray-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidade <span className="text-red-500">*</span>
                    </label>
                    <div 
                      onClick={() => setIsUnidadeMedidaModalOpen(true)} 
                      className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200"
                    >
                      <input
                        type="text"
                        readOnly
                        value={unidadeMedidaSelecionada ? unidadeMedidaSelecionada.unidadeMedida : 'Selecione...'}
                        className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                        placeholder="Selecione..."
                      />
                      <FaSearch className="text-gray-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria <span className="text-red-500">*</span>
                    </label>
                    <div 
                      onClick={() => setIsCategoriaModalOpen(true)} 
                      className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200"
                    >
                      <input
                        type="text"
                        readOnly
                        value={categoriaSelecionada ? categoriaSelecionada.categoria : 'Selecione...'}
                        className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                        placeholder="Selecione..."
                      />
                      <FaSearch className="text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Terceira linha - Valores */}
                <div className="grid gap-4 grid-cols-5">
                  <FormField
                    label="Valor Compra"
                    name="valorCompra"
                    type="number"
                    step="0.01"
                    value={formData.valorCompra}
                    onChange={handleChange}
                    placeholder="0.00"
                  />

                  <FormField
                    label="Valor Venda"
                    name="valorVenda"
                    type="number"
                    step="0.01"
                    value={formData.valorVenda}
                    onChange={handleChange}
                    placeholder="0.00"
                  />

                  <FormField
                    label="Lucro (%)"
                    name="percentualLucro"
                    type="number"
                    step="0.01"
                    value={formData.percentualLucro}
                    onChange={handleChange}
                    disabled
                    placeholder="0.00"
                  />

                  <FormField
                    label="Quantidade"
                    name="quantidade"
                    type="number"
                    value={formData.quantidade}
                    onChange={handleChange}
                    placeholder="0"
                  />

                  <FormField
                    label="Qtd Mínima"
                    name="quantidadeMinima"
                    type="number"
                    value={formData.quantidadeMinima}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Descrição do produto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={2}
                  />
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    placeholder="Observações gerais"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div className="flex justify-end space-x-3 border-t px-6 py-4 bg-gray-50">
            {showForm ? (
              <>
                <button
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSaveNovoProduto}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Salvando...
                    </span>
                  ) : (
                    'Salvar Produto'
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSelection}
                  disabled={!selectedProduto}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Selecionar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <MarcaModal
        isOpen={isMarcaModalOpen}
        onClose={() => setIsMarcaModalOpen(false)}
        onSelect={handleSelectMarca}
      />

      <UnidadeMedidaModal
        isOpen={isUnidadeMedidaModalOpen}
        onClose={() => setIsUnidadeMedidaModalOpen(false)}
        onSelect={handleSelectUnidadeMedida}
      />

      <CategoriaModal
        isOpen={isCategoriaModalOpen}
        onClose={() => setIsCategoriaModalOpen(false)}
        onSelect={handleSelectCategoria}
      />
    </>
  );
};

export default ProdutoModal;

