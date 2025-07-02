import React, { useEffect, useState } from 'react';
import { Produto } from '../../types';
import ViewModal from './ViewModal';
import { getMarca } from '../../services/marcaService';
import { getCategoriaById } from '../../services/categoriaService';
import { getUnidadeMedida } from '../../services/unidadeMedidaService';

interface ProdutoViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto: Produto | null;
  loading?: boolean;
}

const ProdutoViewModal: React.FC<ProdutoViewModalProps> = ({
  isOpen,
  onClose,
  produto,
  loading = false
}) => {
  const [marcaNome, setMarcaNome] = useState<string>('');
  const [categoriaNome, setCategoriaNome] = useState<string>('');
  const [unidadeMedidaNome, setUnidadeMedidaNome] = useState<string>('');

  useEffect(() => {
    const carregarDadosRelacionados = async () => {
      if (produto) {
        try {
          // Carregar marca
          if (produto.marcaId) {
            const marca = await getMarca(produto.marcaId);
            setMarcaNome(marca?.marca || 'N/A');
          }

          // Carregar categoria
          if (produto.categoriaId) {
            const categoria = await getCategoriaById(produto.categoriaId);
            setCategoriaNome(categoria?.categoria || 'N/A');
          }

          // Carregar unidade de medida
          if (produto.unidadeMedidaId) {
            const unidadeMedida = await getUnidadeMedida(produto.unidadeMedidaId);
            setUnidadeMedidaNome(unidadeMedida?.unidadeMedida || 'N/A');
          }
        } catch (error) {
          console.error('Erro ao carregar dados relacionados:', error);
        }
      }
    };

    carregarDadosRelacionados();
  }, [produto]);

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

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar Produto"
      loading={loading}
    >
      {produto ? (
        <div className="space-y-4">
          {/* Cabeçalho com status de ativo */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Dados do Produto</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${produto.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {produto.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Primeira linha: Código, Produto, Código de Barras, Referência */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('Código', produto.id)}
            {renderField('Produto', produto.produto || produto.nome, true)}
            {renderField('Código de Barras', produto.codigoBarras || produto.codigo || produto.referencia)}
            {renderField('Referência', produto.referencia)}
          </div>

          {/* Segunda linha: Marca, Unidade de Medida, Categoria, Descrição */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('Marca', marcaNome, true)}
            {renderField('Unidade de Medida', unidadeMedidaNome, true)}
            {renderField('Categoria', categoriaNome, true)}
            {renderField('Descrição', produto.descricao)}
          </div>

          {/* Terceira linha: Valores e Estoque */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" style={{ gridTemplateColumns: '150px 150px 150px 150px 150px' }}>
            {renderField('Valor Compra', formatCurrency(produto.valorCompra || produto.precoCusto), true)}
            {renderField('Valor Venda', formatCurrency(produto.valorVenda || produto.precoVenda || produto.valor), true)}
            {renderField('% Lucro', produto.percentualLucro ? `${produto.percentualLucro}%` : '0,00%', true)}
            {renderField('Quantidade', produto.quantidade || produto.estoque || 0, true)}
            {renderField('Qtd. Mínima', produto.quantidadeMinima || produto.estoqueMinimo || 0, true)}
          </div>

          {/* Quarta linha: Observações */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm min-h-[75px]">
                {produto.observacoes || 'N/A'}
              </div>
            </div>
          </div>

          {/* Informações do Registro */}
          <div className="mt-8 border-t pt-4">
            <div className="text-sm text-gray-600">
              <h3 className="font-semibold text-gray-700 mb-1">Informações do Registro:</h3>
              <p>
                Cadastrado em: {produto.dataCadastro || produto.dataCriacao || 'N/A'}
              </p>
              <p>
                Última modificação: {produto.ultimaModificacao || produto.dataAlteracao || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </ViewModal>
  );
};

export default ProdutoViewModal; 