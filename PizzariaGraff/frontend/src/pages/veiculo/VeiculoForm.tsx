import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getVeiculo, createVeiculo, updateVeiculo } from '../../services/veiculoService';
import { getTransportadoras } from '../../services/transportadoraService';
import { Veiculo, Transportadora } from '../../types';

const VeiculoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Considerar novo se o ID for 'novo' OU se estiver na rota '/veiculos/novo'
  const isNew = id === 'novo' || location.pathname === '/veiculos/novo' || !id;
  
  console.log('VeiculoForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<Omit<Veiculo, 'id' | 'transportadora'> & { transportadoraId: string }>({
    descricao: '',
    placa: '',
    transportadoraId: '',
    dataCadastro: '',
    ultimaModificacao: ''
  });
  
  const [dataCadastro, setDataCadastro] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | null>(null);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<Transportadora | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar lista de transportadoras
        const transportadorasData = await getTransportadoras();
        console.log('Transportadoras recebidas:', transportadorasData);
        
        if (transportadorasData.length === 0) {
          setError('Não foi possível carregar a lista de transportadoras. Por favor, cadastre uma transportadora primeiro.');
          setTimeout(() => {
            navigate('/transportadoras');
          }, 3000);
          return;
        }
        
        setTransportadoras(transportadorasData);
        
        // Se for edição, buscar dados do veículo
        if (!isNew && id) {
          const veiculoData = await getVeiculo(Number(id));
          if (!veiculoData) {
            throw new Error('Veículo não encontrado');
          }
          
          // Em vez de lançar erro, vamos lidar melhor com veículos sem transportadora
          let transportadoraId = '';
          
          // Se o veículo tem transportadora definida, use-a
          if (veiculoData.transportadora && veiculoData.transportadora.id) {
            transportadoraId = String(veiculoData.transportadora.id);
            setTransportadoraSelecionada(veiculoData.transportadora);
          } 
          // Se não tem transportadora definida, mas temos transportadoras disponíveis, use a primeira
          else if (transportadorasData.length > 0) {
            transportadoraId = String(transportadorasData[0].id);
            setTransportadoraSelecionada(transportadorasData[0]);
            console.log('Veículo sem transportadora definida, usando a primeira transportadora disponível:', transportadorasData[0].razaoSocial);
          }
          
          setFormData({
            descricao: veiculoData.descricao,
            placa: veiculoData.placa,
            transportadoraId: transportadoraId,
            dataCadastro: veiculoData.dataCadastro || '',
            ultimaModificacao: veiculoData.ultimaModificacao || ''
          });
          
          // Guardar datas para exibição
          setDataCadastro(veiculoData.dataCadastro || null);
          setUltimaModificacao(veiculoData.ultimaModificacao || null);
        } else {
          // Para novo veículo, definir uma transportadora padrão se houver transportadoras disponíveis
          if (transportadorasData.length > 0) {
            setFormData(prev => ({
              ...prev,
              transportadoraId: String(transportadorasData[0].id)
            }));
            setTransportadoraSelecionada(transportadorasData[0]);
          }
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        const errorMessage = err.response?.data?.mensagem || err.message || 'Erro ao carregar os dados necessários.';
        setError(errorMessage);
        setTimeout(() => {
          navigate('/veiculos');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew, navigate]);

  useEffect(() => {
    const transportadora = transportadoras.find((t) => t.id === Number(formData.transportadoraId));
    setTransportadoraSelecionada(transportadora || null);
  }, [formData.transportadoraId, transportadoras]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'transportadoraId') {
      const transportadoraId = value;
      setFormData((prev) => ({
        ...prev,
        transportadoraId,
      }));
      
      const transportadora = transportadoras.find(t => String(t.id) === transportadoraId) || null;
      setTransportadoraSelecionada(transportadora);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.descricao) errors.push("Descrição é obrigatória");
    if (!formData.placa) errors.push("Placa é obrigatória");
    if (!formData.transportadoraId) errors.push("Transportadora é obrigatória");
    
    // Validação básica de placa (formato brasileiro: AAA-0000 ou AAA0A00)
    const placaRegex = /^[A-Z]{3}[-\s]?[0-9][A-Z0-9][0-9]{2}$/;
    if (formData.placa && !placaRegex.test(formData.placa.toUpperCase())) {
      errors.push("Placa deve estar no formato AAA-0000 ou AAAA000");
    }
    
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
      
      if (!transportadoraSelecionada) {
        throw new Error('Transportadora não selecionada');
      }
      
      // Preparar os dados do veículo
      const veiculoData: Omit<Veiculo, 'id'> = {
        descricao: formData.descricao,
        placa: formData.placa.toUpperCase(),
        transportadora: transportadoraSelecionada,
        dataCadastro: formData.dataCadastro,
        ultimaModificacao: formData.ultimaModificacao
      };
      
      console.log('Salvando dados:', veiculoData, 'isNew:', isNew);
      
      if (isNew) {
        console.log('Criando novo veículo:', veiculoData);
        const novoVeiculo = await createVeiculo(veiculoData);
        console.log('Veículo criado:', novoVeiculo);
        alert('Veículo cadastrado com sucesso!');
        navigate('/veiculos');
      } else if (id) {
        console.log('Atualizando veículo:', id, veiculoData);
        const veiculoAtualizado = await updateVeiculo(Number(id), veiculoData);
        console.log('Veículo atualizado:', veiculoAtualizado);
        alert('Veículo atualizado com sucesso!');
        navigate('/veiculos');
      }
    } catch (err: any) {
      console.error('Erro ao salvar veículo:', err);
      // Extrair mensagem de erro da API se disponível
      const errorMessage = err.response?.data?.mensagem || err.response?.data?.erro || err.message || 'Erro ao salvar veículo. Verifique os dados e tente novamente.';
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
        <span className="ml-3">Carregando dados do veículo...</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNew ? 'Novo Veículo' : 'Editar Veículo'}
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
              label="Placa"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              required
              placeholder="AAA-0000"
              error={!formData.placa && error ? 'Campo obrigatório' : undefined}
            />
            
            <FormField
              label="Descrição"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              placeholder="Modelo e características do veículo"
              error={!formData.descricao && error ? 'Campo obrigatório' : undefined}
            />
            
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 ">Transportadora</label>
                
                <Link 
                  to="/transportadoras" 
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200 "
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver todas
                </Link>
              </div>
              <select
                name="transportadoraId"
                value={formData.transportadoraId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md "
                required
              >
                <option value="">Selecione uma transportadora</option>
                {transportadoras.map((transportadora) => (
                  <option key={transportadora.id} value={transportadora.id}>
                    {transportadora.razaoSocial || transportadora.nomeFantasia}
                  </option>
                ))}
              </select>
              {!formData.transportadoraId && error && (
                <p className="mt-1 text-sm text-red-600">Campo obrigatório</p>
              )}
            </div>
            
            {transportadoraSelecionada && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Informações da Transportadora Selecionada:</h4>
                <div className="text-sm">
                  <p><span className="font-semibold">Razão Social:</span> {transportadoraSelecionada.razaoSocial}</p>
                  <p><span className="font-semibold">Nome Fantasia:</span> {transportadoraSelecionada.nomeFantasia}</p>
                  <p><span className="font-semibold">CNPJ:</span> {transportadoraSelecionada.cnpj}</p>
                  {transportadoraSelecionada.cidade && (
                    <p>
                      <span className="font-semibold">Cidade:</span>{' '}
                      {transportadoraSelecionada.cidade.nome}
                      {transportadoraSelecionada.cidade.estado && transportadoraSelecionada.cidade.estado.uf ? 
                        ` (${transportadoraSelecionada.cidade.estado.uf})` : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/veiculos')}
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

export default VeiculoForm; 