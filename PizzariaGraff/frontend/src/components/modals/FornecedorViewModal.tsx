import React, { useEffect, useState } from 'react';
import { Fornecedor } from '../../types';
import ViewModal from './ViewModal';
import { getNacionalidades } from '../../services/nacionalidadeService';
import { getTransportadoras } from '../../services/transportadoraService';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';

interface FornecedorViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fornecedor: Fornecedor | null;
  loading?: boolean;
}

/**
 * Modal de visualização específico para Fornecedores
 * Baseado no layout padrão definido para ClienteViewModal
 */
const FornecedorViewModal: React.FC<FornecedorViewModalProps> = ({
  isOpen,
  onClose,
  fornecedor,
  loading = false
}) => {
  const [nacionalidadeNome, setNacionalidadeNome] = useState<string>('');
  const [transportadoraNome, setTransportadoraNome] = useState<string>('');
  const [condicaoPagamentoNome, setCondicaoPagamentoNome] = useState<string>('');

  useEffect(() => {
    const carregarDadosRelacionados = async () => {
      if (fornecedor) {
        try {
          // Carregar nacionalidade
          if (fornecedor.nacionalidadeId) {
            const nacionalidades = await getNacionalidades();
            const nacionalidade = nacionalidades.find(n => n.id === fornecedor.nacionalidadeId);
            setNacionalidadeNome(nacionalidade?.nome || 'N/A');
          }

          // Carregar transportadora
          if (fornecedor.transportadoraId) {
            const transportadoras = await getTransportadoras();
            const transportadora = transportadoras.find(t => t.id === fornecedor.transportadoraId);
            setTransportadoraNome(transportadora?.razaoSocial || transportadora?.nome || 'N/A');
          }

          // Carregar condição de pagamento
          if (fornecedor.condicaoPagamentoId) {
            const condicoes = await CondicaoPagamentoService.list();
            const condicao = condicoes.find(c => c.id === fornecedor.condicaoPagamentoId);
            setCondicaoPagamentoNome(condicao?.condicaoPagamento || 'N/A');
          }
        } catch (error) {
          console.error('Erro ao carregar dados relacionados:', error);
        }
      }
    };

    carregarDadosRelacionados();
  }, [fornecedor]);

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

  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar Fornecedor"
      loading={loading}
    >
      {fornecedor ? (
        <div className="space-y-4">
          {/* Cabeçalho com status de ativo */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Dados do Fornecedor</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${fornecedor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {fornecedor.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Primeira linha: Código, Tipo, Fornecedor, Apelido */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('Código', fornecedor.id)}
            {renderField('Tipo', fornecedor.tipo === 1 ? 'Pessoa Física' : 'Pessoa Jurídica', true)}
            {renderField('Fornecedor', fornecedor.fornecedor || fornecedor.razaoSocial, true)}
            {renderField('Apelido', fornecedor.apelido || fornecedor.nomeFantasia)}
          </div>

          {/* Segunda linha: Endereço, Número, Complemento, Bairro, CEP, Cidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {renderField('Endereço', fornecedor.endereco, true)}
            {renderField('Número', fornecedor.numero)}
            {renderField('Complemento', fornecedor.complemento)}
            {renderField('Bairro', fornecedor.bairro)}
            {renderField('CEP', fornecedor.cep)}
            {renderField('Cidade', fornecedor.cidade?.nome, true)}
          </div>

          {/* Terceira linha: Telefone, Email, Nacionalidade, Transportadora */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('Telefone', fornecedor.telefone)}
            {renderField('Email', fornecedor.email)}
            {renderField('Nacionalidade', nacionalidadeNome)}
            {renderField('Transportadora', transportadoraNome)}
          </div>

          {/* Quarta linha: RG/Inscrição Estadual, CPF/CNPJ, Limite de Crédito, Condição de Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('RG/Inscrição Estadual', fornecedor.rgInscricaoEstadual)}
            {renderField('CPF/CNPJ', fornecedor.cpfCnpj)}
            {renderField('Limite de Crédito', fornecedor.limiteCredito ? `R$ ${Number(fornecedor.limiteCredito).toFixed(2)}` : 'R$ 0,00', true)}
            {renderField('Condição de Pagamento', condicaoPagamentoNome, true)}
          </div>

          {/* Observações */}
          <div className="mt-4">
            {renderField('Observações', fornecedor.observacoes)}
          </div>

          {/* Informações do Registro */}
          <div className="mt-8 border-t pt-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Data de Cadastro:</span> {fornecedor.dataCadastro || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Última Alteração:</span> {fornecedor.ultimaModificacao || fornecedor.dataAlteracao || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ViewModal>
  );
};

export default FornecedorViewModal; 