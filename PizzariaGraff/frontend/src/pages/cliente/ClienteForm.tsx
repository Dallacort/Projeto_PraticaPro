import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getCliente, createCliente, updateCliente } from '../../services/clienteService';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';
import { getNacionalidades, NacionalidadeResponse } from '../../services/nacionalidadeService';
import { Cliente, Cidade, CondicaoPagamento } from '../../types';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import CidadeModal from '../../components/modals/CidadeModal';
import CondicaoPagamentoModal from '../../components/modals/CondicaoPagamentoModal';
import NacionalidadeModal from '../../components/modals/NacionalidadeModal';
import { formatDate } from '../../utils/formatters';
import { Validators } from '../../utils/validators';

interface ClienteFormData {
  cliente: string;
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
  nacionalidadeId: string;
  dataNascimento: string;
  estadoCivil: string;
  sexo: string;
  tipo: number;
  limiteCredito: number;
  observacao: string;
  cidadeId: string;
  condicaoPagamentoId: string;
  ativo: boolean;
}

const ClienteForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'novo' || location.pathname === '/clientes/novo' || !id;
  
  console.log('ClienteForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<ClienteFormData>({
    cliente: '',
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
    nacionalidadeId: '',
    dataNascimento: '',
    estadoCivil: '',
    sexo: '',
    tipo: 1,
    limiteCredito: 0,
    observacao: '',
    cidadeId: '',
    condicaoPagamentoId: '',
    ativo: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(null);
  const [condicaoPagamentoSelecionada, setCondicaoPagamentoSelecionada] = useState<CondicaoPagamento | null>(null);
  const [nacionalidades, setNacionalidades] = useState<NacionalidadeResponse[]>([]);
  const [nacionalidadeSelecionada, setNacionalidadeSelecionada] = useState<NacionalidadeResponse | null>(null);
  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [isCondicaoPagamentoModalOpen, setIsCondicaoPagamentoModalOpen] = useState(false);
  const [isNacionalidadeModalOpen, setIsNacionalidadeModalOpen] = useState(false);
  const [forceRender, setForceRender] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carregar nacionalidades
        const nacionalidadesData = await getNacionalidades();
        setNacionalidades(nacionalidadesData);
        
        if (!isNew && id) {
          const clienteData = await getCliente(Number(id));
          if (!clienteData) {
            throw new Error('Cliente não encontrado');
          }
          
          console.log('Dados do cliente carregados:', clienteData);
          
          setFormData({
            cliente: clienteData.cliente || clienteData.nome || '',
            apelido: clienteData.apelido || '',
            cpfCpnj: clienteData.cpfCpnj || clienteData.cpfCnpj || '',
            rgInscricaoEstadual: clienteData.rgInscricaoEstadual || clienteData.inscricaoEstadual || '',
            email: clienteData.email || '',
            telefone: clienteData.telefone || '',
            endereco: clienteData.endereco || '',
            numero: clienteData.numero || '',
            complemento: clienteData.complemento || '',
            bairro: clienteData.bairro || '',
            cep: clienteData.cep || '',
            nacionalidadeId: String(clienteData.nacionalidadeId || ''),
            dataNascimento: clienteData.dataNascimento || '',
            estadoCivil: clienteData.estadoCivil || '',
            sexo: clienteData.sexo || '',
            tipo: clienteData.tipo || 1,
            limiteCredito: Number(clienteData.limiteCredito) || 0,
            observacao: clienteData.observacao || '',
            cidadeId: String(clienteData.cidade?.id || ''),
            condicaoPagamentoId: String(clienteData.condicaoPagamentoId || ''),
            ativo: clienteData.ativo !== undefined ? clienteData.ativo : true, 
          });
          
          // Configurar cidade selecionada
          if (clienteData.cidade) {
            setCidadeSelecionada(clienteData.cidade);
          }
          
          // Configurar nacionalidade selecionada
          if (clienteData.nacionalidadeId) {
            const nacionalidadeEncontrada = nacionalidadesData.find(nac => nac.id === clienteData.nacionalidadeId);
            if (nacionalidadeEncontrada) {
              setNacionalidadeSelecionada(nacionalidadeEncontrada);
            }
          }
          
          // Configurar condição de pagamento selecionada
          if (clienteData.condicaoPagamentoId && clienteData.condicaoPagamentoNome) {
            setCondicaoPagamentoSelecionada({
              id: clienteData.condicaoPagamentoId,
              condicaoPagamento: clienteData.condicaoPagamentoNome,
              numeroParcelas: 1,
              diasPrimeiraParcela: 0,
              diasEntreParcelas: 0,
              ativo: true
            });
          }
          
          setUltimaModificacao(clienteData.ultimaModificacao || clienteData.dataAlteracao);
          setDataCadastro(clienteData.dataCadastro || clienteData.dataCriacao);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados necessários.');
        setTimeout(() => {
          navigate('/clientes');
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
    
    setFormData(prev => {
      let newValue: any;
      
      // Tratamento especial para diferentes tipos de campos
      if (type === 'checkbox') {
        newValue = checked;
      } else if (type === 'number') {
        newValue = Number(value);
      } else if (name === 'tipo') {
        // Garantir que o campo tipo seja sempre um número
        newValue = Number(value);
      } else {
        newValue = value;
      }
      
      const newData = {
        ...prev,
        [name]: newValue,
      };
      
      // Se o tipo de pessoa mudou, limpar os campos CPF/CNPJ e RG/Inscrição Estadual para evitar problemas de validação
      if (name === 'tipo') {
        newData.cpfCpnj = '';
        newData.rgInscricaoEstadual = '';
        // Forçar re-renderização
        setForceRender(prev => prev + 1);
      }
      
      // Se é o campo CPF/CNPJ, verificar se está dentro do limite correto para o tipo atual
      if (name === 'cpfCpnj') {
        const maxLength = newData.tipo === 1 ? 11 : 14;
        const cleanValue = value.replace(/[^\d]/g, '');
        if (cleanValue.length <= maxLength) {
          newData.cpfCpnj = cleanValue;
        } else {
          // Se exceder o limite, cortar o valor
          newData.cpfCpnj = cleanValue.substring(0, maxLength);
        }
      }
      
      return newData;
    });
  };

  // Função para determinar o label do campo CPF/CNPJ baseado no tipo
  const getCpfCnpjLabel = () => {
    const isBrasileiro = nacionalidadeSelecionada?.id === 1;
    const asterisco = isBrasileiro ? ' *' : '';
    return formData.tipo === 1 ? `CPF${asterisco}` : `CNPJ${asterisco}`;
  };

  const getCpfCnpjPlaceholder = () => {
    return formData.tipo === 1 ? '000.000.000-00' : '00.000.000/0001-00';
  };

  const getCpfCnpjMaxLength = () => {
    return formData.tipo === 1 ? 11 : 14;
  };

  // Função para determinar o label do campo RG/Inscrição Estadual baseado no tipo
  const getRgInscricaoLabel = () => {
    return formData.tipo === 1 ? 'RG *' : 'Inscrição Estadual *';
  };

  const getRgInscricaoPlaceholder = () => {
    return formData.tipo === 1 ? '000000000' : '000000000000';
  };

  const getRgInscricaoMaxLength = () => {
    return formData.tipo === 1 ? 12 : 14;
  };

  // Funções de validação usando a classe Validators


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação do formulário usando a classe Validators
    const isBrasileiro = nacionalidadeSelecionada?.id === 1;
    
    const validations = [
      () => Validators.validateRequired(formData.cliente, "Nome"),
      () => Validators.validateRequired(formData.cidadeId, "Cidade"),
      () => Validators.validateRequired(formData.tipo.toString(), "Tipo"),
      () => Validators.validateRequired(formData.limiteCredito.toString(), "Limite de Crédito"),
      () => Validators.validateRequired(formData.condicaoPagamentoId, "Condição de Pagamento"),
      // RG/Inscrição Estadual é obrigatório
      () => Validators.validateRequired(formData.rgInscricaoEstadual, formData.tipo === 1 ? "RG" : "Inscrição Estadual"),
      // CPF/CNPJ é obrigatório e validado apenas para brasileiros
      () => {
        if (isBrasileiro) {
          return Validators.validateCpfCnpj(formData.cpfCpnj, formData.tipo, true);
        }
        // Para não brasileiros, é opcional
        if (formData.cpfCpnj?.trim()) {
          return Validators.validateCpfCnpj(formData.cpfCpnj, formData.tipo, false);
        }
        return { isValid: true };
      },
      // Email é opcional, mas se preenchido deve ser válido
      () => {
        if (formData.email?.trim()) {
          return Validators.validateEmail(formData.email);
        }
        return { isValid: true };
      }
    ];
    
    const errors = Validators.validateMultiple(validations);
    
    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      if (!cidadeSelecionada || !formData.cidadeId) {
        throw new Error('Cidade não selecionada ou inválida.');
      }
      
      if (!condicaoPagamentoSelecionada || !formData.condicaoPagamentoId) {
        throw new Error('Condição de Pagamento não selecionada ou inválida.');
      }
      
      // Para não brasileiros, enviar CPF/CNPJ como null se estiver vazio
      const isBrasileiro = nacionalidadeSelecionada?.id === 1;
      const cpfCnpjValue = formData.cpfCpnj?.trim() ? formData.cpfCpnj : (isBrasileiro ? formData.cpfCpnj : null);
      
      const clienteDataPayload: any = {
        cliente: formData.cliente,
        apelido: formData.apelido,
        cpfCpnj: cpfCnpjValue,
        rgInscricaoEstadual: formData.rgInscricaoEstadual,
        email: formData.email,
        telefone: formData.telefone,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cep: formData.cep,
        nacionalidadeId: Number(formData.nacionalidadeId) || null,
        dataNascimento: formData.dataNascimento,
        estadoCivil: formData.estadoCivil,
        sexo: formData.sexo,
        tipo: Number(formData.tipo),
        limiteCredito: Number(formData.limiteCredito),
        observacao: formData.observacao,
        ativo: Boolean(formData.ativo),
        cidade: cidadeSelecionada,
        condicaoPagamentoId: formData.condicaoPagamentoId,
      };
      
      console.log('Payload enviado:', clienteDataPayload);
      console.log('Status ativo:', formData.ativo, 'Tipo:', typeof formData.ativo);

      if (isNew) {
        await createCliente(clienteDataPayload);
        alert('Cliente cadastrado com sucesso!');
      } else if (id) {
        await updateCliente(Number(id), clienteDataPayload);
        alert('Cliente atualizado com sucesso!');
      }
      navigate('/clientes');
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err);
      const errorMessage = err?.response?.data?.message || 'Erro ao salvar cliente. Verifique os dados e tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCidadeModal = () => setIsCidadeModalOpen(true);
  const handleCloseCidadeModal = () => setIsCidadeModalOpen(false);

  const handleSelectCidade = (cidade: Cidade) => {
    setFormData(prev => ({
      ...prev,
      cidadeId: String(cidade.id),
    }));
    setCidadeSelecionada(cidade);
    setIsCidadeModalOpen(false);
  };

  const handleOpenCondicaoPagamentoModal = () => setIsCondicaoPagamentoModalOpen(true);
  const handleCloseCondicaoPagamentoModal = () => setIsCondicaoPagamentoModalOpen(false);

  const handleSelectCondicaoPagamento = (condicaoPagamento: CondicaoPagamento) => {
    setFormData(prev => ({
      ...prev,
      condicaoPagamentoId: String(condicaoPagamento.id),
    }));
    setCondicaoPagamentoSelecionada(condicaoPagamento);
    setIsCondicaoPagamentoModalOpen(false);
  };

  const handleOpenNacionalidadeModal = () => setIsNacionalidadeModalOpen(true);
  const handleCloseNacionalidadeModal = () => setIsNacionalidadeModalOpen(false);

  const handleSelectNacionalidade = (nacionalidade: NacionalidadeResponse) => {
    setFormData(prev => ({
      ...prev,
      nacionalidadeId: String(nacionalidade.id),
    }));
    setNacionalidadeSelecionada(nacionalidade);
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
          {isNew ? 'Novo Cliente' : 'Editar Cliente'}
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
            
            {/* Primeira linha: Código, Tipo, Cliente, Apelido, Estado Civil */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '100px 150px 2fr 1.5fr 1.5fr' }}>
              <FormField
                label="Código"
                name="id"
                value={id && !isNew ? id : 'Novo'}
                onChange={() => {}}
                disabled={true}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10"
                  required
                >
                  <option value={1}>Pessoa Física</option>
                  <option value={2}>Pessoa Jurídica</option>
                </select>
              </div>

              <FormField
                label="Cliente *"
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Nome completo do cliente"
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
                  <option value="Solteiro">Solteiro</option>
                  <option value="Casado">Casado</option>
                  <option value="Divorciado">Divorciado</option>
                  <option value="Viúvo">Viúvo</option>
                  <option value="União Estável">União Estável</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                <div 
                  onClick={handleOpenCidadeModal} 
                  className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 relative"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenCidadeModal()}
                >
                  <input
                    type="text"
                    readOnly
                    value={cidadeSelecionada ? `${cidadeSelecionada.nome} - ${cidadeSelecionada.estado?.uf}` : 'Selecione...'}
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
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={50}
                placeholder="cliente@email.com"
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
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
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

            {/* Quarta linha: RG/Inscrição Estadual, CPF/CNPJ, Limite de Crédito, Condição de Pagamento */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '180px 180px 150px 2fr' }}>
              <FormField
                key={`rgInscricao-${formData.tipo}-${forceRender}`} // Força re-renderização quando tipo muda
                label={getRgInscricaoLabel()}
                name="rgInscricaoEstadual"
                value={formData.rgInscricaoEstadual}
                onChange={handleChange}
                required
                maxLength={getRgInscricaoMaxLength()}
                placeholder={getRgInscricaoPlaceholder()}
              />

              <FormField
                key={`cpfCnpj-${formData.tipo}-${forceRender}`} // Força re-renderização quando tipo muda
                label={getCpfCnpjLabel()}
                name="cpfCpnj"
                value={formData.cpfCpnj}
                onChange={handleChange}
                required={nacionalidadeSelecionada?.id === 1} // Só obrigatório para brasileiros
                maxLength={getCpfCnpjMaxLength()}
                placeholder={getCpfCnpjPlaceholder()}
              />

              <FormField
                label="Limite de Crédito *"
                name="limiteCredito"
                type="number"
                step="0.01"
                value={formData.limiteCredito}
                onChange={handleChange}
                placeholder="0.00"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condição de Pagamento *</label>
                <div 
                  onClick={handleOpenCondicaoPagamentoModal} 
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 relative h-10"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenCondicaoPagamentoModal()}
                >
                  <input
                    type="text"
                    readOnly
                    value={condicaoPagamentoSelecionada ? condicaoPagamentoSelecionada.condicaoPagamento : 'Selecione...'}
                    className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                    placeholder="Selecione..."
                  />
                  <FaSearch className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Quinta linha: Observação */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <textarea
                  name="observacao"
                  value={formData.observacao}
                  onChange={handleChange}
                  maxLength={250}
                  placeholder="Observações gerais sobre o cliente"
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
              onClick={() => navigate('/clientes')}
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

      <CondicaoPagamentoModal
        isOpen={isCondicaoPagamentoModalOpen}
        onClose={handleCloseCondicaoPagamentoModal}
        onSelect={handleSelectCondicaoPagamento}
      />

      <NacionalidadeModal
        isOpen={isNacionalidadeModalOpen}
        onClose={handleCloseNacionalidadeModal}
        onSelect={handleSelectNacionalidade}
      />
    </div>
  );
};

export default ClienteForm; 