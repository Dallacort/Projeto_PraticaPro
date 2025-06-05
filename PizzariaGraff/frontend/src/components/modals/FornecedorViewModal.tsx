import React from 'react';
import { Fornecedor } from '../../types';
import ViewModal from './ViewModal';

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
  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar Fornecedor"
      loading={loading}
    >
      {fornecedor ? (
        <div className="space-y-6">
          {/* Dados básicos */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              {fornecedor.ativo !== undefined && (
                <span className={`px-2 py-1 rounded text-xs ${fornecedor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ID</p>
                <p className="font-semibold">{fornecedor.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fornecedor</p>
                <p className="font-semibold">{fornecedor.fornecedor || fornecedor.razaoSocial}</p>
              </div>
              {(fornecedor.apelido || fornecedor.nomeFantasia) && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Apelido</p>
                  <p className="font-semibold">{fornecedor.apelido || fornecedor.nomeFantasia}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">CPF/CNPJ</p>
                <p className="font-semibold">{fornecedor.cpfCnpj || fornecedor.cnpj || 'N/A'}</p>
              </div>
              {fornecedor.rgInscricaoEstadual && (
                <div>
                  <p className="text-sm font-medium text-gray-500">RG/Inscrição Estadual</p>
                  <p className="font-semibold">{fornecedor.rgInscricaoEstadual}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="font-semibold">{fornecedor.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Telefone</p>
                <p className="font-semibold">{fornecedor.telefone || 'N/A'}</p>
              </div>
              {fornecedor.contato && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Contato</p>
                  <p className="font-semibold">{fornecedor.contato}</p>
                </div>
              )}
              {fornecedor.tipo && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Fornecedor</p>
                  <p className="font-semibold">{fornecedor.tipo === 1 ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
                </div>
              )}
              {fornecedor.limiteCredito !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Limite de Crédito</p>
                  <p className="font-semibold">R$ {Number(fornecedor.limiteCredito).toFixed(2)}</p>
                </div>
              )}
              {fornecedor.situacao && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Data Situação</p>
                  <p className="font-semibold">{new Date(fornecedor.situacao).toLocaleDateString('pt-BR')}</p>
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
                  {fornecedor.cidade?.nome || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <p className="font-semibold">
                  {fornecedor.cidade?.estado?.nome || 'N/A'} ({fornecedor.cidade?.estado?.uf || 'N/A'})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">País</p>
                <p className="font-semibold">
                  {fornecedor.cidade?.estado?.pais?.nome || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">CEP</p>
                <p className="font-semibold">{fornecedor.cep || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Endereço</p>
                <p className="font-semibold">{fornecedor.endereco || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Número</p>
                <p className="font-semibold">{fornecedor.numero || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Complemento</p>
                <p className="font-semibold">{fornecedor.complemento || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Bairro</p>
                <p className="font-semibold">{fornecedor.bairro || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Observações */}
          {fornecedor.observacoes && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-4">Observações</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{fornecedor.observacoes}</p>
            </div>
          )}

          {/* Informações do registro com datas */}
          <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Informações do Registro</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              {(fornecedor.dataCriacao || fornecedor.dataCadastro) && (
                <div>
                  <p className="text-xs text-gray-500">Data de Cadastro</p>
                  <p className="text-sm font-semibold">
                    {new Date(fornecedor.dataCriacao || fornecedor.dataCadastro || '').toLocaleString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              )}
              {(fornecedor.dataAlteracao || fornecedor.ultimaModificacao) && (
                <div>
                  <p className="text-xs text-gray-500">Última Modificação</p>
                  <p className="text-sm font-semibold">
                    {new Date(fornecedor.dataAlteracao || fornecedor.ultimaModificacao || '').toLocaleString('pt-BR', { 
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
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum fornecedor selecionado</p>
        </div>
      )}
    </ViewModal>
  );
};

export default FornecedorViewModal; 