import React from 'react';
import { FormaPagamento } from '../../types';
import ViewModal from './ViewModal';

interface FormaPagamentoViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formaPagamento: FormaPagamento | null;
  loading?: boolean;
}

/**
 * Modal de visualização específico para Formas de Pagamento
 * Baseado no layout padrão definido para ClienteViewModal
 */
const FormaPagamentoViewModal: React.FC<FormaPagamentoViewModalProps> = ({
  isOpen,
  onClose,
  formaPagamento,
  loading = false
}) => {
  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar Forma de Pagamento"
      loading={loading}
    >
      {formaPagamento ? (
        <div className="space-y-6">
          {/* Dados básicos */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              <span className={`px-2 py-1 rounded text-xs ${formaPagamento.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {formaPagamento.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ID</p>
                <p className="font-semibold">{formaPagamento.id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="font-semibold">{formaPagamento.nome}</p>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Descrição</p>
                <p className="font-semibold">{formaPagamento.descricao}</p>
              </div>
            </div>
          </div>

          {/* Informações do registro com datas */}
          <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Informações do Registro</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              {formaPagamento.dataCadastro && (
                <div>
                  <p className="text-xs text-gray-500">Data de Cadastro</p>
                  <p className="text-sm font-semibold">
                    {new Date(formaPagamento.dataCadastro).toLocaleString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              )}
              {formaPagamento.ultimaModificacao && (
                <div>
                  <p className="text-xs text-gray-500">Última Modificação</p>
                  <p className="text-sm font-semibold">
                    {new Date(formaPagamento.ultimaModificacao).toLocaleString('pt-BR', { 
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

export default FormaPagamentoViewModal; 