import React from 'react';
import { Pais } from '../../types';
import ViewModal from './ViewModal';

interface PaisViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pais: Pais | null;
  loading?: boolean;
}

/**
 * Modal de visualização específico para Países
 * Baseado no layout padrão definido para CondicaoPagamentoViewModal
 */
const PaisViewModal: React.FC<PaisViewModalProps> = ({
  isOpen,
  onClose,
  pais,
  loading = false
}) => {
  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar País"
      loading={loading}
    >
      {pais ? (
        <div className="space-y-6">
          {/* Dados básicos */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              <span className={`px-2 py-1 rounded text-xs ${pais.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {pais.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="font-semibold">{pais.nome}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Sigla</p>
                <p className="font-semibold">{pais.sigla}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Código</p>
                <p className="font-semibold">{pais.codigo}</p>
              </div>

              {/* Informações do registro com datas */}
              <div className="col-span-1 md:col-span-2 mt-2">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Informações do Registro</h4>
                <div className="flex flex-col space-y-2">
                  {pais.dataCadastro && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                      <p className="font-semibold">{new Date(pais.dataCadastro).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                  
                  {pais.ultimaModificacao && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Última Modificação</p>
                      <p className="font-semibold">{new Date(pais.ultimaModificacao).toLocaleDateString('pt-BR')}</p>
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

export default PaisViewModal; 