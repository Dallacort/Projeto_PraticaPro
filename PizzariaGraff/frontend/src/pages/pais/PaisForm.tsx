import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getPais, createPais, updatePais } from '../../services/paisService';
import { Pais } from '../../types';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

const PaisForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Considerar novo se o ID for 'novo' OU se estiver na rota '/paises/novo'
  const isNew = id === 'novo' || location.pathname === '/paises/novo' || !id;
  
  console.log('PaisForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<Omit<Pais, 'id'>>({
    nome: '',
    sigla: '',
    codigo: '',
    nacionalidade: '',
    ativo: true
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para armazenar dados da entidade original, incluindo datas
  const [entityData, setEntityData] = useState<{
    dataCadastro?: string;
    ultimaModificacao?: string;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (isNew) return;
      
      try {
        setLoading(true);
        setError(null);
        
        if (id) {
          console.log(`Carregando dados do país com ID: ${id}`);
          const paisData = await getPais(Number(id));
          console.log('Dados recebidos do país:', paisData);
          
          if (paisData) {
            setFormData({
              nome: paisData.nome,
              sigla: paisData.sigla,
              codigo: paisData.codigo,
              nacionalidade: paisData.nacionalidade || '',
              ativo: paisData.ativo !== undefined ? paisData.ativo : true
            });
            
            // Guardar as datas no estado separado
            setEntityData({
              dataCadastro: paisData.dataCadastro,
              ultimaModificacao: paisData.ultimaModificacao
            });
            
            console.log('Datas definidas no estado:', {
              dataCadastro: paisData.dataCadastro,
              ultimaModificacao: paisData.ultimaModificacao
            });
          } else {
            throw new Error('País não encontrado');
          }
        }
      } catch (err: any) {
        console.error('Erro ao carregar país:', err);
        const errorMessage = err.response?.data?.mensagem || err.message || 'Erro ao carregar os dados do país.';
        setError(errorMessage);
        toast.error(errorMessage);
        setTimeout(() => {
          navigate('/paises');
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
    } else if (name === 'sigla') {
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

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.nome) errors.push("Nome é obrigatório");
    if (!formData.sigla) errors.push("Sigla é obrigatória");
    if (!formData.codigo) errors.push("Código é obrigatório");
    if (!formData.nacionalidade) errors.push("Nacionalidade é obrigatória");
    
    // Validações de tamanho
    if (formData.nome && formData.nome.length > 25) 
      errors.push("Nome deve ter no máximo 25 caracteres");
    
    if (formData.sigla && formData.sigla.length !== 2) 
      errors.push("Sigla deve ter exatamente 2 caracteres");
    
    if (formData.codigo && formData.codigo.length !== 3)
      errors.push("Código deve ter exatamente 3 caracteres");
    
    if (formData.nacionalidade && formData.nacionalidade.length > 25)
      errors.push("Nacionalidade deve ter no máximo 25 caracteres");
    
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

    try {
      setSaving(true);
      setError(null);
      
      if (isNew) {
        console.log('Criando novo país:', formData);
        const novoPais = await createPais(formData);
        console.log('País criado:', novoPais);
        toast.success('País cadastrado com sucesso!');
        navigate('/paises');
      } else if (id) {
        console.log('Atualizando país:', id, formData);
        const paisAtualizado = await updatePais(Number(id), formData);
        console.log('País atualizado:', paisAtualizado);
        toast.success('País atualizado com sucesso!');
        navigate('/paises');
      }
    } catch (err: any) {
      console.error('Erro ao salvar país:', err);
      // Extrair mensagem de erro da API se disponível
      const errorMessage = err.response?.data?.mensagem || err.response?.data?.erro || err.message || 'Erro ao salvar país. Verifique os dados e tente novamente.';
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
        <span className="ml-3">Carregando dados do país...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-4xl w-full mx-auto my-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">
          {isNew ? 'Novo País' : 'Editar País'}
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
                onChange={() => {}} // Campo é somente leitura
                disabled={true}
              />
              
              <FormField
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Nome do país"
                error={!formData.nome && error ? 'Campo obrigatório' : undefined}
              />
              
              <div className="grid grid-cols-2 gap-4 col-span-1">
                <FormField
                  label="Sigla"
                  name="sigla"
                  value={formData.sigla}
                  onChange={handleChange}
                  required
                  maxLength={2}
                  placeholder="BR"
                  error={(!formData.sigla || (formData.sigla.length !== 2)) && error 
                    ? 'Sigla deve ter exatamente 2 caracteres' 
                    : undefined}
                />
                
                <FormField
                  label="Código"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  required
                  maxLength={3}
                  placeholder="BRA"
                  error={(!formData.codigo || (formData.codigo.length !== 3)) && error 
                    ? 'Código deve ter exatamente 3 caracteres' 
                    : undefined}
                />
              </div>
              
              <FormField
                label="Nacionalidade"
                name="nacionalidade"
                value={formData.nacionalidade}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Brasileira"
                error={!formData.nacionalidade && error ? 'Campo obrigatório' : undefined}
              />
            </div>
          </div>
        </div>

        {/* Rodapé do formulário com informações de registro e botões */}
        <div className="flex justify-between items-end pt-6 border-t mt-6">
          {/* Informações do Registro (apenas para edição) */}
          {!isNew && (entityData.dataCadastro || entityData.ultimaModificacao) && (
            <div className="text-sm text-gray-600">
              <h3 className="font-semibold text-gray-700 mb-1">Informações do Registro:</h3>
              {entityData.dataCadastro && (
                <p>
                  Cadastrado em: {formatDate(entityData.dataCadastro)}
                </p>
              )}
              {entityData.ultimaModificacao && (
                <p>
                  Última modificação: {formatDate(entityData.ultimaModificacao)}
                </p>
              )}
            </div>
          )}

          {/* Botões de Ação - Sempre à direita */}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/paises')}
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
    </div>
  );
};

export default PaisForm; 