import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import MarcaModal from '../../components/modals/MarcaModal';
import UnidadeMedidaModal from '../../components/modals/UnidadeMedidaModal';
import CategoriaModal from '../../components/modals/CategoriaModal';
import { getProduto, createProduto, updateProduto } from '../../services/produtoService';
import { Produto, Marca, UnidadeMedida, Categoria } from '../../types';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';

interface ProdutoFormData {
  produto: string;
  nome: string;
  codigoBarras: string;
  referencia: string;
  descricao: string;
  observacoes: string;
  valorCompra: number;
  valorVenda: number;
  percentualLucro: number;
  quantidade: number;
  quantidadeMinima: number;
  marcaId: string;
  unidadeMedidaId: string;
  categoriaId: string;
  ativo: boolean;
}

const ProdutoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'novo' || location.pathname === '/produtos/novo' || !id;
  const isView = location.pathname.includes('/visualizar');
  
  console.log('ProdutoForm - ID:', id, 'isNew:', isNew, 'isView:', isView, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<ProdutoFormData>({
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
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);

  // Estados para modais e seleções
  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
  const [isUnidadeMedidaModalOpen, setIsUnidadeMedidaModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  const [marcaSelecionada, setMarcaSelecionada] = useState<Marca | null>(null);
  const [unidadeMedidaSelecionada, setUnidadeMedidaSelecionada] = useState<UnidadeMedida | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isNew && id) {
          const produtoData = await getProduto(Number(id));
          if (!produtoData) {
            throw new Error('Produto não encontrado');
          }
          
          setFormData({
            produto: produtoData.produto || produtoData.nome || '',
            nome: produtoData.nome || produtoData.produto || '',
            codigoBarras: produtoData.codigoBarras || '',
            referencia: produtoData.referencia || '',
            descricao: produtoData.descricao || '',
            observacoes: produtoData.observacoes || '',
            valorCompra: produtoData.valorCompra || 0,
            valorVenda: produtoData.valorVenda || 0,
            percentualLucro: produtoData.percentualLucro || 0,
            quantidade: produtoData.quantidade || 0,
            quantidadeMinima: produtoData.quantidadeMinima || 0,
            marcaId: produtoData.marcaId ? String(produtoData.marcaId) : '',
            unidadeMedidaId: produtoData.unidadeMedidaId ? String(produtoData.unidadeMedidaId) : '',
            categoriaId: produtoData.categoriaId ? String(produtoData.categoriaId) : '',
            ativo: produtoData.ativo !== undefined ? produtoData.ativo : true,
          });
          
          // Configurar dados de marca e unidade se disponíveis
          if (produtoData.marca) {
            setMarcaSelecionada(produtoData.marca);
          } else if (produtoData.marcaNome) {
            setMarcaSelecionada({
              id: produtoData.marcaId!,
              marca: produtoData.marcaNome,
              ativo: true
            });
          }
          
          if (produtoData.unidadeMedida) {
            setUnidadeMedidaSelecionada(produtoData.unidadeMedida);
          } else if (produtoData.unidadeMedidaNome) {
            setUnidadeMedidaSelecionada({
              id: produtoData.unidadeMedidaId!,
              unidadeMedida: produtoData.unidadeMedidaNome,
              ativo: true
            });
          }
          
          if (produtoData.categoria) {
            setCategoriaSelecionada(produtoData.categoria);
          } else if (produtoData.categoriaNome) {
            setCategoriaSelecionada({
              id: produtoData.categoriaId!,
              categoria: produtoData.categoriaNome,
              ativo: true
            });
          }
          
          setUltimaModificacao(produtoData.ultimaModificacao || produtoData.dataAlteracao);
          setDataCadastro(produtoData.dataCadastro || produtoData.dataCriacao);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados do produto.');
        setTimeout(() => {
          navigate('/produtos');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew, navigate]);

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

  const handleOpenMarcaModal = () => setIsMarcaModalOpen(true);
  const handleCloseMarcaModal = () => setIsMarcaModalOpen(false);

  const handleMarcaSelecionada = (marca: Marca) => {
    setMarcaSelecionada(marca);
    setFormData(prev => ({
      ...prev,
      marcaId: String(marca.id)
    }));
    setIsMarcaModalOpen(false);
  };

  const handleOpenUnidadeMedidaModal = () => setIsUnidadeMedidaModalOpen(true);
  const handleCloseUnidadeMedidaModal = () => setIsUnidadeMedidaModalOpen(false);

  const handleUnidadeMedidaSelecionada = (unidadeMedida: UnidadeMedida) => {
    setUnidadeMedidaSelecionada(unidadeMedida);
    setFormData(prev => ({
      ...prev,
      unidadeMedidaId: String(unidadeMedida.id)
    }));
    setIsUnidadeMedidaModalOpen(false);
  };

  const handleOpenCategoriaModal = () => setIsCategoriaModalOpen(true);
  const handleCloseCategoriaModal = () => setIsCategoriaModalOpen(false);

  const handleCategoriaSelecionada = (categoria: Categoria) => {
    setCategoriaSelecionada(categoria);
    setFormData(prev => ({
      ...prev,
      categoriaId: String(categoria.id)
    }));
    setIsCategoriaModalOpen(false);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    // Campos obrigatórios
    if (!formData.produto?.trim() && !formData.nome?.trim()) {
      errors.push("Nome do produto é obrigatório");
    }
    if (!formData.marcaId || formData.marcaId === '') {
      errors.push("Marca é obrigatória");
    }
    if (!formData.unidadeMedidaId || formData.unidadeMedidaId === '') {
      errors.push("Unidade de medida é obrigatória");
    }
    if (!formData.categoriaId || formData.categoriaId === '') {
      errors.push("Categoria é obrigatória");
    }

    // Validação de tamanho dos campos de texto
    if (formData.produto?.length > 50) {
      errors.push("Nome do produto não pode ter mais que 50 caracteres");
    }
    if (formData.codigoBarras?.length > 50) {
      errors.push("Código de barras não pode ter mais que 50 caracteres");
    }
    if (formData.referencia?.length > 50) {
      errors.push("Referência não pode ter mais que 50 caracteres");
    }
    if (formData.descricao?.length > 50) {
      errors.push("Descrição não pode ter mais que 50 caracteres");
    }
    if (formData.observacoes?.length > 50) {
      errors.push("Observações não podem ter mais que 50 caracteres");
    }

    // Validação de valores numéricos
    if (formData.valorCompra <= 0) {
      errors.push("Valor de compra deve ser maior que zero");
    }
    if (formData.valorCompra > 99999999) {
      errors.push("Valor de compra não pode ser maior que 99.999.999");
    }
    if (formData.valorVenda <= 0) {
      errors.push("Valor de venda deve ser maior que zero");
    }
    if (formData.valorVenda > 99999999) {
      errors.push("Valor de venda não pode ser maior que 99.999.999");
    }
    if (formData.quantidade < 0) {
      errors.push("Quantidade não pode ser negativa");
    }
    if (formData.quantidade > 99999999) {
      errors.push("Quantidade não pode ser maior que 99.999.999");
    }
    if (formData.quantidadeMinima < 0) {
      errors.push("Quantidade mínima não pode ser negativa");
    }
    if (formData.quantidadeMinima > 99999999) {
      errors.push("Quantidade mínima não pode ser maior que 99.999.999");
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isView) return;
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const produtoDataPayload = {
        produto: formData.produto || formData.nome,
        codigoBarras: formData.codigoBarras?.trim() || null,
        referencia: formData.referencia?.trim() || null,
        descricao: formData.descricao?.trim() || null,
        observacoes: formData.observacoes?.trim() || null,
        valorCompra: formData.valorCompra,
        valorVenda: formData.valorVenda,
        percentualLucro: formData.percentualLucro,
        quantidade: formData.quantidade,
        quantidadeMinima: formData.quantidadeMinima,
        marcaId: formData.marcaId ? Number(formData.marcaId) : null,
        unidadeMedidaId: formData.unidadeMedidaId ? Number(formData.unidadeMedidaId) : null,
        categoriaId: formData.categoriaId ? Number(formData.categoriaId) : null,
      };
      
      console.log('Dados sendo enviados para o produto:', produtoDataPayload);
      
      if (isNew) {
        await createProduto(produtoDataPayload);
        toast.success('Produto cadastrado com sucesso!');
      } else if (id) {
        await updateProduto(Number(id), produtoDataPayload);
        toast.success('Produto atualizado com sucesso!');
      }
      
      navigate('/produtos');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError('Erro ao salvar produto. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-primary">
          <FaSpinner className="animate-spin text-blue-500" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-7xl w-full mx-auto my-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">
          {isNew ? 'Novo Produto' : isView ? 'Visualizar Produto' : 'Editar Produto'}
        </h1>
        {isView && (
          <button
            onClick={() => navigate(`/produtos/${id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Dados Básicos</h2>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <span className="mr-2 text-sm font-medium text-gray-700">Habilitado</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleChange}
                      disabled={isView}
                      className="sr-only"
                    />
                    <div className={`block w-14 h-8 rounded-full ${formData.ativo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ${formData.ativo ? 'translate-x-6' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Primeira linha: Código, Produto, Código de Barras, Referência */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '100px 3fr 2fr 1.5fr' }}>
              <FormField
                label="Código"
                name="id"
                value={id && !isNew ? id : 'Novo'}
                onChange={() => {}}
                disabled={true}
              />

              <FormField
                label="Produto"
                name="produto"
                value={formData.produto}
                onChange={handleChange}
                required
                disabled={isView}
                maxLength={50}
                placeholder="Ex: Refrigerante Coca-Cola 350ml"
              />

              <FormField
                label="Código de Barras"
                name="codigoBarras"
                value={formData.codigoBarras}
                onChange={handleChange}
                disabled={isView}
                maxLength={50}
                placeholder="Ex: 7891000100103"
              />

              <FormField
                label="Referência"
                name="referencia"
                value={formData.referencia}
                onChange={handleChange}
                disabled={isView}
                maxLength={50}
                placeholder="Ex: REF001"
              />
            </div>

            {/* Segunda linha: Marca, Unidade de Medida, Categoria, Descrição */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr 1fr 2fr' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca <span className="text-red-500">*</span>
                </label>
                <div 
                  onClick={!isView ? handleOpenMarcaModal : undefined}
                  className={`flex items-center gap-2 p-2 border border-gray-300 rounded-md ${!isView ? 'bg-gray-100 cursor-pointer hover:bg-gray-200' : 'bg-gray-50'} relative`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && !isView && handleOpenMarcaModal()}
                >
                  <input
                    type="text"
                    readOnly
                    value={marcaSelecionada ? marcaSelecionada.marca : 'Selecione...'}
                    className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                    placeholder="Selecione..."
                  />
                  {!isView && <FaSearch className="text-gray-500" />}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade de Medida <span className="text-red-500">*</span>
                </label>
                <div 
                  onClick={!isView ? handleOpenUnidadeMedidaModal : undefined}
                  className={`flex items-center gap-2 p-2 border border-gray-300 rounded-md ${!isView ? 'bg-gray-100 cursor-pointer hover:bg-gray-200' : 'bg-gray-50'} relative`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && !isView && handleOpenUnidadeMedidaModal()}
                >
                  <input
                    type="text"
                    readOnly
                    value={unidadeMedidaSelecionada ? unidadeMedidaSelecionada.unidadeMedida : 'Selecione...'}
                    className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                    placeholder="Selecione..."
                  />
                  {!isView && <FaSearch className="text-gray-500" />}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <div 
                  onClick={!isView ? handleOpenCategoriaModal : undefined}
                  className={`flex items-center gap-2 p-2 border border-gray-300 rounded-md ${!isView ? 'bg-gray-100 cursor-pointer hover:bg-gray-200' : 'bg-gray-50'} relative`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && !isView && handleOpenCategoriaModal()}
                >
                  <input
                    type="text"
                    readOnly
                    value={categoriaSelecionada ? categoriaSelecionada.categoria : 'Selecione...'}
                    className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                    placeholder="Selecione..."
                  />
                  {!isView && <FaSearch className="text-gray-500" />}
                </div>
              </div>

              <FormField
                label="Descrição"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                disabled={isView}
                maxLength={50}
                placeholder="Descrição do produto"
              />
            </div>

            {/* Terceira linha: Valores e Estoque */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '150px 150px 150px 150px 150px' }}>
              <FormField
                label="Valor Compra"
                name="valorCompra"
                type="number"
                step="0.01"
                value={formData.valorCompra}
                onChange={handleChange}
                required
                max={99999999}
                disabled={isView}
                placeholder="0,00"
              />

              <FormField
                label="Valor Venda"
                name="valorVenda"
                type="number"
                step="0.01"
                value={formData.valorVenda}
                onChange={handleChange}
                required
                max={99999999}
                disabled={isView}
                placeholder="0,00"
              />

              <FormField
                label="% Lucro"
                name="percentualLucro"
                type="number"
                step="0.01"
                value={formData.percentualLucro}
                onChange={() => {}}
                disabled={true}
                max={99999999}
                placeholder="0,00"
              />

              <FormField
                label="Quantidade"
                name="quantidade"
                type="number"
                step="1"
                value={formData.quantidade}
                onChange={handleChange}
                required
                max={99999999}
                disabled={isView}
                placeholder="0"
              />

              <FormField
                label="Quantidade Mínima"
                name="quantidadeMinima"
                type="number"
                step="1"
                value={formData.quantidadeMinima}
                onChange={handleChange}
                required
                max={99999999}
                disabled={isView}
                placeholder="0"
              />
            </div>

            {/* Observações */}
            <div className="mt-4">
              <FormField
                label="Observações"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                disabled={isView}
                maxLength={250}
                placeholder="Observações adicionais"
              />
            </div>
          </div>
        </div>

        {/* Rodapé do formulário com informações de registro e botões */}
        <div className="flex justify-between items-end pt-6 border-t mt-6">
          {/* Informações do Registro (sempre que existirem datas) */}
          {(dataCadastro || ultimaModificacao) && (
            <div className="text-sm text-gray-600">
              <h3 className="font-semibold text-gray-700 mb-1">Informações do Registro:</h3>
              {dataCadastro && (
                <p>
                  Cadastrado em: {formatDate(dataCadastro)}
                </p>
              )}
              {ultimaModificacao && (
                <p>
                  Última modificação: {formatDate(ultimaModificacao)}
                </p>
              )}
            </div>
          )}

          {/* Botões de Ação - Sempre à direita */}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              {isView ? 'Voltar' : 'Cancelar'}
            </button>
            {!isView && (
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50`}
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
            )}
          </div>
        </div>
      </form>

      {/* Modais */}
      <MarcaModal
        isOpen={isMarcaModalOpen}
        onClose={handleCloseMarcaModal}
        onSelect={handleMarcaSelecionada}
      />
      
      <UnidadeMedidaModal
        isOpen={isUnidadeMedidaModalOpen}
        onClose={handleCloseUnidadeMedidaModal}
        onSelect={handleUnidadeMedidaSelecionada}
      />
      
      <CategoriaModal
        isOpen={isCategoriaModalOpen}
        onClose={handleCloseCategoriaModal}
        onSelect={handleCategoriaSelecionada}
      />
    </div>
  );
};

export default ProdutoForm; 