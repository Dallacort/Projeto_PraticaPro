import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import { 
  getModalidadeNfe,
  createModalidadeNfe,
  updateModalidadeNfe,
  mockModalidadesNfe
} from '../../services/modalidadeNfeService';

const ModalidadeNfeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'novo' || location.pathname === '/modalidades-nfe/novo' || !id;
  
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    ativo: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (isNew) return;
      
      try {
        setLoading(true);
        setError(null);
        
        if (id) {
          const modalidadeData = await getModalidadeNfe(id);
          if (modalidadeData) {
            setFormData({
              codigo: modalidadeData.codigo,
              descricao: modalidadeData.descricao,
              ativo: modalidadeData.ativo,
            });
            setUltimaModificacao(modalidadeData.ultimaModificacao);
            setDataCadastro(modalidadeData.dataCadastro);
          }
        }
      } catch (err: any) {
        console.error('Erro ao carregar modalidade:', err);
        setError('Falha ao carregar dados da modalidade');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.descricao) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      if (isNew) {
        await createModalidadeNfe(formData);
        alert('Modalidade de NFe cadastrada com sucesso!');
      } else if (id) {
        await updateModalidadeNfe(id, formData);
        alert('Modalidade de NFe atualizada com sucesso!');
      }
      navigate('/modalidades-nfe');
    } catch (err: any) {
      console.error('Erro ao salvar modalidade:', err);
      setError('Erro ao salvar modalidade');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">
          {isNew ? 'Cadastrar Modalidade de NFe' : 'Editar Modalidade de NFe'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-6 shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Digite a descrição"
              required
            />
            {error && !formData.descricao && (
              <p className="text-red-500 text-xs mt-1">Campo obrigatório</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="ativo"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded shadow-sm"
              />
              <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                Ativo
              </label>
            </div>
          </div>
        </div>

        {!isNew && (
          <div className="mt-4 text-sm text-gray-500">
            <p>Criado em: {formatDate(dataCadastro)}</p>
            <p>Última modificação: {formatDate(ultimaModificacao)}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={() => navigate('/modalidades-nfe')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 shadow-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 shadow-sm"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModalidadeNfeForm; 