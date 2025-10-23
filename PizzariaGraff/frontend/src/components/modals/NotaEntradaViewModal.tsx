import React, { useState } from 'react';
import { NotaEntrada } from '../../types';
import { cancelarNotaEntrada } from '../../services/notaEntradaService';
import { FaTimes, FaSpinner } from 'react-icons/fa';

interface NotaEntradaViewModalProps {
  nota: NotaEntrada;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const NotaEntradaViewModal: React.FC<NotaEntradaViewModalProps> = ({
  nota,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancelarNota = async () => {
    if (nota.situacao === 'CANCELADA') {
      alert('Esta nota já está cancelada!');
      return;
    }

    if (window.confirm('Deseja realmente cancelar esta nota? Todas as parcelas relacionadas também serão canceladas.')) {
      try {
        setLoading(true);
        setError(null);

              await cancelarNotaEntrada(
                nota.numero,
                nota.modelo,
                nota.serie,
                nota.fornecedorId
              );

        alert('Nota e todas as parcelas foram canceladas com sucesso!');
        onUpdate();
        onClose();
      } catch (err: any) {
        console.error('Erro ao cancelar nota:', err);
        const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao cancelar nota';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDateBR = (dateString: string | undefined) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'R$ 0,00';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
      style={{ zIndex: 9999 }}
    >
      <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-7xl w-full mx-auto my-4 max-h-[90vh]">
        <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">
            Visualizar Nota de Compra - {nota.numero}/{nota.modelo}/{nota.serie}
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Dados da Nota */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4">Dados da Nota</h2>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  value={nota.numero}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10 text-right"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={nota.modelo}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10 text-right"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Série
                </label>
                <input
                  type="text"
                  value={nota.serie}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10 text-right"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor *
                </label>
                <input
                  type="text"
                  value={nota.fornecedorNome || '-'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Emissão *
                </label>
                <input
                  type="text"
                  value={formatDateBR(nota.dataEmissao)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Chegada *
                </label>
                <input
                  type="text"
                  value={formatDateBR(nota.dataChegada)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10"
                />
              </div>
            </div>
          </div>

          {/* Produtos */}
          {nota.produtos && nota.produtos.length > 0 && (
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-4">Produtos</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">CODIGO</th>
                      <th className="px-3 py-2 text-left">PRODUTO</th>
                      <th className="px-3 py-2 text-left">UND</th>
                      <th className="px-3 py-2 text-right">QTD</th>
                      <th className="px-3 py-2 text-right">PREÇO UN</th>
                      <th className="px-3 py-2 text-right">DESCONTO</th>
                      <th className="px-3 py-2 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nota.produtos.map((produto, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{produto.sequencia}</td>
                        <td className="px-3 py-2">{produto.produtoNome}</td>
                        <td className="px-3 py-2">UN</td>
                        <td className="px-3 py-2 text-right">{produto.quantidade.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(produto.valorUnitario)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(produto.valorDesconto)}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {formatCurrency(produto.valorTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-2 flex justify-end items-center">
                <div className="text-lg font-semibold">
                  Total Produtos: {formatCurrency(nota.valorProdutos)}
                </div>
              </div>
            </div>
          )}

          {/* Frete e Outras Despesas */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4">Frete e Outras Despesas</h2>
            
            <div className="flex items-end gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Frete</label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm">
                  {nota.tipoFrete}
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Frete
                </label>
                <input
                  type="text"
                  value={formatCurrency(nota.valorFrete)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10 text-right"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Seguro
                </label>
                <input
                  type="text"
                  value={formatCurrency(nota.valorSeguro)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10 text-right"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outras Despesas
                </label>
                <input
                  type="text"
                  value={formatCurrency(nota.outrasDespesas)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10 text-right"
                />
              </div>
            </div>

            {/* Transportadora e Placa */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transportadora
                </label>
                <input
                  type="text"
                  value={nota.transportadoraNome || 'Não informado'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa Veículo
                </label>
                <input
                  type="text"
                  value={nota.placaVeiculo || 'Não informado'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="text-lg font-semibold text-right">
                Total da Nota: {formatCurrency(nota.valorTotal)}
              </div>
            </div>
          </div>

          {/* Condição de Pagamento */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4">Condição de Pagamento</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cód. Cond. Pgto
                </label>
                <input
                  type="text"
                  value={nota.condicaoPagamentoId || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10 text-right"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condição de Pagamento
                </label>
                <input
                  type="text"
                  value={nota.condicaoPagamentoNome || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm h-10"
                />
              </div>
            </div>

            {/* Parcelas de Pagamento */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">PARCELA</th>
                    <th className="px-3 py-2 text-left">CÓD. FORMA PGTO</th>
                    <th className="px-3 py-2 text-left">FORMA DE PAGAMENTO</th>
                    <th className="px-3 py-2 text-left">DATA VENCIMENTO</th>
                    <th className="px-3 py-2 text-right">VALOR PARCELA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">PIX</td>
                    <td className="px-3 py-2">{formatDateBR(nota.dataEmissao)}</td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {formatCurrency(nota.valorTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Observação */}
          {nota.observacoes && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Observação</h2>
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm">
                {nota.observacoes}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end pt-6 border-t mt-6 p-4">
          {/* Botões de Ação */}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Voltar
            </button>
            {nota.situacao !== 'CANCELADA' && (
              <button
                onClick={handleCancelarNota}
                disabled={loading}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  'Cancelar Nota'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotaEntradaViewModal;