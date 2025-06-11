import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getFuncionario, createFuncionario, updateFuncionario } from '../../services/funcionarioService';
import { getNacionalidades, NacionalidadeResponse } from '../../services/nacionalidadeService';
import { Funcionario, Cidade, FuncaoFuncionario } from '../../types';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import CidadeModal from '../../components/modals/CidadeModal';
import FuncaoFuncionarioModal from '../../components/modals/FuncaoFuncionarioModal';
import NacionalidadeModal from '../../components/modals/NacionalidadeModal';
import { formatDate } from '../../utils/formatters';

interface FuncionarioFormData {
  funcionario: string;
  apelido: string;
  cpfCpnj: string;
  rgInscricaoEstadual: string;
  email: string;
  telefone: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  cnh: string;
  dataValidadeCnh: string;
  sexo: string;
  observacao: string;
  estadoCivil: string;
  salario: string;
  nacionalidadeId: string;
  dataNascimento: string;
  dataAdmissao: string;
  dataDemissao: string;
  cidadeId: string;
  funcaoFuncionarioId: string;
  ativo: boolean;
}

const FuncionarioForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'novo' || location.pathname === '/funcionarios/novo' || !id;
  
  console.log('FuncionarioForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<FuncionarioFormData>({
    funcionario: '',
    apelido: '',
    cpfCpnj: '',
    rgInscricaoEstadual: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cnh: '',
    dataValidadeCnh: '',
    sexo: '',
    observacao: '',
    estadoCivil: '',
    salario: '',
    nacionalidadeId: '',
    dataNascimento: '',
    dataAdmissao: '',
    dataDemissao: '',
    cidadeId: '',
    funcaoFuncionarioId: '',
    ativo: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(null);
  const [funcaoSelecionada, setFuncaoSelecionada] = useState<FuncaoFuncionario | null>(null);
  const [nacionalidades, setNacionalidades] = useState<NacionalidadeResponse[]>([]);
  const [nacionalidadeSelecionada, setNacionalidadeSelecionada] = useState<NacionalidadeResponse | null>(null);
  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [isFuncaoModalOpen, setIsFuncaoModalOpen] = useState(false);
  const [isNacionalidadeModalOpen, setIsNacionalidadeModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carregar nacionalidades
        const nacionalidadesData = await getNacionalidades();
        setNacionalidades(nacionalidadesData);
        
        if (!isNew && id) {
          const funcionarioData = await getFuncionario(Number(id));
          if (!funcionarioData) {
            throw new Error('Funcionário não encontrado');
          }
          
          console.log('Dados do funcionário carregados:', funcionarioData);
          
          setFormData({
            funcionario: funcionarioData.funcionario || '',
            apelido: funcionarioData.apelido || '',
            cpfCpnj: funcionarioData.cpfCpnj || '',
            rgInscricaoEstadual: funcionarioData.rgInscricaoEstadual || '',
            email: funcionarioData.email || '',
            telefone: funcionarioData.telefone || '',
            endereco: funcionarioData.endereco || '',
            numero: funcionarioData.numero || '',
            complemento: funcionarioData.complemento || '',
            bairro: funcionarioData.bairro || '',
            cep: funcionarioData.cep || '',
            cnh: funcionarioData.cnh || '',
            dataValidadeCnh: funcionarioData.dataValidadeCnh || '',
            sexo: funcionarioData.sexo ? String(funcionarioData.sexo) : '',
            observacao: funcionarioData.observacao || '',
            estadoCivil: funcionarioData.estadoCivil ? String(funcionarioData.estadoCivil) : '',
            salario: funcionarioData.salario ? String(funcionarioData.salario) : '',
            nacionalidadeId: String(funcionarioData.nacionalidadeId || ''),
            dataNascimento: funcionarioData.dataNascimento || '',
            dataAdmissao: funcionarioData.dataAdmissao || '',
            dataDemissao: funcionarioData.dataDemissao || '',
            cidadeId: String(funcionarioData.cidadeId || ''),
            funcaoFuncionarioId: String(funcionarioData.funcaoFuncionarioId || ''),
            ativo: funcionarioData.ativo !== undefined ? funcionarioData.ativo : true,
          });
          
          // Configurar cidade selecionada
          if (funcionarioData.cidade) {
            setCidadeSelecionada(funcionarioData.cidade);
          }
          
          // Configurar função selecionada
          if (funcionarioData.funcaoFuncionario) {
            setFuncaoSelecionada(funcionarioData.funcaoFuncionario);
          }
          
          // Configurar nacionalidade selecionada
          if (funcionarioData.nacionalidadeId) {
            const nacionalidade = nacionalidadesData.find(n => n.id === funcionarioData.nacionalidadeId);
            if (nacionalidade) {
              setNacionalidadeSelecionada(nacionalidade);
            }
          }
          
          setUltimaModificacao(funcionarioData.dataAlteracao);
          setDataCadastro(funcionarioData.dataCriacao);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados do funcionário.');
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
    if (!formData.funcionario?.trim()) errors.push("Nome do funcionário é obrigatório");
    if (!formData.email?.trim()) errors.push("Email é obrigatório");
    if (!cidadeSelecionada || !formData.cidadeId) errors.push("Cidade é obrigatória");
    
    if (formData.email && !formData.email.includes('@')) {
      errors.push("Email deve ter formato válido");
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
      
      if (!cidadeSelecionada || !formData.cidadeId) {
        throw new Error('Cidade não selecionada ou inválida.');
      }
      
      console.log('=== DEBUG FUNCIONÁRIO ===');
      console.log('ID da URL:', id);
      console.log('isNew:', isNew);
      console.log('pathname:', location.pathname);
      console.log('FormData original:', formData);
      console.log('Cidade selecionada:', cidadeSelecionada);
      console.log('Função selecionada:', funcaoSelecionada);
      console.log('Nacionalidade selecionada:', nacionalidadeSelecionada);
      
      const funcionarioPayload: any = {
        funcionario: formData.funcionario,
        apelido: formData.apelido || null,
        cpfCpnj: formData.cpfCpnj || null,
        rgInscricaoEstadual: formData.rgInscricaoEstadual || null,
        email: formData.email,
        telefone: formData.telefone || null,
        endereco: formData.endereco || null,
        numero: formData.numero || null,
        complemento: formData.complemento || null,
        bairro: formData.bairro || null,
        cep: formData.cep || null,
        cnh: formData.cnh || null,
        dataValidadeCnh: formData.dataValidadeCnh || null,
        sexo: formData.sexo ? Number(formData.sexo) : null,
        observacao: formData.observacao || null,
        estadoCivil: formData.estadoCivil ? Number(formData.estadoCivil) : null,
        salario: formData.salario ? Number(formData.salario) : null,
        nacionalidadeId: formData.nacionalidadeId ? Number(formData.nacionalidadeId) : null,
        dataNascimento: formData.dataNascimento || null,
        dataAdmissao: formData.dataAdmissao || null,
        dataDemissao: formData.dataDemissao || null,
        cidadeId: Number(formData.cidadeId),
        funcaoFuncionarioId: formData.funcaoFuncionarioId ? Number(formData.funcaoFuncionarioId) : null,
        ativo: Boolean(formData.ativo),
      };
      
      console.log('Payload final enviado:', funcionarioPayload);

      if (isNew) {
        console.log('Executando POST (criar novo funcionário)');
        const resultado = await createFuncionario(funcionarioPayload);
        console.log('Resultado criação:', resultado);
        alert('Funcionário cadastrado com sucesso!');
      } else if (id) {
        console.log('Executando PUT (atualizar funcionário) para ID:', id);
        const resultado = await updateFuncionario(Number(id), funcionarioPayload);
        console.log('Resultado atualização:', resultado);
        alert('Funcionário atualizado com sucesso!');
      }
      navigate('/funcionarios');
    } catch (err: any) {
      console.error('=== ERRO DETALHADO ===');
      console.error('Erro completo:', err);
      console.error('Resposta do servidor:', err?.response?.data);
      console.error('Status:', err?.response?.status);
      console.error('Headers:', err?.response?.headers);
      console.error('URL tentada:', err?.config?.url);
      console.error('Método:', err?.config?.method);
      
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao salvar funcionário. Tente novamente.';
      setError(`Erro ${err?.response?.status || 'desconhecido'}: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // Handlers para modais
  const handleOpenCidadeModal = () => setIsCidadeModalOpen(true);
  const handleCloseCidadeModal = () => setIsCidadeModalOpen(false);

  const handleSelectCidade = (cidade: Cidade) => {
    setCidadeSelecionada(cidade);
    setFormData(prev => ({
      ...prev,
      cidadeId: String(cidade.id),
    }));
    setIsCidadeModalOpen(false);
  };

  const handleOpenFuncaoModal = () => setIsFuncaoModalOpen(true);
  const handleCloseFuncaoModal = () => setIsFuncaoModalOpen(false);

  const handleSelectFuncao = (funcao: FuncaoFuncionario) => {
    setFuncaoSelecionada(funcao);
    setFormData(prev => ({
      ...prev,
      funcaoFuncionarioId: String(funcao.id),
    }));
    setIsFuncaoModalOpen(false);
  };

  const handleOpenNacionalidadeModal = () => setIsNacionalidadeModalOpen(true);
  const handleCloseNacionalidadeModal = () => setIsNacionalidadeModalOpen(false);

  const handleSelectNacionalidade = (nacionalidade: NacionalidadeResponse) => {
    setNacionalidadeSelecionada(nacionalidade);
    setFormData(prev => ({
      ...prev,
      nacionalidadeId: String(nacionalidade.id),
    }));
    setIsNacionalidadeModalOpen(false);
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
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-7xl w-full mx-auto my-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">
          {isNew ? 'Novo Funcionário' : 'Editar Funcionário'}
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
                  <span className="mr-2 text-sm font-medium text-gray-700">Habilitado</span>
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
            
            {/* Primeira linha: Código, Função, Funcionário, Apelido, Estado Civil */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '100px 200px 2fr 1.5fr 1.5fr' }}>
              <FormField
                label="Código"
                name="id"
                value={id && !isNew ? id : 'Novo'}
                onChange={() => {}}
                disabled={true}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                <div 
                  onClick={handleOpenFuncaoModal} 
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 relative h-10"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenFuncaoModal()}
                >
                  <input
                    type="text"
                    readOnly
                    value={funcaoSelecionada ? funcaoSelecionada.funcaoFuncionario : 'Selecione...'}
                    className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                    placeholder="Selecione..."
                  />
                  <FaSearch className="text-gray-500" />
                </div>
              </div>

              <FormField
                label="Funcionário *"
                name="funcionario"
                value={formData.funcionario}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Nome completo do funcionário"
              />

              <FormField
                label="Apelido"
                name="apelido"
                value={formData.apelido}
                onChange={handleChange}
                maxLength={50}
                placeholder="Como é conhecido"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                <select
                  name="estadoCivil"
                  value={formData.estadoCivil}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10"
                >
                  <option value="">Selecionar...</option>
                  <option value="1">Solteiro</option>
                  <option value="2">Casado</option>
                  <option value="3">Divorciado</option>
                  <option value="4">Viúvo</option>
                  <option value="5">União Estável</option>
                </select>
              </div>
            </div>

            {/* Segunda linha: Endereço, Número, Complemento, Bairro, CEP, Cidade */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '3fr 150px 1.5fr 1.5fr 120px 2fr' }}>
              <FormField
                label="Endereço"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                maxLength={50}
                placeholder="Rua, Avenida, etc."
              />

              <FormField
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                maxLength={10}
                placeholder="123A"
              />

              <FormField
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                maxLength={50}
                placeholder="Apto, Bloco, etc."
              />

              <FormField
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                maxLength={50}
                placeholder="Nome do bairro"
              />

              <FormField
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                maxLength={8}
                placeholder="00000000"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <div 
                  onClick={handleOpenCidadeModal} 
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 relative h-10"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenCidadeModal()}
                >
                  <input
                    type="text"
                    readOnly
                    value={cidadeSelecionada ? cidadeSelecionada.nome : 'Selecione...'}
                    className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                    placeholder="Selecione..."
                  />
                  <FaSearch className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Terceira linha: Telefone, Email, Sexo, Data Nascimento, Nacionalidade */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '150px 2fr 120px 150px 1.5fr' }}>
              <FormField
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                maxLength={11}
                placeholder="11999999999"
              />

              <FormField
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="funcionario@email.com"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10"
                >
                  <option value="">Selecionar...</option>
                  <option value="1">Masculino</option>
                  <option value="2">Feminino</option>
                </select>
              </div>

              <FormField
                label="Data Nascimento"
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade</label>
                <div 
                  onClick={handleOpenNacionalidadeModal} 
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 relative h-10"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenNacionalidadeModal()}
                >
                  <input
                    type="text"
                    readOnly
                    value={nacionalidadeSelecionada ? nacionalidadeSelecionada.nacionalidade : 'Selecione...'}
                    className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                    placeholder="Selecione..."
                  />
                  <FaSearch className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Quarta linha: RG, CPF, CNH, Data Validade CNH, Salário */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '150px 180px 150px 150px 150px' }}>
              <FormField
                label="RG"
                name="rgInscricaoEstadual"
                value={formData.rgInscricaoEstadual}
                onChange={handleChange}
                maxLength={12}
                placeholder="000000000"
              />

              <FormField
                label="CPF"
                name="cpfCpnj"
                value={formData.cpfCpnj}
                onChange={handleChange}
                maxLength={14}
                placeholder="000.000.000-00"
              />

              <FormField
                label="CNH"
                name="cnh"
                value={formData.cnh}
                onChange={handleChange}
                maxLength={11}
                placeholder="00000000000"
              />

              <FormField
                label="Validade CNH"
                name="dataValidadeCnh"
                type="date"
                value={formData.dataValidadeCnh}
                onChange={handleChange}
              />

              <FormField
                label="Salário"
                name="salario"
                type="number"
                step="0.01"
                value={formData.salario}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            {/* Quinta linha: Data Admissão, Data Demissão */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '150px 150px 1fr' }}>
              <FormField
                label="Data Admissão"
                name="dataAdmissao"
                type="date"
                value={formData.dataAdmissao}
                onChange={handleChange}
              />

              <FormField
                label="Data Demissão"
                name="dataDemissao"
                type="date"
                value={formData.dataDemissao}
                onChange={handleChange}
              />

              <div></div>
            </div>

            {/* Sexta linha: Observação */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <textarea
                  name="observacao"
                  value={formData.observacao}
                  onChange={handleChange}
                  maxLength={250}
                  placeholder="Observações gerais sobre o funcionário"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end pt-6 border-t mt-6">
          {/* Informações do Registro (sempre que existirem datas) */}
          {(dataCadastro || ultimaModificacao) && (
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

          {/* Botões de Ação - Sempre à direita */}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/funcionarios')}
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

      <CidadeModal
        isOpen={isCidadeModalOpen}
        onClose={handleCloseCidadeModal}
        onSelect={handleSelectCidade}
      />

      <FuncaoFuncionarioModal
        isOpen={isFuncaoModalOpen}
        onClose={handleCloseFuncaoModal}
        onSelect={handleSelectFuncao}
      />

      <NacionalidadeModal
        isOpen={isNacionalidadeModalOpen}
        onClose={handleCloseNacionalidadeModal}
        onSelect={handleSelectNacionalidade}
      />
    </div>
  );
};

export default FuncionarioForm; 