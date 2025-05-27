import React from 'react';
import { CondicaoPagamento } from '../../types';
import ViewModal from './ViewModal';

interface CondicaoPagamentoViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  condicaoPagamento: CondicaoPagamento | null;
  loading?: boolean;
}

/**
 * Modal de visualização específico para Condições de Pagamento
 * Serve como referência para outros modais de visualização da aplicação
 */
const CondicaoPagamentoViewModal: React.FC<CondicaoPagamentoViewModalProps> = ({
  isOpen,
  onClose,
  condicaoPagamento,
  loading = false
}) => {
  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar Condição de Pagamento"
      loading={loading}
    >
      {condicaoPagamento ? (
        <div className="space-y-6">
          {/* Dados básicos */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              <span className={`px-2 py-1 rounded text-xs ${condicaoPagamento.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {condicaoPagamento.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Condição de Pagamento</p>
                <p className="font-semibold">{condicaoPagamento.condicaoPagamento}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Número de Parcelas</p>
                <p className="font-semibold">{condicaoPagamento.numeroParcelas}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Dias para 1ª Parcela</p>
                <p className="font-semibold">{condicaoPagamento.diasPrimeiraParcela}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Dias Entre Parcelas</p>
                <p className="font-semibold">{condicaoPagamento.diasEntreParcelas}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Percentual de Juros (%)</p>
                <p className="font-semibold">{condicaoPagamento.percentualJuros?.toFixed(2) || '0.00'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Percentual de Multa (%)</p>
                <p className="font-semibold">{condicaoPagamento.percentualMulta?.toFixed(2) || '0.00'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Percentual de Desconto (%)</p>
                <p className="font-semibold">{condicaoPagamento.percentualDesconto?.toFixed(2) || '0.00'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Forma de Pagamento Padrão</p>
                <p className="font-semibold">
                  {condicaoPagamento.formaPagamentoPadrao?.descricao || 'Não definida'}
                </p>
              </div>

              {/* Adicionar datas */}
              <div className="col-span-1 md:col-span-2 mt-2">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Informações do Registro</h4>
                <div className="flex flex-col space-y-2">
                  {condicaoPagamento.dataCadastro && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                      <p className="font-semibold">{new Date(condicaoPagamento.dataCadastro).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                  
                  {condicaoPagamento.ultimaModificacao && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Última Modificação</p>
                      <p className="font-semibold">{new Date(condicaoPagamento.ultimaModificacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Parcelas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Parcelas</h3>
            
            {condicaoPagamento.parcelas && condicaoPagamento.parcelas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nº
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentual (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Forma de Pagamento
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {condicaoPagamento.parcelas.map((parcela, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parcela.numero}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parcela.dias}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parcela.percentual.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parcela.formaPagamentoDescricao || 'Não definida'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma parcela configurada</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center">Nenhuma informação disponível</p>
      )}
    </ViewModal>
  );
};

export default CondicaoPagamentoViewModal; 