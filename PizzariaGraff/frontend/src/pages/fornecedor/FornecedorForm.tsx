import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FormField from '../../components/FormField';
import { getFornecedor, createFornecedor, updateFornecedor } from '../../services/fornecedorService';
import { Fornecedor, Cidade, CondicaoPagamento } from '../../types';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import CidadeModal from '../../components/modals/CidadeModal';
import CondicaoPagamentoModal from '../../components/modals/CondicaoPagamentoModal';
import { formatDate } from '../../utils/formatters';

interface FornecedorFormData {
  fornecedor: string;
  apelido: string;
  cpfCnpj: string;
  rgInscricaoEstadual: string;
  email: string;
  contato: string;
  telefone: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  tipo: number;
  observacoes: string;
  limiteCredito: number;
  situacao: string;
  cidadeId: string;
  condicaoPagamentoId: string;
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
    contato: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    tipo: 2, // Padrão Pessoa Jurídica
    observacoes: '',
    limiteCredito: 0,
    situacao: '',
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
            contato: fornecedorData.contato || '',
            telefone: fornecedorData.telefone || '',
            endereco: fornecedorData.endereco || '',
            numero: fornecedorData.numero || '',
            complemento: fornecedorData.complemento || '',
            bairro: fornecedorData.bairro || '',
            cep: fornecedorData.cep || '',
            tipo: fornecedorData.tipo || 2,
            observacoes: fornecedorData.observacoes || '',
            limiteCredito: Number(fornecedorData.limiteCredito) || 0,
            situacao: fornecedorData.situacao || '',
            cidadeId: fornecedorData.cidade?.id ? String(fornecedorData.cidade.id) : '',
            condicaoPagamentoId: String(fornecedorData.condicaoPagamentoId || ''),
            ativo: fornecedorData.ativo !== undefined ? fornecedorData.ativo : true, 
          });
          
          if (fornecedorData.cidade) {
            setCidadeSelecionada(fornecedorData.cidade);
          } else {
            setCidadeSelecionada(null);
          }
          
          setCondicaoPagamentoSelecionada(null);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.fornecedor?.trim()) errors.push("Fornecedor é obrigatório");
    if (!formData.apelido?.trim()) errors.push("Apelido é obrigatório");
    if (!formData.email?.trim()) errors.push("Email é obrigatório");
    if (!formData.telefone?.trim()) errors.push("Telefone é obrigatório");
    if (!formData.cidadeId) errors.push("Cidade é obrigatória");
    
    // Validação de email se preenchido
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
      
      if (!cidadeSelecionada && !formData.cidadeId) {
        throw new Error('Cidade deve ser selecionada.');
      }
      
      const fornecedorDataPayload: any = {
        fornecedor: formData.fornecedor,
        apelido: formData.apelido,
        cpfCnpj: formData.cpfCnpj,
        rgInscricaoEstadual: formData.rgInscricaoEstadual,
        email: formData.email,
        contato: formData.contato,
        telefone: formData.telefone,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cep: formData.cep,
        tipo: formData.tipo,
        observacoes: formData.observacoes,
        limiteCredito: formData.limiteCredito,
        situacao: formData.situacao,
        ativo: formData.ativo,
        cidade: cidadeSelecionada,
        condicaoPagamentoId: formData.condicaoPagamentoId,
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
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao salvar fornecedor. Verifique os dados e tente novamente.';
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

  // Função para determinar o label do campo CPF/CNPJ baseado no tipo
  const getCpfCnpjLabel = () => {
    return formData.tipo === 1 ? 'CPF' : 'CNPJ';
  };

  const getCpfCnpjPlaceholder = () => {
    return formData.tipo === 1 ? '000.000.000-00' : '00.000.000/0000-00';
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                required
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
                maxLength={50}
                placeholder="Ex: Rua das Indústrias"
              />

              <FormField
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
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
                maxLength={50}
                placeholder="Ex: Vila Industrial"
              />

              <FormField
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                maxLength={9}
                placeholder="00000-000"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
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

            {/* Terceira linha: Telefone, Email, Contato, Data Situação */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '150px 2fr 1.5fr 150px' }}>
              <FormField
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
                maxLength={15}
                placeholder="(41) 99999-9999"
              />

              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="contato@fornecedor.com"
              />

              <FormField
                label="Contato"
                name="contato"
                value={formData.contato}
                onChange={handleChange}
                maxLength={50}
                placeholder="Nome do contato"
              />

              <FormField
                label="Data Situação"
                name="situacao"
                type="date"
                value={formData.situacao}
                onChange={handleChange}
              />
            </div>

            {/* Quarta linha: RG, CPF/CNPJ, Limite de Crédito, Condição de Pagamento */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '150px 180px 150px 2fr' }}>
              <FormField
                label="RG/I.E."
                name="rgInscricaoEstadual"
                value={formData.rgInscricaoEstadual}
                onChange={handleChange}
                maxLength={20}
                placeholder="Ex: 123456789012"
              />

              <FormField
                label={getCpfCnpjLabel()}
                name="cpfCnpj"
                value={formData.cpfCnpj}
                onChange={handleChange}
                required
                maxLength={formData.tipo === 1 ? 14 : 18}
                placeholder={getCpfCnpjPlaceholder()}
              />

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Condição de Pagamento</label>
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

            {/* Quinta linha: Observações */}
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
    </div>
  );
};

export default FornecedorForm; 