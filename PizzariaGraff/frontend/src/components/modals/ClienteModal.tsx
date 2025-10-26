import React, { useState, useEffect, useCallback } from 'react';
import { Cliente, Cidade, CondicaoPagamento } from '../../types';
import { getClientes, createCliente } from '../../services/clienteService';
import { getNacionalidades, NacionalidadeResponse } from '../../services/nacionalidadeService';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';
import CidadeModal from './CidadeModal';
import CondicaoPagamentoModal from './CondicaoPagamentoModal';
import NacionalidadeModal from './NacionalidadeModal';
import FormField from '../FormField';
import { FaSpinner, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Validators } from '../../utils/validators';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cliente: Cliente) => void;
}

const ClienteModal: React.FC<ClienteModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
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
    tipo: 1, // Padrão Pessoa Física
    limiteCredito: 0,
    observacao: '',
    cidadeId: '',
    condicaoPagamentoId: '',
    ativo: true,
  });

  const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(null);
  const [condicaoPagamentoSelecionada, setCondicaoPagamentoSelecionada] = useState<CondicaoPagamento | null>(null);
  const [nacionalidadeSelecionada, setNacionalidadeSelecionada] = useState<NacionalidadeResponse | null>(null);
  
  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [isCondicaoPagamentoModalOpen, setIsCondicaoPagamentoModalOpen] = useState(false);
  const [isNacionalidadeModalOpen, setIsNacionalidadeModalOpen] = useState(false);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchClientes();
      setSelectedCliente(null);
      setShowForm(false);
      setSearchTerm('');
      resetForm();
    }
  }, [isOpen, fetchClientes]);

  const resetForm = () => {
    setFormData({
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
    setCidadeSelecionada(null);
    setCondicaoPagamentoSelecionada(null);
    setNacionalidadeSelecionada(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpfCpnj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpfCnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectClienteRow = (cliente: Cliente) => {
    setSelectedCliente(cliente);
  };

  const handleConfirmSelection = () => {
    if (selectedCliente) {
      onSelect(selectedCliente);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let newValue: any;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'number') {
      newValue = Number(value);
    } else if (name === 'tipo') {
      newValue = Number(value);
    } else if (name === 'dataNascimento') {
      const dataInformada = new Date(value);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (dataInformada > hoje) {
        toast.error('A data de nascimento não pode ser futura!');
        return;
      }
      newValue = value;
    } else {
      newValue = value;
    }
    
    const newData = {
      ...formData,
      [name]: newValue,
    };

    // Limpar CPF/CNPJ e RG quando mudar o tipo
    if (name === 'tipo') {
      newData.cpfCpnj = '';
      newData.rgInscricaoEstadual = '';
    }

    // Limitar CPF/CNPJ
    if (name === 'cpfCpnj') {
      const cleanValue = value.replace(/[^\d]/g, '');
      const maxLength = newData.tipo === 1 ? 11 : 14;
      newData.cpfCpnj = cleanValue.substring(0, maxLength);
    }
    
    setFormData(newData);
  };

  const handleSelectCidade = (cidade: Cidade) => {
    setFormData(prev => ({ ...prev, cidadeId: String(cidade.id) }));
    setCidadeSelecionada(cidade);
    setIsCidadeModalOpen(false);
  };

  const handleSelectCondicaoPagamento = (condicaoPagamento: CondicaoPagamento) => {
    setFormData(prev => ({ ...prev, condicaoPagamentoId: String(condicaoPagamento.id) }));
    setCondicaoPagamentoSelecionada(condicaoPagamento);
    setIsCondicaoPagamentoModalOpen(false);
  };

  const handleSelectNacionalidade = (nacionalidade: NacionalidadeResponse) => {
    setFormData(prev => ({ ...prev, nacionalidadeId: String(nacionalidade.id) }));
    setNacionalidadeSelecionada(nacionalidade);
    setIsNacionalidadeModalOpen(false);
  };

  const validateForm = () => {
    const isBrasileiro = nacionalidadeSelecionada?.id === 1;
    
    const validations = [
      () => Validators.validateRequired(formData.cliente, "Nome do cliente"),
      () => Validators.validateRequired(formData.telefone, "Telefone"),
      () => Validators.validateRequired(formData.cidadeId, "Cidade"),
      () => Validators.validateRequired(formData.endereco, "Endereço"),
      () => Validators.validateRequired(formData.numero, "Número"),
      () => Validators.validateRequired(formData.bairro, "Bairro"),
      () => Validators.validateRequired(formData.cep, "CEP"),
      () => Validators.validateRequired(formData.condicaoPagamentoId, "Condição de Pagamento"),
      () => Validators.validateRequired(formData.nacionalidadeId, "Nacionalidade"),
      
      () => {
        if (isBrasileiro && formData.tipo === 1) {
          return Validators.validateCpfCnpj(formData.cpfCpnj, formData.tipo, true);
        }
        if (formData.cpfCpnj?.trim()) {
          return Validators.validateCpfCnpj(formData.cpfCpnj, formData.tipo, false);
        }
        return { isValid: true };
      },
      
      () => {
        if (formData.email?.trim()) {
          return Validators.validateEmail(formData.email);
        }
        return { isValid: true };
      },
      
      () => Validators.validateTelefone(formData.telefone),
      () => Validators.validateCEP(formData.cep),
    ];

    return Validators.validateMultiple(validations);
  };

  const handleSaveNovoCliente = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(". "));
      return;
    }

    if (!cidadeSelecionada) {
      toast.error('Cidade é obrigatória.');
      return;
    }

    if (!condicaoPagamentoSelecionada) {
      toast.error('Condição de Pagamento é obrigatória.');
      return;
    }

    if (!nacionalidadeSelecionada) {
      toast.error('Nacionalidade é obrigatória.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        cliente: formData.cliente,
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
        nacionalidadeId: Number(formData.nacionalidadeId),
        dataNascimento: formData.dataNascimento,
        estadoCivil: formData.estadoCivil,
        sexo: formData.sexo,
        tipo: formData.tipo,
        limiteCredito: formData.limiteCredito,
        observacao: formData.observacao,
        ativo: formData.ativo,
        cidade: cidadeSelecionada,
        condicaoPagamentoId: formData.condicaoPagamentoId,
      };

      const clienteCriado = await createCliente(payload);
      toast.success('Cliente criado com sucesso!');
      onSelect(clienteCriado);
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      toast.error(error?.response?.data?.message || 'Erro ao criar cliente.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh]">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              {showForm ? 'Novo Cliente' : 'Selecionar Cliente'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>

          {/* Corpo */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {!showForm ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="relative w-full sm:w-2/3">
                    <input
                      type="text"
                      placeholder="Buscar por nome, CPF/CNPJ ou email..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1 text-sm"
                  >
                    <FaPlus />
                    <span>Novo Cliente</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                  </div>
                ) : (
                  <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                    {filteredClientes.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CPF/CNPJ</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredClientes.map((cliente) => (
                            <tr
                              key={cliente.id}
                              onClick={() => handleSelectClienteRow(cliente)}
                              className={`cursor-pointer hover:bg-gray-100 ${selectedCliente?.id === cliente.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                            >
                              <td className="px-4 py-3 text-sm text-gray-900">{cliente.cliente || cliente.nome}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{cliente.cpfCpnj || cliente.cpfCnpj}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{cliente.telefone}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{cliente.email}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cliente.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {cliente.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Nenhum cliente encontrado.</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {/* Toggle Ativo */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Cadastrar Novo Cliente</h3>
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

                {/* Primeira linha: Tipo e Nome */}
                <div className="grid gap-4" style={{ gridTemplateColumns: '150px 2fr 1.5fr' }}>
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
                    label="Cliente"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                    required
                    placeholder="Ex: João Silva"
                  />

                  <FormField
                    label="Apelido"
                    name="apelido"
                    value={formData.apelido}
                    onChange={handleChange}
                    placeholder="Ex: João"
                  />
                </div>

                {/* Segunda linha: Endereço */}
                <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 100px 1.5fr 1.5fr 120px 2fr' }}>
                  <FormField
                    label="Endereço"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Rua das Flores"
                  />

                  <FormField
                    label="Número"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    required
                    placeholder="Ex: 123"
                  />

                  <FormField
                    label="Complemento"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    placeholder="Ex: Apto 101"
                  />

                  <FormField
                    label="Bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Centro"
                  />

                  <FormField
                    label="CEP"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    required
                    placeholder="00000-000"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade <span className="text-red-500">*</span>
                    </label>
                    <div 
                      onClick={() => setIsCidadeModalOpen(true)} 
                      className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200"
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

                {/* Terceira linha: Telefone e Email */}
                <div className="grid gap-4 grid-cols-2">
                  <FormField
                    label="Telefone Principal"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                    placeholder="(41) 99999-9999"
                  />

                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="cliente@email.com"
                  />
                </div>

                {/* Quarta linha: Documentos e Dados Pessoais */}
                <div className="grid gap-4 grid-cols-4">
                  <FormField
                    label={formData.tipo === 1 ? 'RG' : 'Inscrição Estadual'}
                    name="rgInscricaoEstadual"
                    value={formData.rgInscricaoEstadual}
                    onChange={handleChange}
                    placeholder={formData.tipo === 1 ? '000000000' : '000000000000'}
                  />

                  <FormField
                    label={formData.tipo === 1 ? 'CPF' : 'CNPJ'}
                    name="cpfCpnj"
                    value={formData.cpfCpnj}
                    onChange={handleChange}
                    required={nacionalidadeSelecionada?.id === 1 && formData.tipo === 1}
                    placeholder={formData.tipo === 1 ? '000.000.000-00' : '00.000.000/0000-00'}
                  />

                  <FormField
                    label="Data Nascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleChange}
                    placeholder=""
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                    <select
                      name="sexo"
                      value={formData.sexo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Selecione...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="O">Outro</option>
                    </select>
                  </div>
                </div>

                {/* Quinta linha: Estado Civil, Nacionalidade, Condição Pagamento */}
                <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr 150px' }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                    <select
                      name="estadoCivil"
                      value={formData.estadoCivil}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Selecione...</option>
                      <option value="SOLTEIRO">Solteiro(a)</option>
                      <option value="CASADO">Casado(a)</option>
                      <option value="DIVORCIADO">Divorciado(a)</option>
                      <option value="VIUVO">Viúvo(a)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nacionalidade <span className="text-red-500">*</span>
                    </label>
                    <div 
                      onClick={() => setIsNacionalidadeModalOpen(true)} 
                      className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condição de Pagamento <span className="text-red-500">*</span>
                    </label>
                    <div 
                      onClick={() => setIsCondicaoPagamentoModalOpen(true)} 
                      className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200"
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

                  <FormField
                    label="Limite de Crédito"
                    name="limiteCredito"
                    type="number"
                    step="0.01"
                    value={formData.limiteCredito}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    name="observacao"
                    value={formData.observacao}
                    onChange={handleChange}
                    placeholder="Observações gerais sobre o cliente"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div className="flex justify-end space-x-3 border-t px-6 py-4 bg-gray-50">
            {showForm ? (
              <>
                <button
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSaveNovoCliente}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Salvando...
                    </span>
                  ) : (
                    'Salvar Cliente'
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSelection}
                  disabled={!selectedCliente}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Selecionar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <CidadeModal
        isOpen={isCidadeModalOpen}
        onClose={() => setIsCidadeModalOpen(false)}
        onSelect={handleSelectCidade}
      />

      <CondicaoPagamentoModal
        isOpen={isCondicaoPagamentoModalOpen}
        onClose={() => setIsCondicaoPagamentoModalOpen(false)}
        onSelect={handleSelectCondicaoPagamento}
      />

      <NacionalidadeModal
        isOpen={isNacionalidadeModalOpen}
        onClose={() => setIsNacionalidadeModalOpen(false)}
        onSelect={handleSelectNacionalidade}
      />
    </>
  );
};

export default ClienteModal;

