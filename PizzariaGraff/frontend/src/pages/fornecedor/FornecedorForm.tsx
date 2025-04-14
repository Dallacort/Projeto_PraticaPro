import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getFornecedor, createFornecedor, updateFornecedor } from '../../services/fornecedorService';
import { getCidades } from '../../services/cidadeService';
import { Fornecedor, Cidade } from '../../types';

const FornecedorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Considerar novo se o ID for 'novo' OU se estiver na rota '/fornecedores/novo'
  const isNew = id === 'novo' || location.pathname === '/fornecedores/novo' || !id;
  
  console.log('FornecedorForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<Omit<Fornecedor, 'id' | 'cidade'> & { cidadeId: string }>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidadeId: '',
    ativo: true
  });
  
  const [dataCadastro, setDataCadastro] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | null>(null);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar lista de cidades
        const cidadesData = await getCidades();
        console.log('Cidades recebidas:', cidadesData);
        
        if (cidadesData.length === 0) {
          setError('Não foi possível carregar a lista de cidades. Por favor, cadastre uma cidade primeiro.');
          setTimeout(() => {
            navigate('/cidades');
          }, 3000);
          return;
        }
        
        setCidades(cidadesData);
        
        // Se for edição, buscar dados do fornecedor
        if (!isNew && id) {
          const fornecedorData = await getFornecedor(Number(id));
          if (!fornecedorData) {
            throw new Error('Fornecedor não encontrado');
          }
          
          // Em vez de lançar erro, vamos lidar melhor com fornecedores sem cidade
          let cidadeId = '';
          
          // Se o fornecedor tem cidade definida, use-a
          if (fornecedorData.cidade && fornecedorData.cidade.id) {
            cidadeId = String(fornecedorData.cidade.id);
            setCidadeSelecionada(fornecedorData.cidade);
          } 
          // Se não tem cidade definida, mas temos cidades disponíveis, use a primeira
          else if (cidadesData.length > 0) {
            cidadeId = String(cidadesData[0].id);
            setCidadeSelecionada(cidadesData[0]);
            console.log('Fornecedor sem cidade definida, usando a primeira cidade disponível:', cidadesData[0].nome);
          }
          
          setFormData({
            razaoSocial: fornecedorData.razaoSocial,
            nomeFantasia: fornecedorData.nomeFantasia,
            cnpj: fornecedorData.cnpj,
            email: fornecedorData.email || '',
            telefone: fornecedorData.telefone || '',
            endereco: fornecedorData.endereco || '',
            numero: fornecedorData.numero || '',
            complemento: fornecedorData.complemento || '',
            bairro: fornecedorData.bairro || '',
            cep: fornecedorData.cep || '',
            cidadeId: cidadeId,
            ativo: fornecedorData.ativo !== false
          });
          
          // Guardar datas para exibição
          setDataCadastro(fornecedorData.dataCadastro || null);
          setUltimaModificacao(fornecedorData.ultimaModificacao || null);
          
          console.log('Datas recebidas:', {
            dataCadastro: fornecedorData.dataCadastro,
            ultimaModificacao: fornecedorData.ultimaModificacao
          });
        } else {
          // Para novo fornecedor, definir uma cidade padrão se houver cidades disponíveis
          if (cidadesData.length > 0) {
            setFormData(prev => ({
              ...prev,
              cidadeId: String(cidadesData[0].id)
            }));
            setCidadeSelecionada(cidadesData[0]);
          }
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        const errorMessage = err.response?.data?.mensagem || err.message || 'Erro ao carregar os dados necessários.';
        setError(errorMessage);
        setTimeout(() => {
          navigate('/fornecedores');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'cidadeId') {
      const cidadeId = value;
      setFormData((prev) => ({
        ...prev,
        cidadeId,
      }));
      
      const cidade = cidades.find(c => String(c.id) === cidadeId) || null;
      setCidadeSelecionada(cidade);
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
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
    
    if (!formData.razaoSocial) errors.push("Razão Social é obrigatória");
    if (!formData.nomeFantasia) errors.push("Nome Fantasia é obrigatório");
    if (!formData.cnpj) errors.push("CNPJ é obrigatório");
    if (!formData.cidadeId) errors.push("Cidade é obrigatória");
    
    // Validação básica de CNPJ (apenas verifica o comprimento)
    const cnpjClean = formData.cnpj.replace(/[^\d]/g, '');
    if (cnpjClean.length !== 14) {
      errors.push("CNPJ deve ter 14 dígitos");
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
      
      if (!cidadeSelecionada) {
        throw new Error('Cidade não selecionada');
      }
      
      // Preparar os dados do fornecedor
      const fornecedorData: Omit<Fornecedor, 'id'> = {
        razaoSocial: formData.razaoSocial,
        nomeFantasia: formData.nomeFantasia,
        cnpj: formData.cnpj,
        email: formData.email,
        telefone: formData.telefone,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cep: formData.cep,
        cidade: cidadeSelecionada,
        ativo: formData.ativo,
        // As datas são gerenciadas pelo backend
      };
      
      console.log('Salvando dados:', fornecedorData, 'isNew:', isNew);
      
      if (isNew) {
        console.log('Criando novo fornecedor:', fornecedorData);
        const novoFornecedor = await createFornecedor(fornecedorData);
        console.log('Fornecedor criado:', novoFornecedor);
        alert('Fornecedor cadastrado com sucesso!');
        navigate('/fornecedores');
      } else if (id) {
        console.log('Atualizando fornecedor:', id, fornecedorData);
        const fornecedorAtualizado = await updateFornecedor(Number(id), fornecedorData);
        console.log('Fornecedor atualizado:', fornecedorAtualizado);
        alert('Fornecedor atualizado com sucesso!');
        navigate('/fornecedores');
      }
    } catch (err: any) {
      console.error('Erro ao salvar fornecedor:', err);
      // Extrair mensagem de erro da API se disponível
      const errorMessage = err.response?.data?.mensagem || err.response?.data?.erro || err.message || 'Erro ao salvar fornecedor. Verifique os dados e tente novamente.';
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
        <span className="ml-3">Carregando dados do fornecedor...</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNew ? 'Novo Fornecedor' : 'Editar Fornecedor'}
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
            {/* Dados básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Razão Social"
                name="razaoSocial"
                value={formData.razaoSocial}
                onChange={handleChange}
                required
                placeholder="Razão Social completa"
                error={!formData.razaoSocial && error ? 'Campo obrigatório' : undefined}
              />
              
              <FormField
                label="Nome Fantasia"
                name="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={handleChange}
                required
                placeholder="Nome Fantasia"
                error={!formData.nomeFantasia && error ? 'Campo obrigatório' : undefined}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="CNPJ"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                required
                placeholder="00.000.000/0001-00"
                error={!formData.cnpj && error ? 'Campo obrigatório' : undefined}
              />
            </div>

            {/* Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
              
              <FormField
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemplo@empresa.com"
              />
            </div>

            {/* Seção de Endereço */}
            <h3 className="font-medium text-gray-700 mt-2">Endereço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
              />
              
              <div>
                <div className="flex items-center justify-between mb-0">
                  <label className="block text-sm font-medium text-gray-700">Cidade</label>
                  <Link 
                    to="/cidades" 
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver todas
                  </Link>
                </div>
                <select
                  name="cidadeId"
                  value={formData.cidadeId}
                  onChange={handleChange}
                  className="mt-0 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Selecione uma cidade</option>
                  {cidades.map((cidade) => (
                    <option key={cidade.id} value={cidade.id}>
                      {cidade.nome}
                    </option>
                  ))}
                </select>
                {!formData.cidadeId && error && (
                  <p className="mt-1 text-sm text-red-600">Campo obrigatório</p>
                )}
              </div>
            </div>
            
            {/* Estado e País lado a lado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <Link 
                    to="/estados" 
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver todos
                  </Link>
                </div>
                {cidadeSelecionada?.estado && (
                  <input 
                    type="text" 
                    className="mt-1 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed" 
                    value={cidadeSelecionada.estado.nome + (cidadeSelecionada.estado.uf ? ` (${cidadeSelecionada.estado.uf})` : '')}
                    disabled
                  />
                )}
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">País</label>
                  <Link 
                    to="/paises" 
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver todos
                  </Link>
                </div>
                {cidadeSelecionada?.estado?.pais && (
                  <input 
                    type="text" 
                    className="mt-1 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed" 
                    value={cidadeSelecionada.estado.pais.nome}
                    disabled
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <FormField
                  label="Endereço"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              
              <FormField
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Nome do bairro"
              />
              
              <FormField
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                placeholder="Apto, Sala, etc."
              />
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleChange}
                  className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5 mr-2"
                />
                <span className="text-gray-700">Fornecedor Ativo</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/fornecedores')}
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

export default FornecedorForm; 