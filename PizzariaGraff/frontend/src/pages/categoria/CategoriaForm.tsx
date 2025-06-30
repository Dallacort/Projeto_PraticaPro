import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getCategoriaById, createCategoria, updateCategoria } from '../../services/categoriaService';
import { Categoria } from '../../types';
import FormField from '../../components/FormField';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

const CategoriaForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditing = id !== 'novo' && id !== undefined;
  const isViewing = location.pathname.includes('/visualizar');

  const [categoria, setCategoria] = useState<Partial<Categoria>>({
    categoria: '',
    ativo: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      loadCategoria(parseInt(id));
    }
  }, [id, isEditing]);

  const loadCategoria = async (categoriaId: number) => {
    try {
      setLoading(true);
      const data = await getCategoriaById(categoriaId);
      setCategoria(data);
    } catch (err) {
      toast.error('Erro ao carregar categoria');
      navigate('/categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;

    if (!categoria.categoria || categoria.categoria.trim() === '') {
      setError('Nome da categoria é obrigatório.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        categoria: categoria.categoria!,
        ativo: categoria.ativo ?? true
      };

      if (isEditing) {
        await updateCategoria(parseInt(id!), payload);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await createCategoria(payload);
        toast.success('Categoria criada com sucesso!');
      }

      navigate('/categorias');
    } catch (err) {
      toast.error(isEditing ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Categoria, value: any) => {
    setCategoria(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getTitle = () => {
    if (isViewing) return 'Visualizar Categoria';
    if (isEditing) return 'Editar Categoria';
    return 'Nova Categoria';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-4xl w-full mx-auto my-6">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">{getTitle()}</h1>
        {isViewing && isEditing && (
          <button
            onClick={() => navigate(`/categorias/${id}/editar`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="border-b pb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Informações da Categoria</h2>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <span className="mr-2 text-sm font-medium text-gray-700">Ativo</span>
                <input
                  type="checkbox"
                  checked={categoria.ativo ?? true}
                  onChange={(e) => handleChange('ativo', e.target.checked)}
                  disabled={isViewing}
                  className="sr-only"
                />
                <div className="relative">
                  <div className={`block w-14 h-8 rounded-full ${categoria.ativo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${categoria.ativo ? 'translate-x-6' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Código"
              name="id"
              type="text"
              value={isEditing ? id : 'Novo'}
              onChange={() => {}}
              disabled
            />
            <div className="md:col-span-2">
              <FormField
                label="Nome da Categoria"
                name="categoria"
                type="text"
                value={categoria.categoria || ''}
                onChange={(value) => handleChange('categoria', value)}
                error={error && error.includes('categoria') ? error : ''}
                required
                maxLength={60}
                placeholder="Ex: Pizzas, Bebidas, Sobremesas"
                disabled={isViewing}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-500">
            {isEditing && (
              <>
                <p>Data de Criação: {formatDate(categoria.dataCriacao)}</p>
                <p>Última Alteração: {formatDate(categoria.dataAlteracao)}</p>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/categorias')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {isViewing ? 'Voltar' : 'Cancelar'}
            </button>
            {!isViewing && (
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving && <FaSpinner className="animate-spin mr-2" />}
                {saving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Salvar')}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CategoriaForm; 