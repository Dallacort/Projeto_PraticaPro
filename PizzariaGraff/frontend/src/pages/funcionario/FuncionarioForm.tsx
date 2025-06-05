import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getFuncionario, createFuncionario, updateFuncionario } from '../../services/funcionarioService';
import { Funcionario, Cidade, FuncaoFuncionario } from '../../types';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import CidadeModal from '../../components/modals/CidadeModal';
import FuncaoFuncionarioModal from '../../components/modals/FuncaoFuncionarioModal';
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
  idBrasileiro: string;
  salario: string;
  situacao: string;
  nacionalidade: string;
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
    idBrasileiro: '',
    salario: '',
    situacao: '',
    nacionalidade: '',
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
  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [isFuncaoModalOpen, setIsFuncaoModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isNew && id) {
          const funcionarioData = await getFuncionario(Number(id));
          if (!funcionarioData) {
            throw new Error('Funcionário não encontrado');
          }
          
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
            idBrasileiro: funcionarioData.idBrasileiro ? String(funcionarioData.idBrasileiro) : '',
            salario: funcionarioData.salario ? String(funcionarioData.salario) : '',
            situacao: funcionarioData.situacao || '',
            nacionalidade: funcionarioData.nacionalidade ? String(funcionarioData.nacionalidade) : '',
            dataNascimento: funcionarioData.dataNascimento ? String(funcionarioData.dataNascimento) : '',
            dataAdmissao: funcionarioData.dataAdmissao || '',
            dataDemissao: funcionarioData.dataDemissao || '',
            cidadeId: funcionarioData.cidadeId ? String(funcionarioData.cidadeId) : '',
            funcaoFuncionarioId: funcionarioData.funcaoFuncionarioId ? String(funcionarioData.funcaoFuncionarioId) : '',
            ativo: funcionarioData.ativo !== undefined ? funcionarioData.ativo : true,
          });
          
          if (funcionarioData.cidade) {
            setCidadeSelecionada(funcionarioData.cidade);
          }
          
          if (funcionarioData.funcaoFuncionario) {
            setFuncaoSelecionada(funcionarioData.funcaoFuncionario);
          }
          
          setUltimaModificacao(funcionarioData.ultimaModificacao || funcionarioData.dataAlteracao);
          setDataCadastro(funcionarioData.dataCadastro || funcionarioData.dataCriacao);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados do funcionário.');
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
    if (!formData.cidadeId) errors.push("Cidade é obrigatória");
    
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
        throw new Error('Cidade deve ser selecionada.');
      }
      
      const funcionarioPayload: any = {
        funcionario: formData.funcionario,
        apelido: formData.apelido,
        cpfCpnj: formData.cpfCpnj,
        rgInscricaoEstadual: formData.rgInscricaoEstadual,
        email: formData.email,
        telefone: formData.telefone,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cep: formData.cep,
        cnh: formData.cnh,
        dataValidadeCnh: formData.dataValidadeCnh,
        sexo: formData.sexo ? Number(formData.sexo) : null,
        observacao: formData.observacao,
        estadoCivil: formData.estadoCivil ? Number(formData.estadoCivil) : null,
        idBrasileiro: formData.idBrasileiro ? Number(formData.idBrasileiro) : null,
        salario: formData.salario ? Number(formData.salario) : null,
        situacao: formData.situacao,
        nacionalidade: formData.nacionalidade ? Number(formData.nacionalidade) : null,
        dataNascimento: formData.dataNascimento ? Number(formData.dataNascimento) : null,
        dataAdmissao: formData.dataAdmissao,
        dataDemissao: formData.dataDemissao,
        cidadeId: Number(formData.cidadeId),
        funcaoFuncionarioId: formData.funcaoFuncionarioId ? Number(formData.funcaoFuncionarioId) : null,
      };
      
      if (isNew) {
        await createFuncionario(funcionarioPayload);
        alert('Funcionário cadastrado com sucesso!');
      } else if (id) {
        await updateFuncionario(Number(id), funcionarioPayload);
        alert('Funcionário atualizado com sucesso!');
      }
      navigate('/funcionarios');
    } catch (err: any) {
      console.error('Erro ao salvar funcionário:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao salvar funcionário. Verifique os dados e tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/funcionarios');
  };

  const handleOpenCidadeModal = () => setIsCidadeModalOpen(true);
  const handleCloseCidadeModal = () => setIsCidadeModalOpen(false);

  const handleSelectCidade = (cidade: Cidade) => {
    setCidadeSelecionada(cidade);
    setFormData(prev => ({
      ...prev,
      cidadeId: String(cidade.id),
    }));
  };

  const handleOpenFuncaoModal = () => setIsFuncaoModalOpen(true);
  const handleCloseFuncaoModal = () => setIsFuncaoModalOpen(false);

  const handleSelectFuncao = (funcao: FuncaoFuncionario) => {
    setFuncaoSelecionada(funcao);
    setFormData(prev => ({
      ...prev,
      funcaoFuncionarioId: String(funcao.id),
    }));
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNew ? 'Novo Funcionário' : 'Editar Funcionário'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
          {/* Dados Básicos */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Dados Básicos</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Habilitado</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
            
            {/* Linha 1: Código, Sexo, Nome, Apelido */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  value={isNew ? "Novo" : id || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="1">Masculino</option>
                  <option value="2">Feminino</option>
                </select>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funcionário <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="funcionario"
                  value={formData.funcionario}
                  onChange={handleChange}
                  placeholder="Ex: João Silva"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Apelido</label>
                <input
                  type="text"
                  name="apelido"
                  value={formData.apelido}
                  onChange={handleChange}
                  placeholder="Ex: João"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Linha 2: Endereço, Número, Complemento, Bairro, CEP, Cidade */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Ex: Rua das Indústrias"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="1500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="Ex: Apto 101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="Ex: Vila Industrial"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <div className="flex">
                  <input
                    type="text"
                    value={cidadeSelecionada ? cidadeSelecionada.nome : ''}
                    readOnly
                    placeholder="Selecione..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleOpenCidadeModal}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                  >
                    <FaSearch className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Linha 3: Telefone, Email, CNH, Data Validade CNH */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(41) 99999-9999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="funcionario@empresa.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">CNH</label>
                <input
                  type="text"
                  name="cnh"
                  value={formData.cnh}
                  onChange={handleChange}
                  placeholder="00000000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Validade CNH</label>
                <input
                  type="date"
                  name="dataValidadeCnh"
                  value={formData.dataValidadeCnh}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Linha 4: RG/I.E., CPF/CNPJ, Salário, Função */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">RG/I.E.</label>
                <input
                  type="text"
                  name="rgInscricaoEstadual"
                  value={formData.rgInscricaoEstadual}
                  onChange={handleChange}
                  placeholder="Ex: 12345678901"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF/CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cpfCpnj"
                  value={formData.cpfCpnj}
                  onChange={handleChange}
                  placeholder="000.000.000/0000-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Salário</label>
                <input
                  type="number"
                  name="salario"
                  value={formData.salario}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                <div className="flex">
                  <input
                    type="text"
                    value={funcaoSelecionada ? funcaoSelecionada.descricao : ''}
                    readOnly
                    placeholder="Selecione..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleOpenFuncaoModal}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                  >
                    <FaSearch className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Linha 5: Data Nascimento, Estado Civil, Data Admissão, Data Demissão */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano Nascimento</label>
                <input
                  type="number"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  placeholder="1990"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                <select
                  name="estadoCivil"
                  value={formData.estadoCivil}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="1">Solteiro(a)</option>
                  <option value="2">Casado(a)</option>
                  <option value="3">Divorciado(a)</option>
                  <option value="4">Viúvo(a)</option>
                  <option value="5">União Estável</option>
                </select>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Admissão</label>
                <input
                  type="date"
                  name="dataAdmissao"
                  value={formData.dataAdmissao}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Demissão</label>
                <input
                  type="date"
                  name="dataDemissao"
                  value={formData.dataDemissao}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Situação</label>
                <input
                  type="date"
                  name="situacao"
                  value={formData.situacao}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Observações */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                name="observacao"
                value={formData.observacao}
                onChange={handleChange}
                rows={4}
                placeholder="Observações gerais sobre o funcionário"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

             {/* Rodapé do formulário com informações de registro e botões */}
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

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin mr-2 inline" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modais */}
      <CidadeModal
        isOpen={isCidadeModalOpen}
        onClose={handleCloseCidadeModal}
        onSelect={handleSelectCidade}
      />

      <FuncaoFuncionarioModal
        isOpen={isFuncaoModalOpen}
        onClose={handleCloseFuncaoModal}
        onSelect={handleSelectFuncao}
        selectedFuncaoId={funcaoSelecionada?.id}
      />
    </div>
  );
};

export default FuncionarioForm; 