import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getTransportadora, createTransportadora, updateTransportadora } from '../../services/transportadoraService';
import { Transportadora, Cidade, CondicaoPagamento } from '../../types';
import { FaSpinner, FaSearch, FaPlus } from 'react-icons/fa';
import CidadeModal from '../../components/modals/CidadeModal';
import CondicaoPagamentoModal from '../../components/modals/CondicaoPagamentoModal';
import TelefonesModal from '../../components/modals/TelefonesModal';
import EmailsModal from '../../components/modals/EmailsModal';
import { formatDate } from '../../utils/formatters';
import { Validators } from '../../utils/validators';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';

interface TransportadoraFormData {
  transportadora: string;
  apelido: string;
  cpfCnpj: string;
  rgIe: string;
  email: string;
  telefone: string;
  emailsAdicionais: string[];
  telefonesAdicionais: string[];
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  tipo: number;
  observacao: string;
  cidadeId: string;
  condicaoPagamentoId: string;
  ativo: boolean;
}

const TransportadoraForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isNew = id === 'novo' || location.pathname === '/transportadoras/novo' || !id;

  const [formData, setFormData] = useState<TransportadoraFormData>({
    transportadora: '',
    apelido: '',
    cpfCnpj: '',
    rgIe: '',
    email: '',
    telefone: '',
    emailsAdicionais: [],
    telefonesAdicionais: [],
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    tipo: 2,
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
  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [isCondicaoPagamentoModalOpen, setIsCondicaoPagamentoModalOpen] = useState(false);
  const [isTelefonesModalOpen, setIsTelefonesModalOpen] = useState(false);
  const [isEmailsModalOpen, setIsEmailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!isNew && id) {
          const transportadoraData = await getTransportadora(Number(id));
          if (!transportadoraData) {
            throw new Error('Transportadora não encontrada');
          }

          const todosEmails = transportadoraData.emailsAdicionais || [];
          const todosTelefones = transportadoraData.telefonesAdicionais || [];
          
          setFormData({
            transportadora: transportadoraData.transportadora || transportadoraData.razaoSocial || '',
            apelido: transportadoraData.apelido || transportadoraData.nomeFantasia || '',
            cpfCnpj: transportadoraData.cpfCnpj || transportadoraData.cnpj || '',
            rgIe: transportadoraData.rgIe || transportadoraData.inscricaoEstadual || '',
            email: todosEmails[0] || '',
            telefone: todosTelefones[0] || '',
            emailsAdicionais: todosEmails.slice(1),
            telefonesAdicionais: todosTelefones.slice(1),
            endereco: transportadoraData.endereco || '',
            numero: transportadoraData.numero || '',
            complemento: transportadoraData.complemento || '',
            bairro: transportadoraData.bairro || '',
            cep: transportadoraData.cep || '',
            tipo: Number(transportadoraData.tipo) || 2,
            observacao: transportadoraData.observacao || '',
            cidadeId: transportadoraData.cidade?.id ? String(transportadoraData.cidade.id) : '',
            condicaoPagamentoId: String(transportadoraData.condicaoPagamentoId || ''),
            ativo: transportadoraData.ativo !== undefined ? transportadoraData.ativo : true,
          });
          
          if (transportadoraData.cidade) {
            setCidadeSelecionada(transportadoraData.cidade);
          }
          
          if (transportadoraData.condicaoPagamentoId) {
            try {
              const condicoes = await CondicaoPagamentoService.list();
              const condicao = condicoes.find(c => c.id === Number(transportadoraData.condicaoPagamentoId));
              if (condicao) {
                setCondicaoPagamentoSelecionada(condicao);
              }
            } catch (error) {
              console.error('Erro ao carregar condição de pagamento:', error);
            }
          }
          
          setUltimaModificacao(transportadoraData.ultimaModificacao || transportadoraData.dataAlteracao);
          setDataCadastro(transportadoraData.dataCadastro || transportadoraData.dataCriacao);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados necessários.');
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
      [name]: type === 'checkbox' ? checked : value,
    };

    if (name === 'tipo') {
      newData.tipo = Number(value);
      newData.cpfCnpj = '';
      newData.rgIe = '';
      setForceRender(prev => prev + 1);
    }
    
    setFormData(newData);
  };

  const handleTelefonesAdicionais = (todosTelefones: string[]) => {
    const [telefonePrincipal, ...adicionais] = todosTelefones;
    setFormData(prev => ({
      ...prev,
      telefone: telefonePrincipal || '',
      telefonesAdicionais: adicionais,
    }));
  };

  const handleEmailsAdicionais = (todosEmails: string[]) => {
    const [emailPrincipal, ...adicionais] = todosEmails;
    setFormData(prev => ({
      ...prev,
      email: emailPrincipal || '',
      emailsAdicionais: adicionais,
    }));
  };

  const getTodosTelefones = () => [formData.telefone, ...formData.telefonesAdicionais].filter(Boolean);
  const getTodosEmails = () => [formData.email, ...formData.emailsAdicionais].filter(Boolean);

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.transportadora.trim()) errors.push('Razão Social/Nome é obrigatório');
    if (!formData.apelido.trim()) errors.push('Nome Fantasia/Apelido é obrigatório');
    if (!formData.cpfCnpj.trim()) errors.push('CPF/CNPJ é obrigatório');
    if (!formData.cidadeId) errors.push('Cidade é obrigatória');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (formErrors.length > 0) {
      setError(formErrors.join(', '));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const transportadoraData = {
        ...formData,
        cidadeId: Number(formData.cidadeId),
        condicaoPagamentoId: Number(formData.condicaoPagamentoId),
        telefonesAdicionais: getTodosTelefones(),
        emailsAdicionais: getTodosEmails(),
        cidade: cidadeSelecionada,
      };

      if (isNew) {
        await createTransportadora(transportadoraData);
      } else {
        await updateTransportadora(Number(id), transportadoraData);
      }

      navigate('/transportadoras');
    } catch (err: any) {
      console.error('Erro ao salvar transportadora:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao salvar transportadora');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCidadeModal = () => setIsCidadeModalOpen(true);
  const handleCloseCidadeModal = () => setIsCidadeModalOpen(false);
  const handleSelectCidade = (cidade: Cidade) => {
    setCidadeSelecionada(cidade);
    setFormData(prev => ({ ...prev, cidadeId: String(cidade.id) }));
    setIsCidadeModalOpen(false);
  };

  const handleOpenCondicaoPagamentoModal = () => setIsCondicaoPagamentoModalOpen(true);
  const handleCloseCondicaoPagamentoModal = () => setIsCondicaoPagamentoModalOpen(false);
  const handleSelectCondicaoPagamento = (condicao: CondicaoPagamento) => {
    setCondicaoPagamentoSelecionada(condicao);
    setFormData(prev => ({ ...prev, condicaoPagamentoId: String(condicao.id) }));
    setIsCondicaoPagamentoModalOpen(false);
  };
  
  const getCpfCnpjLabel = () => formData.tipo === 1 ? 'CPF' : 'CNPJ';
  const getRgInscricaoLabel = () => formData.tipo === 1 ? 'RG' : 'Inscrição Estadual';
  
  if (loading) return <div className="flex justify-center items-center h-full"><FaSpinner className="animate-spin text-blue-500" size={24} /></div>;

  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-7xl w-full mx-auto my-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">
          {isNew ? 'Nova Transportadora' : 'Editar Transportadora'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Dados Básicos</h2>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <span className="mr-2 text-sm font-medium text-gray-700">Habilitado</span>
                  <div className="relative">
                    <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange} className="sr-only" />
                    <div className={`block w-14 h-8 rounded-full ${formData.ativo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ${formData.ativo ? 'translate-x-6' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '100px 150px 2fr 1.5fr' }}>
              <FormField label="Código" name="id" value={id && !isNew ? id : 'Novo'} onChange={() => {}} disabled />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo <span className="text-red-500">*</span></label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
                  <option value={1}>Pessoa Física</option>
                  <option value={2}>Pessoa Jurídica</option>
                </select>
              </div>
              <FormField label="Razão Social / Nome" name="transportadora" value={formData.transportadora} onChange={handleChange} required maxLength={50} placeholder="Nome completo" />
              <FormField label="Nome Fantasia / Apelido" name="apelido" value={formData.apelido} onChange={handleChange} required maxLength={50} placeholder="Como é conhecido" />
            </div>

            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '3fr 100px 1.5fr 1.5fr 120px 2fr' }}>
              <FormField label="Endereço" name="endereco" value={formData.endereco} onChange={handleChange} maxLength={50} placeholder="Ex: Rua das Indústrias" />
              <FormField label="Número" name="numero" value={formData.numero} onChange={handleChange} maxLength={10} placeholder="Ex: 1500" />
              <FormField label="Complemento" name="complemento" value={formData.complemento} onChange={handleChange} maxLength={50} placeholder="Ex: Galpão A" />
              <FormField label="Bairro" name="bairro" value={formData.bairro} onChange={handleChange} maxLength={50} placeholder="Ex: Vila Industrial" />
              <FormField label="CEP" name="cep" value={formData.cep} onChange={handleChange} maxLength={9} placeholder="00000-000" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade <span className="text-red-500">*</span></label>
                <div onClick={handleOpenCidadeModal} className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200">
                  <input type="text" readOnly value={cidadeSelecionada ? `${cidadeSelecionada.nome}` : 'Selecione...'} className="flex-grow bg-transparent outline-none cursor-pointer text-sm" />
                  <FaSearch className="text-gray-500" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Principal</label>
                <div className="relative">
                  <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md" placeholder="(41) 99999-9999" maxLength={15} />
                  <button type="button" onClick={() => setIsTelefonesModalOpen(true)} className="absolute right-1 top-1 bottom-1 px-3 bg-blue-500 text-white rounded-r flex items-center">
                    <FaPlus className="mr-1" /> {formData.telefonesAdicionais.length}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Principal</label>
                <div className="relative">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md" placeholder="contato@transportadora.com" maxLength={50} />
                  <button type="button" onClick={() => setIsEmailsModalOpen(true)} className="absolute right-1 top-1 bottom-1 px-3 bg-blue-500 text-white rounded-r flex items-center">
                    <FaPlus className="mr-1" /> {formData.emailsAdicionais.length}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '150px 180px 1fr' }}>
              <FormField key={`rg-${forceRender}`} label={getRgInscricaoLabel()} name="rgIe" value={formData.rgIe} onChange={handleChange} maxLength={14} />
              <FormField key={`cpf-${forceRender}`} label={getCpfCnpjLabel()} name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} required maxLength={18} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condição de Pagamento</label>
                <div onClick={handleOpenCondicaoPagamentoModal} className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200">
                  <input type="text" readOnly value={condicaoPagamentoSelecionada ? condicaoPagamentoSelecionada.condicaoPagamento : 'Selecione...'} className="flex-grow bg-transparent outline-none cursor-pointer text-sm" />
                  <FaSearch className="text-gray-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea name="observacao" value={formData.observacao} onChange={handleChange} maxLength={255} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
            </div>
        </div>
        
        <div className="flex justify-between items-end pt-6 border-t mt-6">
          {(dataCadastro || ultimaModificacao) && (
            <div className="text-sm text-gray-600">
              <p>Cadastrado em: {formatDate(dataCadastro)}</p>
              <p>Última modificação: {formatDate(ultimaModificacao)}</p>
            </div>
          )}
          <div className="flex gap-3 ml-auto">
            <button type="button" onClick={() => navigate('/transportadoras')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {saving ? <><FaSpinner className="animate-spin mr-2" /> Salvando...</> : 'Salvar'}
            </button>
          </div>
        </div>
      </form>

      <CidadeModal isOpen={isCidadeModalOpen} onClose={handleCloseCidadeModal} onSelect={handleSelectCidade} />
      <CondicaoPagamentoModal isOpen={isCondicaoPagamentoModalOpen} onClose={handleCloseCondicaoPagamentoModal} onSelect={handleSelectCondicaoPagamento} />
      <TelefonesModal isOpen={isTelefonesModalOpen} onClose={() => setIsTelefonesModalOpen(false)} telefones={getTodosTelefones()} onSave={handleTelefonesAdicionais} />
      <EmailsModal isOpen={isEmailsModalOpen} onClose={() => setIsEmailsModalOpen(false)} emails={getTodosEmails()} onSave={handleEmailsAdicionais} />
    </div>
  );
};

export default TransportadoraForm; 