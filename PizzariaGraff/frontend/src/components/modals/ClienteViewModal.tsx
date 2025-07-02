import React, { useEffect, useState } from 'react';
import { Cliente } from '../../types';
import ViewModal from './ViewModal';
import { getNacionalidades } from '../../services/nacionalidadeService';
import CondicaoPagamentoService from '../../services/condicaoPagamentoService';
import { getCidade } from '../../services/cidadeService';

interface ClienteViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  loading?: boolean;
}

/**
 * Modal de visualização específico para Clientes
 * Baseado no layout padrão definido para CidadeViewModal
 */
const ClienteViewModal: React.FC<ClienteViewModalProps> = ({
  isOpen,
  onClose,
  cliente,
  loading = false
}) => {
  const [nacionalidadeNome, setNacionalidadeNome] = useState<string>('');
  const [condicaoPagamentoNome, setCondicaoPagamentoNome] = useState<string>('');
  const [cidadeNome, setCidadeNome] = useState<string>('');

  useEffect(() => {
    const carregarDadosRelacionados = async () => {
      if (cliente) {
        try {
          // Carregar nacionalidade
          if (cliente.nacionalidadeId) {
            const nacionalidades = await getNacionalidades();
            const nacionalidade = nacionalidades.find(n => n.id === cliente.nacionalidadeId);
            setNacionalidadeNome(nacionalidade?.nome || 'N/A');
          }

          // Carregar condição de pagamento
          if (cliente.condicaoPagamentoId) {
            const condicoes = await CondicaoPagamentoService.list();
            const condicao = condicoes.find(c => c.id === cliente.condicaoPagamentoId);
            setCondicaoPagamentoNome(condicao?.condicaoPagamento || 'N/A');
          }

          // Carregar cidade
          if (cliente.cidadeId) {
            const cidade = await getCidade(cliente.cidadeId);
            setCidadeNome(cidade ? `${cidade.nome} - ${cidade.estado.uf}` : 'N/A');
          }
        } catch (error) {
          console.error('Erro ao carregar dados relacionados:', error);
        }
      }
    };

    carregarDadosRelacionados();
  }, [cliente]);

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
      title="Visualizar Cliente"
      loading={loading}
    >
      {cliente ? (
        <div className="space-y-4">
          {/* Cabeçalho com status de ativo */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Dados do Cliente</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${cliente.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {cliente.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Primeira linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {renderField('Código', cliente.id)}
            {renderField('Tipo', cliente.tipo === 1 ? 'Pessoa Física' : 'Pessoa Jurídica', true)}
            {renderField('Cliente', cliente.nome, true)}
            {renderField('Apelido', cliente.apelido)}
            {renderField('Estado Civil', cliente.estadoCivil)}
          </div>

          {/* Segunda linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {renderField('Endereço', cliente.endereco, true)}
            {renderField('Número', cliente.numero)}
            {renderField('Complemento', cliente.complemento)}
            {renderField('Bairro', cliente.bairro)}
            {renderField('CEP', cliente.cep)}
            {renderField('Cidade', cidadeNome, true)}
          </div>

          {/* Terceira linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {renderField('Telefone', cliente.telefone)}
            {renderField('Email', cliente.email)}
            {renderField('Sexo', cliente.sexo)}
            {renderField('Data Nascimento', cliente.dataNascimento)}
            {renderField('Nacionalidade', nacionalidadeNome)}
          </div>

          {/* Quarta linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('RG/Inscrição Estadual', cliente.rgInscricaoEstadual)}
            {renderField('CPF/CNPJ', cliente.cpfCnpj)}
            {renderField('Limite de Crédito', cliente.limiteCredito ? `R$ ${Number(cliente.limiteCredito).toFixed(2)}` : 'R$ 0,00', true)}
            {renderField('Condição de Pagamento', condicaoPagamentoNome, true)}
          </div>

          {/* Observação */}
          <div className="mt-4">
            {renderField('Observação', cliente.observacao)}
          </div>

          {/* Informações do Registro */}
          <div className="mt-8 border-t pt-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Data de Cadastro:</span> {cliente.dataCadastro || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Última Alteração:</span> {cliente.ultimaModificacao || cliente.dataAlteracao || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma informação disponível</p>
        </div>
      )}
    </ViewModal>
  );
};

export default ClienteViewModal; 