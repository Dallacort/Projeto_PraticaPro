import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import EntityLink from '../../components/EntityLink';
import { getEstado, createEstado, updateEstado } from '../../services/estadoService';
import { getPaises, createPais } from '../../services/paisService';
import { Estado, Pais } from '../../types';
import { toast } from 'react-toastify';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';
import PaisModal from '../../components/PaisModal';

const EstadoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Considerar novo se o ID for 'novo' OU se estiver na rota '/estados/novo'
  const isNew = id === 'novo' || location.pathname === '/estados/novo' || !id;
  
  console.log('EstadoForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<Omit<Estado, 'id' | 'pais'> & { paisId: number | null }>({
    nome: '',
    uf: '',
    paisId: null,
    ativo: true
  });
  
  const [paises, setPaises] = useState<Pais[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paisSelecionado, setPaisSelecionado] = useState<Pais | null>(null);
  const [isPaisModalOpen, setIsPaisModalOpen] = useState(false);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);
  
  // Estado para armazenar dados da entidade original, incluindo datas
  const [entityData, setEntityData] = useState<{
    dataCadastro?: string;
    ultimaModificacao?: string;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar lista de países
        const paisesData = await getPaises();
        console.log('Países recebidos:', paisesData);
        
        if (paisesData.length === 0) {
          setError('Não foi possível carregar a lista de países. Por favor, cadastre um país primeiro.');
          toast.error('É necessário cadastrar um país antes de cadastrar um estado.');
          setTimeout(() => {
            navigate('/paises');
          }, 3000);
          return;
        }
        
        setPaises(paisesData);
        
        // Se for edição, buscar dados do estado
        if (!isNew && id) {
          const estadoData = await getEstado(Number(id));
          if (!estadoData) {
            throw new Error('Estado não encontrado');
          }
          
          // Verificar se os dados do estado incluem um país válido
          if (!estadoData.pais || !estadoData.pais.id) {
            throw new Error('Estado com dados incompletos: país não definido');
          }
          
          setFormData({
            nome: estadoData.nome,
            uf: estadoData.uf,
            paisId: estadoData.paisId || estadoData.pais?.id || null,
            ativo: estadoData.ativo !== undefined ? estadoData.ativo : true
          });
          setPaisSelecionado(estadoData.pais);
          
          // Guardar as datas no estado separado
          setEntityData({
            dataCadastro: estadoData.dataCadastro,
            ultimaModificacao: estadoData.ultimaModificacao
          });
          
        } else {
          // Para novo estado, definir um país padrão se houver países disponíveis
          if (paisesData.length > 0) {
            setFormData(prev => ({
              ...prev,
              paisId: paisesData[0].id
            }));
            setPaisSelecionado(paisesData[0]);
          }
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        const errorMessage = err.response?.data?.mensagem || err.message || 'Erro ao carregar os dados necessários.';
        setError(errorMessage);
        toast.error(errorMessage);
        setTimeout(() => {
          navigate('/estados');
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
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'uf') {
      setFormData((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOpenPaisModal = () => {
    setIsPaisModalOpen(true);
  };

  const handleClosePaisModal = () => {
    setIsPaisModalOpen(false);
  };

  const handleSelectPais = (pais: Pais) => {
    setFormData(prev => ({
      ...prev,
      paisId: pais.id
    }));
    setPaisSelecionado(pais);
    setIsPaisModalOpen(false);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.nome) errors.push("Nome é obrigatório");
    if (!formData.uf) errors.push("UF é obrigatória");
    if (!formData.paisId) errors.push("País é obrigatório");
    
    // Validações específicas
    if (formData.uf && formData.uf.length !== 2) 
      errors.push("UF deve ter exatamente 2 caracteres");
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      toast.error(validationErrors.join(". "));
      return;
    }

    if (!formData.paisId) {
      setError("País deve ser selecionado");
      toast.error("País deve ser selecionado");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const estadoPayload = {
        nome: formData.nome,
        uf: formData.uf,
        paisId: Number(formData.paisId),
        ativo: formData.ativo
      };
      
      if (isNew) {
        console.log('Criando novo estado:', estadoPayload);
        const novoEstado = await createEstado(estadoPayload);
        console.log('Estado criado:', novoEstado);
        toast.success('Estado cadastrado com sucesso!');
        navigate('/estados');
      } else if (id) {
        console.log('Atualizando estado:', id, estadoPayload);
        const estadoAtualizado = await updateEstado(Number(id), estadoPayload);
        console.log('Estado atualizado:', estadoAtualizado);
        toast.success('Estado atualizado com sucesso!');
        navigate('/estados');
      }
    } catch (err: any) {
      console.error('Erro ao salvar estado:', err);
      const errorMessage = err.response?.data?.mensagem || err.response?.data?.erro || err.message || 'Erro ao salvar estado. Verifique os dados e tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-primary">
          <FaSpinner className="animate-spin h-12 w-12" />
        </div>
        <span className="ml-3">Carregando dados do estado...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-4xl w-full mx-auto my-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">
          {isNew ? 'Novo Estado' : 'Editar Estado'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados básicos */}
          <div className="col-span-1 md:col-span-2 border-b pb-4">
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
                value={id && id !== 'novo' ? id : 'Novo - Gerado automaticamente'}
                onChange={() => {}}
                disabled={true}
              />
              
              <FormField
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Nome do estado"
                error={!formData.nome && error ? 'Campo obrigatório' : undefined}
              />
              
              <FormField
                label="UF"
                name="uf"
                value={formData.uf}
                onChange={handleChange}
                required
                placeholder="SP"
                error={(!formData.uf || (formData.uf.length !== 2)) && error 
                  ? 'UF deve ter exatamente 2 caracteres' 
                  : undefined}
              />
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País <span className="text-red-500">*</span>
                </label>
                <div 
                  className={`w-full p-2 border rounded-md flex justify-between items-center cursor-pointer 
                  ${!formData.paisId ? 'border-red-500' : 'border-gray-300'} 
                  bg-white hover:border-blue-500`}
                  onClick={handleOpenPaisModal}
                >
                  <span className={`${!paisSelecionado ? 'text-gray-400' : 'text-gray-800'}`}>
                    {paisSelecionado ? paisSelecionado.nome : 'Selecione um país...'}
                  </span>
                  <FaSearch className="text-gray-400" />
                </div>
                {!formData.paisId && error && (
                  <p className="text-red-500 text-xs mt-1">País é obrigatório</p>
                )}
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

      {/* Modal de seleção de país */}
      <PaisModal
        isOpen={isPaisModalOpen}
        onClose={handleClosePaisModal}
        onSelect={handleSelectPais}
      />
    </div>
  );
};

export default EstadoForm; 