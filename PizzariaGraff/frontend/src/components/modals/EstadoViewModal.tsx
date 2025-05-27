import React from 'react';
import { Estado } from '../../types';
import ViewModal from './ViewModal';

interface EstadoViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  estado: Estado | null;
  loading?: boolean;
}

/**
 * Modal de visualização específico para Estados
 * Baseado no layout padrão definido para CondicaoPagamentoViewModal
 */
const EstadoViewModal: React.FC<EstadoViewModalProps> = ({
  isOpen,
  onClose,
  estado,
  loading = false
}) => {
  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar Estado"
      loading={loading}
    >
      {estado ? (
        <div className="space-y-6">
          {/* Dados básicos */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              <span className={`px-2 py-1 rounded text-xs ${estado.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {estado.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="font-semibold">{estado.nome}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">UF</p>
                <p className="font-semibold">{estado.uf}</p>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-medium text-gray-500">País</p>
                <p className="font-semibold">{estado.pais?.nome || 'Não definido'}</p>
              </div>

              {/* Informações do registro com datas */}
              <div className="col-span-1 md:col-span-2 mt-2">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Informações do Registro</h4>
                <div className="flex flex-col space-y-2">
                  {estado.dataCadastro && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                      <p className="font-semibold">{new Date(estado.dataCadastro).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                  
                  {estado.ultimaModificacao && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Última Modificação</p>
                      <p className="font-semibold">{new Date(estado.ultimaModificacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center">Nenhuma informação disponível</p>
      )}
    </ViewModal>
  );
};

export default EstadoViewModal; 