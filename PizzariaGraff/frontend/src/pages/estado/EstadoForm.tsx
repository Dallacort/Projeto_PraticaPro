import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import EntityLink from '../../components/EntityLink';
import { getEstado, createEstado, updateEstado } from '../../services/estadoService';
import { getPaises } from '../../services/paisService';
import { Estado, Pais } from '../../types';

const EstadoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Considerar novo se o ID for 'novo' OU se estiver na rota '/estados/novo'
  const isNew = id === 'novo' || location.pathname === '/estados/novo' || !id;
  
  console.log('EstadoForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<Omit<Estado, 'id' | 'pais'> & { paisId: string }>({
    nome: '',
    uf: '',
    paisId: '',
  });
  
  const [paises, setPaises] = useState<Pais[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);
  const [paisSelecionado, setPaisSelecionado] = useState<Pais | null>(null);

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
            paisId: estadoData.pais.id,
          });
          setPaisSelecionado(estadoData.pais);
          setUltimaModificacao(estadoData.ultimaModificacao);
          setDataCadastro(estadoData.dataCadastro);
          
          console.log('Datas recebidas:', {
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
    const { name, value } = e.target;
    
    if (name === 'paisId') {
      const paisId = value;
      setFormData((prev) => ({
        ...prev,
        paisId,
      }));
      
      const pais = paises.find(p => p.id === paisId) || null;
      setPaisSelecionado(pais);
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
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      if (!formData.paisId) {
        throw new Error('País não selecionado');
      }
      
      // Preparar os dados do estado com o ID do país
      const estadoData = {
        nome: formData.nome,
        uf: formData.uf.toUpperCase(),
        pais: {
          id: formData.paisId,
          nome: paisSelecionado?.nome || '',
          codigo: paisSelecionado?.codigo || '',
          sigla: paisSelecionado?.sigla || ''
        },
      };
      
      console.log('Salvando dados:', estadoData, 'isNew:', isNew);
      
      if (isNew) {
        console.log('Criando novo estado:', estadoData);
        const novoEstado = await createEstado(estadoData);
        console.log('Estado criado:', novoEstado);
        alert('Estado cadastrado com sucesso!');
        navigate('/estados');
      } else if (id) {
        console.log('Atualizando estado:', id, estadoData);
        const estadoAtualizado = await updateEstado(Number(id), estadoData);
        console.log('Estado atualizado:', estadoAtualizado);
        alert('Estado atualizado com sucesso!');
        navigate('/estados');
      }
    } catch (err: any) {
      console.error('Erro ao salvar estado:', err);
      // Extrair mensagem de erro da API se disponível
      const errorMessage = err.response?.data?.mensagem || err.response?.data?.erro || err.message || 'Erro ao salvar estado. Verifique os dados e tente novamente.';
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
        <span className="ml-3">Carregando dados do estado...</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNew ? 'Novo Estado' : 'Editar Estado'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/estados')}
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
            {/* Layout otimizado: Nome e UF lado a lado */}
            <div className="grid grid-cols-3 gap-4">
              {/* Nome ocupa 2/3 do espaço */}
              <div className="col-span-2">
                <FormField
                  label="Nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  placeholder="Nome do estado"
                  error={!formData.nome && error ? 'Campo obrigatório' : undefined}
                />
              </div>
              
              {/* UF ocupa 1/3 do espaço */}
              <div className="col-span-1">
                <FormField
                  label="UF"
                  name="uf"
                  value={formData.uf}
                  onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                  required
                  placeholder="SP"
                  error={!formData.uf && error ? 'Campo obrigatório' : undefined}
                />
              </div>
            </div>

            {/* País */}
            <div>
              <div className="mb-1 flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  País
                </label>
                {paisSelecionado && (
                  <EntityLink 
                    id={paisSelecionado.id} 
                    label="Visualizar País" 
                    entityName="paises" 
                    toList={true}
                  />
                )}
              </div>
              <FormField
                label=""
                name="paisId"
                type="select"
                value={formData.paisId}
                onChange={handleChange}
                required
                options={paises}
                displayKey="nome"
                error={!formData.paisId && error ? 'Campo obrigatório' : undefined}
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

export default EstadoForm; 