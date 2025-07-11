import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getFornecedor, createFornecedor, updateFornecedor } from '../../services/fornecedorService';
import { Fornecedor, Cidade, CondicaoPagamento, Transportadora } from '../../types';
import { FaSpinner, FaSearch, FaPlus } from 'react-icons/fa';
import CidadeModal from '../../components/modals/CidadeModal';
import CondicaoPagamentoModal from '../../components/modals/CondicaoPagamentoModal';
import NacionalidadeModal from '../../components/modals/NacionalidadeModal';
import TransportadoraModal from '../../components/modals/TransportadoraModal';
import TelefonesModal from '../../components/modals/TelefonesModal';
import EmailsModal from '../../components/modals/EmailsModal';
import { formatDate } from '../../utils/formatters';
import { Validators } from '../../utils/validators';
import { NacionalidadeResponse, getNacionalidades } from '../../services/nacionalidadeService';
import { getTransportadoras } from '../../services/transportadoraService';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';

interface FornecedorFormData {
  fornecedor: string;
  apelido: string;
  cpfCnpj: string;
  rgInscricaoEstadual: string;
  email: string;
  telefone: string;
  telefonesAdicionais: string[];
  emailsAdicionais: string[];
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  tipo: number;
  observacoes: string;
  limiteCredito: number;

  cidadeId: string;
  condicaoPagamentoId: string;
  nacionalidadeId: string;
  transportadoraId: string;
  ativo: boolean;
}

const FornecedorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'novo' || location.pathname === '/fornecedores/novo' || !id;
  
  console.log('FornecedorForm - ID:', id, 'isNew:', isNew, 'pathname:', location.pathname);

  const [formData, setFormData] = useState<FornecedorFormData>({
    fornecedor: '',
    apelido: '',
    cpfCnpj: '',
    rgInscricaoEstadual: '',
    email: '',
    telefone: '',
    telefonesAdicionais: [],
    emailsAdicionais: [],
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    tipo: 2, // Padrão Pessoa Jurídica
    observacoes: '',
    limiteCredito: 0,
    cidadeId: '',
    condicaoPagamentoId: '',
    nacionalidadeId: '',
    transportadoraId: '',
    ativo: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaModificacao, setUltimaModificacao] = useState<string | undefined>(undefined);
  const [dataCadastro, setDataCadastro] = useState<string | undefined>(undefined);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(null);
  const [condicaoPagamentoSelecionada, setCondicaoPagamentoSelecionada] = useState<CondicaoPagamento | null>(null);
  const [nacionalidadeSelecionada, setNacionalidadeSelecionada] = useState<NacionalidadeResponse | null>(null);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<Transportadora | null>(null);
  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [isCondicaoPagamentoModalOpen, setIsCondicaoPagamentoModalOpen] = useState(false);
  const [isNacionalidadeModalOpen, setIsNacionalidadeModalOpen] = useState(false);
  const [isTransportadoraModalOpen, setIsTransportadoraModalOpen] = useState(false);
  const [isTelefonesModalOpen, setIsTelefonesModalOpen] = useState(false);
  const [isEmailsModalOpen, setIsEmailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isNew && id) {
          const fornecedorData = await getFornecedor(Number(id));
          if (!fornecedorData) {
            throw new Error('Fornecedor não encontrado');
          }
          
          setFormData({
            fornecedor: fornecedorData.fornecedor || fornecedorData.razaoSocial || '',
            apelido: fornecedorData.apelido || fornecedorData.nomeFantasia || '',
            cpfCnpj: fornecedorData.cpfCnpj || fornecedorData.cnpj || '',
            rgInscricaoEstadual: fornecedorData.rgInscricaoEstadual || fornecedorData.inscricaoEstadual || '',
            email: fornecedorData.email || '',
            telefone: fornecedorData.telefone || '',
            telefonesAdicionais: fornecedorData.telefonesAdicionais || [],
            emailsAdicionais: fornecedorData.emailsAdicionais || [],
            endereco: fornecedorData.endereco || '',
            numero: fornecedorData.numero || '',
            complemento: fornecedorData.complemento || '',
            bairro: fornecedorData.bairro || '',
            cep: fornecedorData.cep || '',
            tipo: Number(fornecedorData.tipo) || 2,
            observacoes: fornecedorData.observacoes || '',
            limiteCredito: Number(fornecedorData.limiteCredito) || 0,
            cidadeId: fornecedorData.cidade?.id ? String(fornecedorData.cidade.id) : '',
            condicaoPagamentoId: String(fornecedorData.condicaoPagamentoId || ''),
            nacionalidadeId: String(fornecedorData.nacionalidadeId || ''),
            transportadoraId: String(fornecedorData.transportadoraId || ''),
            ativo: fornecedorData.ativo !== undefined ? fornecedorData.ativo : true, 
          });
          
          // Carregar cidade selecionada
          if (fornecedorData.cidade) {
            setCidadeSelecionada(fornecedorData.cidade);
          }
          
          // Carregar nacionalidade selecionada
          if (fornecedorData.nacionalidadeId) {
            try {
              const nacionalidades = await getNacionalidades();
              const nacionalidade = nacionalidades.find(n => n.id === fornecedorData.nacionalidadeId);
              if (nacionalidade) {
                setNacionalidadeSelecionada(nacionalidade);
              }
            } catch (error) {
              console.error('Erro ao carregar nacionalidade:', error);
            }
          }
          
          // Carregar transportadora selecionada
          if (fornecedorData.transportadoraId) {
            try {
              const transportadoras = await getTransportadoras();
              const transportadora = transportadoras.find(t => t.id === fornecedorData.transportadoraId);
              if (transportadora) {
                setTransportadoraSelecionada(transportadora);
              }
            } catch (error) {
              console.error('Erro ao carregar transportadora:', error);
            }
          }
          
          // Carregar condição de pagamento selecionada
          if (fornecedorData.condicaoPagamentoId) {
            try {
              const condicoes = await CondicaoPagamentoService.list();
              const condicao = condicoes.find(c => c.id === Number(fornecedorData.condicaoPagamentoId));
              if (condicao) {
                setCondicaoPagamentoSelecionada(condicao);
              }
            } catch (error) {
              console.error('Erro ao carregar condição de pagamento:', error);
            }
          }
          
          setUltimaModificacao(fornecedorData.ultimaModificacao || fornecedorData.dataAlteracao);
          setDataCadastro(fornecedorData.dataCadastro || fornecedorData.dataCriacao);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados necessários.');
        setTimeout(() => {
          navigate('/fornecedores');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew, navigate]);

  const [forceRender, setForceRender] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let newData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    };

    // Tratamento especial para select "tipo" - converter para número
    if (name === 'tipo') {
      newData.tipo = Number(value);
      // Limpar campos CPF/CNPJ e RG/Inscrição Estadual quando tipo mudar
      newData.cpfCnpj = '';
      newData.rgInscricaoEstadual = '';
      // Forçar re-renderização
      setForceRender(prev => prev + 1);
    }

    // Tratamento especial para CPF/CNPJ
    if (name === 'cpfCnpj') {
      const cleanValue = value.replace(/[^\d]/g, '');
      const maxLength = newData.tipo === 1 ? 11 : 14;
      
      if (cleanValue.length <= maxLength) {
        newData.cpfCnpj = cleanValue;
      } else {
        newData.cpfCnpj = cleanValue.substring(0, maxLength);
      }
    }

    // Tratamento especial para RG/Inscrição Estadual
    if (name === 'rgInscricaoEstadual') {
      const cleanValue = value.replace(/[^\d]/g, '');
      const maxLength = newData.tipo === 1 ? 12 : 14;
      
      if (cleanValue.length <= maxLength) {
        newData.rgInscricaoEstadual = cleanValue;
      } else {
        newData.rgInscricaoEstadual = cleanValue.substring(0, maxLength);
      }
    }
    
    setFormData(newData);
  };

  // Funções para gerenciar telefones adicionais
  const handleTelefonesAdicionais = (todosTelefones: string[]) => {
    // Separar o telefone principal dos adicionais
    const telefonePrincipal = formData.telefone;
    const telefonesAdicionais = todosTelefones.filter(tel => tel !== telefonePrincipal);
    
    setFormData(prev => ({
      ...prev,
      telefonesAdicionais: telefonesAdicionais
    }));
  };

  // Funções para gerenciar emails adicionais
  const handleEmailsAdicionais = (todosEmails: string[]) => {
    // Separar o email principal dos adicionais
    const emailPrincipal = formData.email;
    const emailsAdicionais = todosEmails.filter(email => email !== emailPrincipal);
    
    setFormData(prev => ({
      ...prev,
      emailsAdicionais: emailsAdicionais
    }));
  };

  const getTodosTelefones = () => {
    const telefones = [];
    if (formData.telefone.trim()) telefones.push(formData.telefone);
    telefones.push(...formData.telefonesAdicionais);
    return telefones;
  };

  const getTodosEmails = () => {
    const emails = [];
    if (formData.email.trim()) emails.push(formData.email);
    emails.push(...formData.emailsAdicionais);
    return emails;
  };

  const validateForm = () => {
    // Verificar se é brasileiro (nacionalidade Brasil = ID 1)
    const isBrasileiro = nacionalidadeSelecionada?.id === 1;
    
    // Usar a classe Validators para validações robustas
    const validations = [
      // Campos obrigatórios
      () => Validators.validateRequired(formData.fornecedor, "Nome do fornecedor"),
      () => Validators.validateRequired(formData.telefone, "Telefone"),
      () => Validators.validateRequired(formData.cidadeId, "Cidade"),
      () => Validators.validateRequired(formData.tipo.toString(), "Tipo"),
      () => Validators.validateRequired(formData.endereco, "Endereço"),
      () => Validators.validateRequired(formData.numero, "Número"),
      () => Validators.validateRequired(formData.bairro, "Bairro"),
      () => Validators.validateRequired(formData.cep, "CEP"),
      () => Validators.validateRequired(formData.condicaoPagamentoId, "Condição de Pagamento"),
      () => Validators.validateRequired(formData.nacionalidadeId, "Nacionalidade"),
      
      // CPF/CNPJ é obrigatório apenas para brasileiros
      () => {
        if (isBrasileiro) {
          return Validators.validateCpfCnpj(formData.cpfCnpj, formData.tipo, true);
        }
        // Para não brasileiros, é opcional
        if (formData.cpfCnpj?.trim()) {
          return Validators.validateCpfCnpj(formData.cpfCnpj, formData.tipo, false);
        }
        return { isValid: true };
      },
      
      // Validar email se preenchido (opcional)
      () => {
        if (formData.email?.trim()) {
          return Validators.validateEmail(formData.email);
        }
        return { isValid: true };
      },
      
      // Validar telefone
      () => Validators.validateTelefone(formData.telefone),
      
      // Validar CEP
      () => Validators.validateCEP(formData.cep),
      
      // Validar limite de crédito se preenchido (opcional, mas deve ser positivo)
      () => {
        if (formData.limiteCredito > 0) {
          return Validators.validatePositiveNumber(formData.limiteCredito, "Limite de crédito");
        }
        return { isValid: true };
      },
      
      // Validar emails adicionais se fornecidos
      () => {
        if (formData.emailsAdicionais && formData.emailsAdicionais.length > 0) {
          for (const email of formData.emailsAdicionais) {
            if (email.trim()) {
              const result = Validators.validateEmail(email);
              if (!result.isValid) {
                return { isValid: false, error: `Email adicional inválido: ${email}` };
              }
            }
          }
        }
        return { isValid: true };
      },
      
      // Validar telefones adicionais se fornecidos
      () => {
        if (formData.telefonesAdicionais && formData.telefonesAdicionais.length > 0) {
          for (const telefone of formData.telefonesAdicionais) {
            if (telefone.trim()) {
              const result = Validators.validateTelefone(telefone);
              if (!result.isValid) {
                return { isValid: false, error: `Telefone adicional inválido: ${telefone}` };
              }
            }
          }
        }
        return { isValid: true };
      }
    ];

    return Validators.validateMultiple(validations);
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
      
      if (!cidadeSelecionada && !formData.cidadeId) {
        throw new Error('Cidade deve ser selecionada.');
      }
      
      if (!condicaoPagamentoSelecionada || !formData.condicaoPagamentoId) {
        throw new Error('Condição de Pagamento não selecionada ou inválida.');
      }
      
      if (!nacionalidadeSelecionada || !formData.nacionalidadeId) {
        throw new Error('Nacionalidade não selecionada ou inválida.');
      }
      
      // Para não brasileiros, enviar CPF/CNPJ como null se estiver vazio
      const isBrasileiro = nacionalidadeSelecionada?.id === 1;
      const cpfCnpjValue = formData.cpfCnpj?.trim() ? formData.cpfCnpj : (isBrasileiro ? formData.cpfCnpj : null);

      const fornecedorDataPayload: any = {
        fornecedor: formData.fornecedor,
        apelido: formData.apelido,
        cpfCnpj: cpfCnpjValue,
        rgInscricaoEstadual: formData.rgInscricaoEstadual,
        email: formData.email,
        telefone: formData.telefone,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cep: formData.cep,
        tipo: formData.tipo,
        observacoes: formData.observacoes,
        limiteCredito: formData.limiteCredito,
        ativo: formData.ativo,
        nacionalidadeId: formData.nacionalidadeId ? Number(formData.nacionalidadeId) : null,
        transportadoraId: formData.transportadoraId ? Number(formData.transportadoraId) : null,
        cidade: cidadeSelecionada,
        condicaoPagamentoId: formData.condicaoPagamentoId,
        telefonesAdicionais: formData.telefonesAdicionais,
        emailsAdicionais: formData.emailsAdicionais,
      };
      
      if (isNew) {
        await createFornecedor(fornecedorDataPayload);
        alert('Fornecedor cadastrado com sucesso!');
      } else if (id) {
        await updateFornecedor(Number(id), fornecedorDataPayload);
        alert('Fornecedor atualizado com sucesso!');
      }
      
      navigate('/fornecedores');
    } catch (err: any) {
      console.error('Erro ao salvar fornecedor:', err);
      setError('Erro ao salvar fornecedor. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // Handlers para modais
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

  const handleOpenTransportadoraModal = () => setIsTransportadoraModalOpen(true);
  const handleCloseTransportadoraModal = () => setIsTransportadoraModalOpen(false);
  const handleSelectTransportadora = (transportadora: Transportadora) => {
    setFormData(prev => ({
      ...prev,
      transportadoraId: String(transportadora.id),
    }));
    setTransportadoraSelecionada(transportadora);
    setIsTransportadoraModalOpen(false);
  };

  const getCpfCnpjLabel = () => {
    const isBrasileiro = nacionalidadeSelecionada?.id === 1;
    const asterisco = isBrasileiro ? ' ' : '';
    console.log('getCpfCnpjLabel - formData.tipo:', formData.tipo, 'type of:', typeof formData.tipo);
    return formData.tipo === 1 ? `CPF${asterisco}` : `CNPJ${asterisco}`;
  };

  const getCpfCnpjPlaceholder = () => {
    return formData.tipo === 1 ? '000.000.000-00' : '00.000.000/0000-00';
  };

  const getCpfCnpjMaxLength = () => {
    return formData.tipo === 1 ? 11 : 14;
  };

  // Função para determinar o label do campo RG/Inscrição Estadual baseado no tipo
  const getRgInscricaoLabel = () => {
    return formData.tipo === 1 ? 'RG' : 'Inscrição Estadual';
  };

  const getRgInscricaoPlaceholder = () => {
    return formData.tipo === 1 ? '000000000' : '000000000000';
  };

  const getRgInscricaoMaxLength = () => {
    return formData.tipo === 1 ? 12 : 14;
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
          {isNew ? 'Novo Fornecedor' : 'Editar Fornecedor'}
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
            
            {/* Primeira linha: Código, Tipo, Fornecedor, Apelido */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '100px 150px 2fr 1.5fr' }}>
              <FormField
                label="Código"
                name="id"
                value={id && !isNew ? id : 'Novo'}
                onChange={() => {}}
                disabled={true}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value={1}>Pessoa Física</option>
                  <option value={2}>Pessoa Jurídica</option>
                </select>
              </div>

              <FormField
                label="Fornecedor"
                name="fornecedor"
                value={formData.fornecedor}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Ex: Distribuidora ABC LTDA"
              />

              <FormField
                label="Apelido"
                name="apelido"
                value={formData.apelido}
                onChange={handleChange}
                maxLength={50}
                placeholder="Ex: ABC"
              />
            </div>

            {/* Segunda linha: Endereço, Número, Complemento, Bairro, CEP, Cidade */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '3fr 100px 1.5fr 1.5fr 120px 2fr' }}>
              <FormField
                label="Endereço"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Ex: Rua das Indústrias"
              />

              <FormField
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                required
                maxLength={10}
                placeholder="Ex: 1500"
              />

              <FormField
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                maxLength={50}
                placeholder="Ex: Galpão A"
              />

              <FormField
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Ex: Vila Industrial"
              />

              <FormField
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                required
                maxLength={9}
                placeholder="00000-000"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade <span className="text-red-500">*</span>
                </label>
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
                    value={cidadeSelecionada ? `${cidadeSelecionada.nome}` : 'Selecione...'}
                    className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                    placeholder="Selecione..."
                  />
                  <FaSearch className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Terceira linha: Telefone e Email com botões para múltiplos */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {/* Telefone Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Principal</label>
                <div className="relative">
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="(41) 99999-9999"
                    maxLength={15}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setIsTelefonesModalOpen(true)}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-blue-500 text-white rounded-r border-l border-blue-600 hover:bg-blue-600 flex items-center justify-center text-xs font-medium"
                    title="Gerenciar múltiplos telefones"
                  >
                    <FaPlus className="mr-1" />
                    {formData.telefonesAdicionais.length}
                  </button>
                </div>
              </div>

              {/* Email Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Principal</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="contato@fornecedor.com"
                    maxLength={50}
                  />
                  <button
                    type="button"
                    onClick={() => setIsEmailsModalOpen(true)}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-blue-500 text-white rounded-r border-l border-blue-600 hover:bg-blue-600 flex items-center justify-center text-xs font-medium"
                    title="Gerenciar múltiplos emails"
                  >
                    <FaPlus className="mr-1" />
                    {formData.emailsAdicionais.length}
                  </button>
                </div>
              </div>
            </div>

            {/* Quarta linha: RG, CPF/CNPJ, Nacionalidade, Transportadora */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '150px 180px 1fr 1fr' }}>
              <FormField
                key={`rgInscricao-${formData.tipo}-${forceRender}`}
                label={getRgInscricaoLabel()}
                name="rgInscricaoEstadual"
                value={formData.rgInscricaoEstadual}
                onChange={handleChange}
                maxLength={getRgInscricaoMaxLength()}
                placeholder={getRgInscricaoPlaceholder()}
              />

              <FormField
                key={`cpfCnpj-${formData.tipo}-${forceRender}`}
                label={getCpfCnpjLabel()}
                name="cpfCnpj"
                value={formData.cpfCnpj}
                onChange={handleChange}
                required={nacionalidadeSelecionada?.id === 1}
                maxLength={getCpfCnpjMaxLength()}
                placeholder={getCpfCnpjPlaceholder()}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nacionalidade <span className="text-red-500">*</span>
                </label>
                <div 
                  onClick={handleOpenNacionalidadeModal} 
                  className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 relative"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transportadora</label>
                <div 
                  onClick={handleOpenTransportadoraModal} 
                  className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 relative"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenTransportadoraModal()}
                >
                  <input
                    type="text"
                    readOnly
                    value={transportadoraSelecionada ? transportadoraSelecionada.razaoSocial : 'Selecione...'}
                    className="flex-grow bg-transparent outline-none cursor-pointer text-sm"
                    placeholder="Selecione..."
                  />
                  <FaSearch className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Quinta linha: Limite de Crédito, Condição de Pagamento */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '150px 2fr' }}>
              <FormField
                label="Limite de Crédito"
                name="limiteCredito"
                type="number"
                step="0.01"
                value={formData.limiteCredito}
                onChange={handleChange}
                placeholder="0.00"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condição de Pagamento <span className="text-red-500">*</span>
                </label>
                <div 
                  onClick={handleOpenCondicaoPagamentoModal} 
                  className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200 relative"
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

            {/* Sexta linha: Observações */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  maxLength={255}
                  placeholder="Observações gerais sobre o fornecedor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={3}
                />
              </div>
            </div>
          </div>
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

          {/* Botões de Ação - Sempre à direita */}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/fornecedores')}
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

      <TransportadoraModal
        isOpen={isTransportadoraModalOpen}
        onClose={handleCloseTransportadoraModal}
        onSelect={handleSelectTransportadora}
      />

      <TelefonesModal
        isOpen={isTelefonesModalOpen}
        onClose={() => setIsTelefonesModalOpen(false)}
        telefones={getTodosTelefones()}
        onSave={handleTelefonesAdicionais}
      />

      <EmailsModal
        isOpen={isEmailsModalOpen}
        onClose={() => setIsEmailsModalOpen(false)}
        emails={getTodosEmails()}
        onSave={handleEmailsAdicionais}
      />
    </div>
  );
};

export default FornecedorForm; 