import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getCidade, createCidade, updateCidade } from '../../services/cidadeService';
import { Cidade, Estado } from '../../types';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import EstadoModal from '../../components/modals/EstadoModal';
import { formatDate } from '../../utils/formatters';

const CidadeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'novo' || location.pathname === '/cidades/novo' || !id;
  
  console.log('CidadeForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<Omit<Cidade, 'id' | 'estado'> & { estadoId: string }>(({
    nome: '',
    estadoId: '',
    ativo: true,
  }) as Omit<Cidade, 'id' | 'estado'> & { estadoId: string });
  
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);
  const [estadoSelecionado, setEstadoSelecionado] = useState<Estado | null>(null);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isNew && id) {
          const cidadeData = await getCidade(Number(id));
          if (!cidadeData) {
            throw new Error('Cidade não encontrada');
          }
          
          setFormData({
            nome: cidadeData.nome,
            estadoId: String(cidadeData.estado.id),
            ativo: cidadeData.ativo !== undefined ? cidadeData.ativo : true, 
          });
          
          setEstadoSelecionado(cidadeData.estado);
          setUltimaModificacao(cidadeData.ultimaModificacao);
          setDataCadastro(cidadeData.dataCadastro);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados necessários.');
        setTimeout(() => {
          navigate('/cidades');
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
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.nome.trim()) errors.push("Nome é obrigatório");
    if (!formData.estadoId) errors.push("Estado é obrigatório");
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
      
      if (!estadoSelecionado || !formData.estadoId) {
        throw new Error('Estado não selecionado ou inválido.');
      }
      
      const cidadeDataPayload: Omit<Cidade, 'id'> = {
        nome: formData.nome,
        ativo: formData.ativo,
        estado: estadoSelecionado,
      };
      
      if (isNew) {
        await createCidade(cidadeDataPayload);
        alert('Cidade cadastrada com sucesso!');
      } else if (id) {
        await updateCidade(Number(id), cidadeDataPayload);
        alert('Cidade atualizada com sucesso!');
      }
      navigate('/cidades');
    } catch (err: any) {
      console.error('Erro ao salvar cidade:', err);
      const errorMessage = err?.response?.data?.message || 'Erro ao salvar cidade. Verifique os dados e tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEstadoModal = () => setIsEstadoModalOpen(true);
  const handleCloseEstadoModal = () => setIsEstadoModalOpen(false);

  const handleSelectEstado = (estado: Estado) => {
    setFormData(prev => ({
      ...prev,
      estadoId: String(estado.id),
    }));
    setEstadoSelecionado(estado);
    setIsEstadoModalOpen(false);
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
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-4xl w-full mx-auto my-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">
          {isNew ? 'Nova Cidade' : 'Editar Cidade'}
        </h1>
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
                  <span className="mr-2 text-sm font-medium text-gray-700">Ativo</span>
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Código"
                name="id"
                value={id && !isNew ? id : 'Novo'}
                onChange={() => {}}
                disabled={true}
              />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Nome da Cidade</label>
                </div>
                <FormField
                  label=""
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Curitiba"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <div 
                  onClick={handleOpenEstadoModal} 
                  className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 relative"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenEstadoModal()}
                >
                  <input
                    type="text"
                    readOnly
                    value={estadoSelecionado ? `${estadoSelecionado.nome} (${estadoSelecionado.uf})` : 'Selecione um estado...'}
                    className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                    placeholder="Selecione um estado..."
                  />
                  <FaSearch className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do formulário com informações de registro e botões */}
        <div className="flex justify-between items-end pt-6 border-t mt-6">
          {/* Informações do Registro (apenas para edição) */}
          {!isNew && (dataCadastro || ultimaModificacao) && (
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

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/cidades')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Cancelar
            </button>
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
          </div>
        </div>
      </form>

      <EstadoModal
        isOpen={isEstadoModalOpen}
        onClose={handleCloseEstadoModal}
        onSelect={handleSelectEstado}
      />
    </div>
  );
};

export default CidadeForm; 