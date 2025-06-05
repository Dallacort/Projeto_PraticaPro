import React from 'react';
import { Cliente } from '../../types';
import ViewModal from './ViewModal';

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
  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar Cliente"
      loading={loading}
    >
      {cliente ? (
        <div className="space-y-6">
          {/* Dados básicos */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              {cliente.ativo !== undefined && (
                <span className={`px-2 py-1 rounded text-xs ${cliente.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {cliente.ativo ? 'Ativo' : 'Inativo'}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ID</p>
                <p className="font-semibold">{cliente.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="font-semibold">{cliente.cliente || cliente.nome}</p>
              </div>
              {cliente.apelido && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Apelido</p>
                  <p className="font-semibold">{cliente.apelido}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">CPF/CNPJ</p>
                <p className="font-semibold">{cliente.cpfCpnj || cliente.cpfCnpj || 'N/A'}</p>
              </div>
              {cliente.rgInscricaoEstadual && (
                <div>
                  <p className="text-sm font-medium text-gray-500">RG/Inscrição Estadual</p>
                  <p className="font-semibold">{cliente.rgInscricaoEstadual}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="font-semibold">{cliente.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Telefone</p>
                <p className="font-semibold">{cliente.telefone || 'N/A'}</p>
              </div>
              {cliente.nacionalidade && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Nacionalidade</p>
                  <p className="font-semibold">{cliente.nacionalidade}</p>
                </div>
              )}
              {cliente.dataNascimento && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                  <p className="font-semibold">{new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
              {cliente.estadoCivil && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado Civil</p>
                  <p className="font-semibold">{cliente.estadoCivil}</p>
                </div>
              )}
              {cliente.sexo && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Sexo</p>
                  <p className="font-semibold">{cliente.sexo === 'M' ? 'Masculino' : cliente.sexo === 'F' ? 'Feminino' : cliente.sexo}</p>
                </div>
              )}
              {cliente.tipo && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Cliente</p>
                  <p className="font-semibold">{cliente.tipo === 1 ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
                </div>
              )}
              {cliente.limiteCredito !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Limite de Crédito</p>
                  <p className="font-semibold">R$ {Number(cliente.limiteCredito).toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Cidade</p>
                <p className="font-semibold">
                  {cliente.cidade?.nome || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <p className="font-semibold">
                  {cliente.cidade?.estado?.nome || 'N/A'} ({cliente.cidade?.estado?.uf || 'N/A'})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">País</p>
                <p className="font-semibold">
                  {cliente.cidade?.estado?.pais?.nome || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">CEP</p>
                <p className="font-semibold">{cliente.cep || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Endereço</p>
                <p className="font-semibold">{cliente.endereco || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Número</p>
                <p className="font-semibold">{cliente.numero || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Complemento</p>
                <p className="font-semibold">{cliente.complemento || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Bairro</p>
                <p className="font-semibold">{cliente.bairro || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Observações */}
          {cliente.observacao && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-4">Observações</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{cliente.observacao}</p>
            </div>
          )}

          {/* Informações do registro com datas */}
          <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Informações do Registro</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              {(cliente.dataCriacao || cliente.dataCadastro) && (
                <div>
                  <p className="text-xs text-gray-500">Data de Cadastro</p>
                  <p className="text-sm font-semibold">
                    {new Date(cliente.dataCriacao || cliente.dataCadastro || '').toLocaleString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              )}
              {(cliente.dataAlteracao || cliente.ultimaModificacao) && (
                <div>
                  <p className="text-xs text-gray-500">Última Modificação</p>
                  <p className="text-sm font-semibold">
                    {new Date(cliente.dataAlteracao || cliente.ultimaModificacao || '').toLocaleString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center">Nenhuma informação disponível.</p>
      )}
    </ViewModal>
  );
};

export default ClienteViewModal; 