import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import EntityLink from '../../components/EntityLink';
import { getCidade, createCidade, updateCidade } from '../../services/cidadeService';
import { getEstados } from '../../services/estadoService';
import { Cidade, Estado } from '../../types';

const CidadeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Considerar novo se o ID for 'novo' OU se estiver na rota '/cidades/novo'
  const isNew = id === 'novo' || location.pathname === '/cidades/novo' || !id;
  
  console.log('CidadeForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<Omit<Cidade, 'id' | 'estado'> & { estadoId: string }>({
    nome: '',
    estadoId: '',
  });
  
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);
  const [estadoSelecionado, setEstadoSelecionado] = useState<Estado | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar lista de estados
        const estadosData = await getEstados();
        setEstados(estadosData);
        
        // Se for edição, buscar dados da cidade
        if (!isNew && id) {
          const cidadeData = await getCidade(Number(id));
          if (!cidadeData) {
            throw new Error('Cidade não encontrada');
          }
          
          setFormData({
            nome: cidadeData.nome,
            estadoId: String(cidadeData.estado.id),
          });
          
          setEstadoSelecionado(cidadeData.estado);
          setUltimaModificacao(cidadeData.ultimaModificacao);
          setDataCadastro(cidadeData.dataCadastro);
          
          console.log('Datas recebidas:', {
            dataCadastro: cidadeData.dataCadastro,
            ultimaModificacao: cidadeData.ultimaModificacao
          });
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
    const { name, value } = e.target;
    
    if (name === 'estadoId') {
      const estadoId = value;
      setFormData((prev) => ({
        ...prev,
        estadoId,
      }));
      
      const estado = estados.find(e => String(e.id) === estadoId) || null;
      setEstadoSelecionado(estado);
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
      
      if (!estadoSelecionado) {
        throw new Error('Estado não selecionado');
      }
      
      // Preparar os dados conforme esperado pelo backend
      const cidadeData: Omit<Cidade, 'id'> = {
        nome: formData.nome,
        estado: estadoSelecionado,
      };
      
      console.log('Salvando dados:', cidadeData, 'isNew:', isNew);
      
      if (isNew) {
        console.log('Criando nova cidade:', cidadeData);
        const novaCidade = await createCidade(cidadeData);
        console.log('Cidade criada:', novaCidade);
        alert('Cidade cadastrada com sucesso!');
        navigate('/cidades');
      } else if (id) {
        console.log('Atualizando cidade:', id, cidadeData);
        const cidadeAtualizada = await updateCidade(Number(id), cidadeData);
        console.log('Cidade atualizada:', cidadeAtualizada);
        alert('Cidade atualizada com sucesso!');
        navigate('/cidades');
      }
    } catch (err) {
      console.error('Erro ao salvar cidade:', err);
      setError('Erro ao salvar cidade. Verifique os dados e tente novamente.');
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

  // Mostrar spinner apenas se estiver carregando dados existentes
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Carregando dados da cidade...</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNew ? 'Nova Cidade' : 'Editar Cidade'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/cidades')}
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
            {/* Nome da cidade */}
            <FormField
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Nome da cidade"
              error={!formData.nome && error ? 'Campo obrigatório' : undefined}
            />

            {/* Estado */}
            <div>
              <div className="mb-1 flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                {estadoSelecionado && (
                  <EntityLink 
                    id={estadoSelecionado.id} 
                    label="Visualizar Estados" 
                    entityName="estados" 
                    toList={true} 
                  />
                )}
              </div>
              <FormField
                label=""
                name="estadoId"
                type="select"
                value={formData.estadoId}
                onChange={handleChange}
                required
                options={estados}
                displayKey="nome"
                error={!formData.estadoId && error ? 'Campo obrigatório' : undefined}
              />
            </div>

            {/* Mostrar informações sobre o país do estado selecionado */}
            {estadoSelecionado && estadoSelecionado.pais && (
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    País: <span className="font-medium">{estadoSelecionado.pais.nome} ({estadoSelecionado.pais.sigla})</span>
                  </p>
                  <EntityLink 
                    id={estadoSelecionado.pais.id} 
                    label="Visualizar Países" 
                    entityName="paises" 
                    toList={true} 
                  />
                </div>
              </div>
            )}
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

export default CidadeForm; 