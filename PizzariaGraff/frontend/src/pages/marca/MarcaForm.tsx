import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getMarca, createMarca, updateMarca } from '../../services/marcaService';
import { Marca } from '../../types';
import { FaSpinner } from 'react-icons/fa';

const MarcaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = !id || id === 'novo';
  const isView = location.pathname.includes('/visualizar');
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    marca: '',
    situacao: new Date().toISOString().split('T')[0],
    ativo: true,
    dataCriacao: null as string | null,
    dataAlteracao: null as string | null,
    dataCadastro: null as string | null,
    ultimaModificacao: null as string | null
  });

  // Função para formatar datas
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Extrair datas para exibição
  const dataCadastro = formData.dataCriacao || formData.dataCadastro;
  const ultimaModificacao = formData.dataAlteracao || formData.ultimaModificacao;

  useEffect(() => {
    if (!isNew) {
      loadMarca();
    }
  }, [id, isNew]);

  const loadMarca = async () => {
    if (!id || id === 'novo') return;
    
    try {
      setLoading(true);
      setError(null);
      const marca = await getMarca(Number(id));
      
      if (marca) {
        setFormData({
          marca: marca.marca,
          situacao: marca.situacao || new Date().toISOString().split('T')[0],
          ativo: marca.ativo,
          dataCriacao: marca.dataCriacao,
          dataAlteracao: marca.dataAlteracao,
          dataCadastro: marca.dataCadastro,
          ultimaModificacao: marca.ultimaModificacao
        });
      }
    } catch (err) {
      console.error('Erro ao carregar marca:', err);
      setError('Erro ao carregar dados da marca.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isView) return;
    
    if (!formData.marca.trim()) {
      setError('O nome da marca é obrigatório.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (isNew) {
        await createMarca(formData);
        alert('Marca criada com sucesso!');
      } else {
        await updateMarca(Number(id), formData);
        alert('Marca atualizada com sucesso!');
      }
      
      navigate('/marcas');
    } catch (err) {
      console.error('Erro ao salvar marca:', err);
      setError('Erro ao salvar marca. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/marcas');
  };

  const getTitle = () => {
    if (isView) return 'Visualizar Marca';
    if (isNew) return 'Nova Marca';
    return 'Editar Marca';
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-7xl w-full mx-auto my-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">{getTitle()}</h1>
        {isView && (
          <button
            onClick={() => navigate(`/marcas/${id}`)}
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
              <h2 className="text-lg font-semibold">Informações da Marca</h2>
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
            
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '100px 3fr 200px' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  value={id && !isNew ? id : 'Novo'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  disabled={true}
                />
              </div>

              <div>
                <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Marca *
                </label>
                <input
                  type="text"
                  id="marca"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Digite o nome da marca"
                  required
                  disabled={isView}
                />
              </div>

              <div>
                <label htmlFor="situacao" className="block text-sm font-medium text-gray-700 mb-1">
                  Data Situação *
                </label>
                <input
                  type="date"
                  id="situacao"
                  name="situacao"
                  value={formData.situacao}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                  disabled={isView}
                />
              </div>
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

          {/* Botões de ação - Sempre à direita */}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
              disabled={submitting}
            >
              {isView ? 'Voltar' : 'Cancelar'}
            </button>
            {!isView && (
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                {submitting ? (
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
    </div>
  );
};

export default MarcaForm; 