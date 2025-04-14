import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getFuncionario, createFuncionario, updateFuncionario } from '../../services/funcionarioService';
import { getCidades } from '../../services/cidadeService';
import { Funcionario, Cidade } from '../../types';
import { toast } from 'react-hot-toast';

const FuncionarioForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Considerar novo se o ID for 'novo' OU se estiver na rota '/funcionarios/novo'
  const isNew = id === 'novo' || location.pathname === '/funcionarios/novo' || !id;
  
  console.log('FuncionarioForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<Omit<Funcionario, 'id' | 'cidade'> & { cidadeId: string }>({
    nome: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidadeId: '',
    cargo: '',
    salario: 0,
    dataAdmissao: '',
    dataDemissao: '',
    ativo: true
  });
  
  const [dataCadastro, setDataCadastro] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | null>(null);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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
        
        // Se for edição, buscar dados do funcionário
        if (!isNew && id) {
          const funcionarioData = await getFuncionario(Number(id));
          if (!funcionarioData) {
            throw new Error('Funcionário não encontrado');
          }
          
          // Em vez de lançar erro, vamos lidar melhor com funcionários sem cidade
          let cidadeId = '';
          
          // Se o funcionário tem cidade definida, use-a
          if (funcionarioData.cidade && funcionarioData.cidade.id) {
            cidadeId = String(funcionarioData.cidade.id);
            setCidadeSelecionada(funcionarioData.cidade);
          } 
          // Se não tem cidade definida, mas temos cidades disponíveis, use a primeira
          else if (cidadesData.length > 0) {
            cidadeId = String(cidadesData[0].id);
            setCidadeSelecionada(cidadesData[0]);
            console.log('Funcionário sem cidade definida, usando a primeira cidade disponível:', cidadesData[0].nome);
          }
          
          setFormData({
            nome: funcionarioData.nome,
            cpf: funcionarioData.cpf,
            rg: funcionarioData.rg || '',
            dataNascimento: funcionarioData.dataNascimento || '',
            email: funcionarioData.email || '',
            telefone: funcionarioData.telefone || '',
            endereco: funcionarioData.endereco || '',
            numero: funcionarioData.numero || '',
            complemento: funcionarioData.complemento || '',
            bairro: funcionarioData.bairro || '',
            cep: funcionarioData.cep || '',
            cidadeId: cidadeId,
            cargo: funcionarioData.cargo || '',
            salario: funcionarioData.salario || 0,
            dataAdmissao: funcionarioData.dataAdmissao || '',
            dataDemissao: funcionarioData.dataDemissao || '',
            ativo: funcionarioData.ativo !== false
          });
          
          // Guardar datas para exibição
          setDataCadastro(funcionarioData.dataCadastro || null);
          setUltimaModificacao(funcionarioData.ultimaModificacao || null);
          
          console.log('Datas recebidas:', {
            dataCadastro: funcionarioData.dataCadastro,
            ultimaModificacao: funcionarioData.ultimaModificacao
          });
        } else {
          // Para novo funcionário, definir uma cidade padrão se houver cidades disponíveis
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
          navigate('/funcionarios');
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
    } else if (name === 'salario') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value),
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
    if (!formData.cpf) errors.push("CPF é obrigatório");
    if (!formData.cidadeId) errors.push("Cidade é obrigatória");
    if (!formData.cargo) errors.push("Cargo é obrigatório");
    
    // Validação básica de CPF (apenas verifica o comprimento)
    const cpfClean = formData.cpf.replace(/[^\d]/g, '');
    if (cpfClean.length !== 11) {
      errors.push("CPF deve ter 11 dígitos");
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    try {
      // Verificações de campos obrigatórios
      if (!formData.nome.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (!formData.cpf.trim()) {
        throw new Error('CPF é obrigatório');
      }

      if (!formData.cargo.trim()) {
        throw new Error('Cargo é obrigatório');
      }

      if (!formData.cidadeId) {
        throw new Error('Cidade é obrigatória');
      }

      // Validar formato da data de nascimento
      if (formData.dataNascimento && !/^\d{4}-\d{2}-\d{2}$/.test(formData.dataNascimento)) {
        throw new Error('Data de Nascimento deve estar no formato YYYY-MM-DD');
      }

      if (!cidadeSelecionada) {
        throw new Error('Cidade é obrigatória');
      }

      const funcionarioToSave: Omit<Funcionario, 'id'> = {
        ...formData,
        // Garante que todos os campos estejam definidos corretamente
        nome: formData.nome.trim(),
        rg: formData.rg || '',
        dataNascimento: formData.dataNascimento || '',
        cpf: formData.cpf,
        email: formData.email || '',
        telefone: formData.telefone || '',
        endereco: formData.endereco || '',
        numero: formData.numero || '',
        complemento: formData.complemento || '',
        bairro: formData.bairro || '',
        cep: formData.cep || '',
        cidade: cidadeSelecionada,
        cargo: formData.cargo,
        salario: Number(formData.salario) || 0,
        dataAdmissao: formData.dataAdmissao || '',
        dataDemissao: formData.dataDemissao || '',
        ativo: formData.ativo
      };

      // Remover a propriedade cidadeId que não faz parte da interface Funcionario
      delete (funcionarioToSave as any).cidadeId;

      if (id) {
        await updateFuncionario(Number(id), funcionarioToSave);
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        await createFuncionario(funcionarioToSave);
        toast.success('Funcionário cadastrado com sucesso!');
      }
      navigate('/funcionarios');
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      setFormError(error instanceof Error ? error.message : 'Erro ao salvar funcionário');
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3">Carregando dados do funcionário...</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNew ? 'Novo Funcionário' : 'Editar Funcionário'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {!isNew && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Informações do Registro</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Data de Cadastro</p>
                <p className="font-medium text-gray-800">{formatDate(dataCadastro)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última Modificação</p>
                <p className="font-medium text-gray-800">{formatDate(ultimaModificacao)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">Dados Pessoais</h2>
            
            <FormField
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
            
            <FormField
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
            />
            
            <FormField
              label="RG"
              name="rg"
              value={formData.rg}
              onChange={handleChange}
              placeholder="00.000.000-0"
            />
            
            <FormField
              label="Data de Nascimento"
              name="dataNascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={handleChange}
            />
            
            <FormField
              label="E-mail"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            
            <FormField
              label="Telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
            />

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Ativo</span>
              </label>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">Dados Profissionais</h2>
            
            <FormField
              label="Cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
            />
            
            <FormField
              label="Salário"
              name="salario"
              type="number"
              value={formData.salario.toString()}
              onChange={handleChange}
            />
            
            <FormField
              label="Data de Admissão"
              name="dataAdmissao"
              type="date"
              value={formData.dataAdmissao}
              onChange={handleChange}
            />
            
            <FormField
              label="Data de Demissão"
              name="dataDemissao"
              type="date"
              value={formData.dataDemissao}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Endereço</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  label="CEP"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between">
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
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="flex items-center justify-between">
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
                    className="mt-1.5 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed" 
                    value={cidadeSelecionada.estado.nome + (cidadeSelecionada.estado.uf ? ` (${cidadeSelecionada.estado.uf})` : '')}
                    disabled
                  />
                )}
              </div>
              
              <div>
                <div className="flex items-center justify-between">
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
                    className="mt-1.5 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed" 
                    value={cidadeSelecionada.estado.pais.nome}
                    disabled
                  />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="md:col-span-2">
                <FormField
                  label="Endereço"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                />
              </div>
              
              <FormField
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
              />
              
              <FormField
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 space-x-3">
          <button
            type="button"
            onClick={() => navigate('/funcionarios')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            {saving ? (
              <>
                <span className="mr-2">Salvando...</span>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FuncionarioForm; 