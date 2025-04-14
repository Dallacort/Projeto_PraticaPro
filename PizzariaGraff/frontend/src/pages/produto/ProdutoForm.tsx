import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getProduto, createProduto, updateProduto } from '../../services/produtoService';
import { Produto } from '../../types';

const ProdutoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Considerar novo se o ID for 'novo' OU se estiver na rota '/produtos/novo'
  const isNew = id === 'novo' || location.pathname === '/produtos/novo' || !id;
  
  console.log('ProdutoForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<Omit<Produto, 'id'>>({
    nome: '',
    quantidade: 0,
    valor: 0,
    dataCadastro: '',
    ultimaModificacao: ''
  });
  
  const [dataCadastro, setDataCadastro] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isNew) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Se for edição, buscar dados do produto
        if (id) {
          const produtoData = await getProduto(Number(id));
          if (!produtoData) {
            throw new Error('Produto não encontrado');
          }
          
          setFormData({
            nome: produtoData.nome,
            quantidade: produtoData.quantidade,
            valor: produtoData.valor,
            dataCadastro: produtoData.dataCadastro || '',
            ultimaModificacao: produtoData.ultimaModificacao || ''
          });
          
          // Guardar datas para exibição
          setDataCadastro(produtoData.dataCadastro || null);
          setUltimaModificacao(produtoData.ultimaModificacao || null);
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        const errorMessage = err.response?.data?.mensagem || err.message || 'Erro ao carregar os dados necessários.';
        setError(errorMessage);
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
    
    if (name === 'quantidade' || name === 'valor') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.nome) errors.push("Nome é obrigatório");
    if (formData.quantidade < 0) errors.push("Quantidade não pode ser negativa");
    if (formData.valor < 0) errors.push("Valor não pode ser negativo");
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Preparar os dados do produto
      const produtoData: Omit<Produto, 'id'> = {
        nome: formData.nome,
        quantidade: formData.quantidade,
        valor: formData.valor,
        dataCadastro: formData.dataCadastro,
        ultimaModificacao: formData.ultimaModificacao
      };
      
      console.log('Salvando dados:', produtoData, 'isNew:', isNew);
      
      if (isNew) {
        console.log('Criando novo produto:', produtoData);
        const novoProduto = await createProduto(produtoData);
        console.log('Produto criado:', novoProduto);
        alert('Produto cadastrado com sucesso!');
        navigate('/produtos');
      } else if (id) {
        console.log('Atualizando produto:', id, produtoData);
        const produtoAtualizado = await updateProduto(Number(id), produtoData);
        console.log('Produto atualizado:', produtoAtualizado);
        alert('Produto atualizado com sucesso!');
        navigate('/produtos');
      }
    } catch (err: any) {
      console.error('Erro ao salvar produto:', err);
      // Extrair mensagem de erro da API se disponível
      const errorMessage = err.response?.data?.mensagem || err.response?.data?.erro || err.message || 'Erro ao salvar produto. Verifique os dados e tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Carregando dados do produto...</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNew ? 'Novo Produto' : 'Editar Produto'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {!isNew && (
          <div className="mb-6 bg-gray-100 p-4 rounded-lg border border-gray-300">
            <h3 className="font-semibold text-lg text-gray-700 mb-2">Informações do Registro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-semibold">Data de Cadastro:</span>{' '}
                <span className="text-blue-700 font-medium">{formatDate(dataCadastro)}</span>
              </div>
              <div>
                <span className="font-semibold">Última Modificação:</span>{' '}
                <span className="text-blue-700 font-medium">{formatDate(ultimaModificacao)}</span>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-4">
            <FormField
              label="Nome do Produto"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Nome do produto"
              error={!formData.nome && error ? 'Campo obrigatório' : undefined}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Quantidade"
                name="quantidade"
                type="number"
                value={formData.quantidade.toString()}
                onChange={handleChange}
                required
                placeholder="0"
                error={formData.quantidade < 0 && error ? 'Quantidade não pode ser negativa' : undefined}
              />
              
              <FormField
                label="Valor"
                name="valor"
                type="number"
                value={formData.valor.toString()}
                onChange={handleChange}
                required
                placeholder="0.00"
                error={formData.valor < 0 && error ? 'Valor não pode ser negativo' : undefined}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProdutoForm; 