import React from 'react';
import { Transportadora } from '../../types';
import ViewModal from './ViewModal';

interface TransportadoraViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transportadora: Transportadora | null;
  loading?: boolean;
}

/**
 * Modal de visualização específico para Transportadoras
 * Baseado no layout exato do formulário de cadastro
 */
const TransportadoraViewModal: React.FC<TransportadoraViewModalProps> = ({
  isOpen,
  onClose,
  transportadora,
  loading = false
}) => {
  const renderField = (label: string, value: any, required: boolean = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="p-2 w-full bg-gray-50 border border-gray-300 rounded-md text-sm">
        {value || 'N/A'}
      </div>
    </div>
  );

  const formatTipo = (tipo: number) => {
    switch (tipo) {
      case 1:
        return 'Pessoa Física';
      case 2:
        return 'Pessoa Jurídica';
      default:
        return 'N/A';
    }
  };

  const renderEmails = (emails: string[] = []) => {
    if (!emails.length) return 'N/A';
    return emails.map((email, index) => (
      <div key={index} className="text-sm">
        {email}
      </div>
    ));
  };

  const renderTelefones = (telefones: string[] = []) => {
    if (!telefones.length) return 'N/A';
    return telefones.map((telefone, index) => (
      <div key={index} className="text-sm">
        {telefone}
      </div>
    ));
  };

  const renderVeiculos = (veiculos: any[] = []) => {
    if (!veiculos.length) return 'N/A';
    return veiculos.map((veiculo, index) => (
      <div key={index} className="text-sm border-b border-gray-200 last:border-0 py-1">
        {`${veiculo.placa} - ${veiculo.modelo} (${veiculo.marca})`}
        {veiculo.capacidade && ` - Capacidade: ${veiculo.capacidade}`}
      </div>
    ));
  };

  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar Transportadora"
      loading={loading}
    >
      {transportadora ? (
        <div className="space-y-4">
          {/* Cabeçalho com status de ativo */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Dados Básicos</h2>
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium text-gray-700">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${transportadora.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {transportadora.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Primeira linha: Código, Tipo, Nome e Nome Fantasia */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '100px 150px 2fr 1.5fr' }}>
            {renderField('Código', transportadora.id)}
            {renderField('Tipo', formatTipo(transportadora.tipo), true)}
            {renderField('Nome', transportadora.transportadora || transportadora.nome, true)}
            {renderField('Nome Fantasia', transportadora.apelido || transportadora.nomeFantasia)}
          </div>

          {/* Segunda linha: Endereço completo */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 100px 1.5fr 1.5fr 120px 2fr' }}>
            {renderField('Endereço', transportadora.endereco)}
            {renderField('Número', transportadora.numero)}
            {renderField('Complemento', transportadora.complemento)}
            {renderField('Bairro', transportadora.bairro)}
            {renderField('CEP', transportadora.cep)}
            {renderField('Cidade', transportadora.cidade?.nome, true)}
          </div>

          {/* Terceira linha: Contatos */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              {renderField('Telefone Principal', transportadora.telefone)}
              {renderField('Telefones Adicionais', renderTelefones(transportadora.telefonesAdicionais))}
            </div>
            <div>
              {renderField('Email Principal', transportadora.email)}
              {renderField('Emails Adicionais', renderEmails(transportadora.emailsAdicionais))}
            </div>
          </div>

          {/* Quarta linha: Documentos e Informações Adicionais */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '150px 180px 1fr 1fr' }}>
            {renderField(transportadora.tipo === 1 ? 'RG' : 'Inscrição Estadual', transportadora.rgIe || transportadora.inscricaoEstadual)}
            {renderField(transportadora.tipo === 1 ? 'CPF' : 'CNPJ', transportadora.cpfCnpj || transportadora.cnpj, true)}
            {renderField('Condição de Pagamento', transportadora.condicaoPagamentoId || 'N/A')}
            {renderField('Veículos', renderVeiculos(transportadora.veiculos))}
          </div>

          {/* Quinta linha: Observações */}
          <div className="grid grid-cols-1 gap-4">
            {renderField('Observações', transportadora.observacao)}
          </div>

          {/* Informações do Registro */}
          <div className="mt-8 border-t pt-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Data de Cadastro:</span> {transportadora.dataCadastro || transportadora.dataCriacao || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Última Alteração:</span> {transportadora.ultimaModificacao || transportadora.dataAlteracao || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ViewModal>
  );
};

export default TransportadoraViewModal; 