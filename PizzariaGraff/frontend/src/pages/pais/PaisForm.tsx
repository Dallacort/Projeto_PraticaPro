import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getPais, createPais, updatePais } from '../../services/paisService';
import { Pais } from '../../types';

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
          const paisData = await getPais(id);
          if (paisData) {
            setFormData({
              nome: paisData.nome,
              sigla: paisData.sigla,
              codigo: paisData.codigo,
            });
            setUltimaModificacao(paisData.ultimaModificacao);
            setDataCadastro(paisData.dataCadastro);
            
            console.log('Datas recebidas:', {
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
    const { name, value } = e.target;
    
    if (name === 'sigla') {
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
    
    // Validações específicas
    if (formData.sigla && formData.sigla.length !== 2) 
      errors.push("Sigla deve ter exatamente 2 caracteres");
    
    if (formData.codigo && formData.codigo.length !== 3)
      errors.push("Código deve ter exatamente 3 caracteres");
    
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
      
      if (isNew) {
        console.log('Criando novo país:', formData);
        const novoPais = await createPais(formData);
        console.log('País criado:', novoPais);
        alert('País cadastrado com sucesso!');
        navigate('/paises');
      } else if (id) {
        console.log('Atualizando país:', id, formData);
        const paisAtualizado = await updatePais(id, formData);
        console.log('País atualizado:', paisAtualizado);
        alert('País atualizado com sucesso!');
        navigate('/paises');
      }
    } catch (err: any) {
      console.error('Erro ao salvar país:', err);
      // Extrair mensagem de erro da API se disponível
      const errorMessage = err.response?.data?.mensagem || err.response?.data?.erro || err.message || 'Erro ao salvar país. Verifique os dados e tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Erro ao formatar data:', err);
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Carregando dados do país...</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNew ? 'Novo País' : 'Editar País'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/paises')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          Voltar
        </button>
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
            {/* Nome ocupa a largura completa */}
            <FormField
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Nome do país"
              error={!formData.nome && error ? 'Campo obrigatório' : undefined}
            />
            
            {/* Layout otimizado: Sigla e Código lado a lado */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Sigla"
                name="sigla"
                value={formData.sigla}
                onChange={handleChange}
                required
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
                placeholder="BRA"
                error={(!formData.codigo || (formData.codigo.length !== 3)) && error 
                  ? 'Código deve ter exatamente 3 caracteres' 
                  : undefined}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
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

export default PaisForm; 