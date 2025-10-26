import React, { useState, useEffect, useCallback } from 'react';
import { Fornecedor, Cidade, CondicaoPagamento } from '../../types';
import { getFornecedores, createFornecedor } from '../../services/fornecedorService';
import { getNacionalidades, NacionalidadeResponse } from '../../services/nacionalidadeService';
import { getTransportadoras } from '../../services/transportadoraService';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';
import CidadeModal from './CidadeModal';
import CondicaoPagamentoModal from './CondicaoPagamentoModal';
import NacionalidadeModal from './NacionalidadeModal';
import TransportadoraModal from './TransportadoraModal';
import FormField from '../FormField';
import { FaSpinner, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Validators } from '../../utils/validators';

interface FornecedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fornecedor: Fornecedor) => void;
}

const FornecedorModal: React.FC<FornecedorModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fornecedor: '',
    apelido: '',
    cpfCnpj: '',
    rgInscricaoEstadual: '',
    email: '',
    telefone: '',
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

  const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(null);
  const [condicaoPagamentoSelecionada, setCondicaoPagamentoSelecionada] = useState<CondicaoPagamento | null>(null);
  const [nacionalidadeSelecionada, setNacionalidadeSelecionada] = useState<NacionalidadeResponse | null>(null);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<any | null>(null);
  
  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [isCondicaoPagamentoModalOpen, setIsCondicaoPagamentoModalOpen] = useState(false);
  const [isNacionalidadeModalOpen, setIsNacionalidadeModalOpen] = useState(false);
  const [isTransportadoraModalOpen, setIsTransportadoraModalOpen] = useState(false);

  const fetchFornecedores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFornecedores();
      setFornecedores(data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      toast.error('Erro ao carregar fornecedores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFornecedores();
      setSelectedFornecedor(null);
      setShowForm(false);
      setSearchTerm('');
      resetForm();
    }
  }, [isOpen, fetchFornecedores]);

  const resetForm = () => {
    setFormData({
      fornecedor: '',
      apelido: '',
      cpfCnpj: '',
      rgInscricaoEstadual: '',
      email: '',
      telefone: '',
      endereco: '',
      numero: '',
      bairro: '',
      cep: '',
      tipo: 2,
      observacoes: '',
      limiteCredito: 0,
      cidadeId: '',
      condicaoPagamentoId: '',
      nacionalidadeId: '',
      transportadoraId: '',
      ativo: true,
    });
    setCidadeSelecionada(null);
    setCondicaoPagamentoSelecionada(null);
    setNacionalidadeSelecionada(null);
    setTransportadoraSelecionada(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.cpfCnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectFornecedorRow = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
  };

  const handleConfirmSelection = () => {
    if (selectedFornecedor) {
      onSelect(selectedFornecedor);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let newData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    };

    if (name === 'tipo') {
      newData.tipo = Number(value);
      newData.cpfCnpj = '';
      newData.rgInscricaoEstadual = '';
    }

    if (name === 'cpfCnpj') {
      const cleanValue = value.replace(/[^\d]/g, '');
      const maxLength = newData.tipo === 1 ? 11 : 14;
      newData.cpfCnpj = cleanValue.substring(0, maxLength);
    }

    if (name === 'rgInscricaoEstadual') {
      const cleanValue = value.replace(/[^\d]/g, '');
      const maxLength = newData.tipo === 1 ? 12 : 14;
      newData.rgInscricaoEstadual = cleanValue.substring(0, maxLength);
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

  const handleSelectTransportadora = (transportadora: any) => {
    setFormData(prev => ({ ...prev, transportadoraId: String(transportadora.id) }));
    setTransportadoraSelecionada(transportadora);
    setIsTransportadoraModalOpen(false);
  };

  const validateForm = () => {
    const isBrasileiro = nacionalidadeSelecionada?.id === 1;
    
    const validations = [
      () => Validators.validateRequired(formData.fornecedor, "Nome do fornecedor"),
      () => Validators.validateRequired(formData.telefone, "Telefone"),
      () => Validators.validateRequired(formData.cidadeId, "Cidade"),
      () => Validators.validateRequired(formData.endereco, "Endereço"),
      () => Validators.validateRequired(formData.numero, "Número"),
      () => Validators.validateRequired(formData.bairro, "Bairro"),
      () => Validators.validateRequired(formData.cep, "CEP"),
      () => Validators.validateRequired(formData.condicaoPagamentoId, "Condição de Pagamento"),
      () => Validators.validateRequired(formData.nacionalidadeId, "Nacionalidade"),
      
      () => {
        if (isBrasileiro) {
          return Validators.validateCpfCnpj(formData.cpfCnpj, formData.tipo, true);
        }
        if (formData.cpfCnpj?.trim()) {
          return Validators.validateCpfCnpj(formData.cpfCnpj, formData.tipo, false);
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

  const handleSaveNovoFornecedor = async () => {
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
      const isBrasileiro = nacionalidadeSelecionada?.id === 1;
      const cpfCnpjValue = formData.cpfCnpj?.trim() ? formData.cpfCnpj : (isBrasileiro ? formData.cpfCnpj : null);

      const payload = {
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
        nacionalidadeId: Number(formData.nacionalidadeId),
        transportadoraId: formData.transportadoraId ? Number(formData.transportadoraId) : null,
        cidade: cidadeSelecionada,
        condicaoPagamentoId: formData.condicaoPagamentoId,
        telefonesAdicionais: [],
        emailsAdicionais: [],
      };

      const fornecedorCriado = await createFornecedor(payload);
      toast.success('Fornecedor criado com sucesso!');
      onSelect(fornecedorCriado);
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar fornecedor:', error);
      toast.error(error?.response?.data?.message || 'Erro ao criar fornecedor.');
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
              {showForm ? 'Novo Fornecedor' : 'Selecionar Fornecedor'}
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
                    <span>Novo Fornecedor</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                  </div>
                ) : (
                  <div className="overflow-y-auto border rounded-md" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                    {filteredFornecedores.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CPF/CNPJ</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredFornecedores.map((fornecedor) => (
                            <tr
                              key={fornecedor.id}
                              onClick={() => handleSelectFornecedorRow(fornecedor)}
                              className={`cursor-pointer hover:bg-gray-100 ${selectedFornecedor?.id === fornecedor.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                            >
                              <td className="px-4 py-3 text-sm text-gray-900">{fornecedor.fornecedor || fornecedor.razaoSocial}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{fornecedor.cpfCnpj}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{fornecedor.telefone}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{fornecedor.email}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${fornecedor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Nenhum fornecedor encontrado.</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {/* Toggle Ativo */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Cadastrar Novo Fornecedor</h3>
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
                    label="Fornecedor"
                    name="fornecedor"
                    value={formData.fornecedor}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Distribuidora ABC LTDA"
                  />

                  <FormField
                    label="Apelido"
                    name="apelido"
                    value={formData.apelido}
                    onChange={handleChange}
                    placeholder="Ex: ABC"
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
                    placeholder="Ex: Rua das Indústrias"
                  />

                  <FormField
                    label="Número"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    required
                    placeholder="Ex: 1500"
                  />

                  <FormField
                    label="Complemento"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    placeholder="Ex: Galpão A"
                  />

                  <FormField
                    label="Bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Vila Industrial"
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
                    placeholder="contato@fornecedor.com"
                  />
                </div>

                {/* Quarta linha: Documentos */}
                <div className="grid gap-4" style={{ gridTemplateColumns: '150px 180px 1fr 1fr' }}>
                  <FormField
                    label={formData.tipo === 1 ? 'RG' : 'Inscrição Estadual'}
                    name="rgInscricaoEstadual"
                    value={formData.rgInscricaoEstadual}
                    onChange={handleChange}
                    placeholder={formData.tipo === 1 ? '000000000' : '000000000000'}
                  />

                  <FormField
                    label={formData.tipo === 1 ? 'CPF' : 'CNPJ'}
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleChange}
                    required={nacionalidadeSelecionada?.id === 1}
                    placeholder={formData.tipo === 1 ? '000.000.000-00' : '00.000.000/0000-00'}
                  />

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transportadora</label>
                    <div 
                      onClick={() => setIsTransportadoraModalOpen(true)} 
                      className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer hover:bg-gray-200"
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

                {/* Quinta linha: Limite e Condição Pagamento */}
                <div className="grid gap-4" style={{ gridTemplateColumns: '150px 2fr' }}>
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
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    placeholder="Observações gerais sobre o fornecedor"
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
                  onClick={handleSaveNovoFornecedor}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Salvando...
                    </span>
                  ) : (
                    'Salvar Fornecedor'
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
                  disabled={!selectedFornecedor}
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

      <TransportadoraModal
        isOpen={isTransportadoraModalOpen}
        onClose={() => setIsTransportadoraModalOpen(false)}
        onSelect={handleSelectTransportadora}
      />
    </>
  );
};

export default FornecedorModal;

