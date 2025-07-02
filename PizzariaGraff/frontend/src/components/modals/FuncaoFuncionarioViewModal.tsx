import React from 'react';
import { FuncaoFuncionario } from '../../types';
import ViewModal from './ViewModal';

interface FuncaoFuncionarioViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcaoFuncionario: FuncaoFuncionario | null;
  loading?: boolean;
}

/**
 * Modal de visualização específico para Funções de Funcionário
 * Baseado no layout padrão definido para FornecedorViewModal
 */
const FuncaoFuncionarioViewModal: React.FC<FuncaoFuncionarioViewModalProps> = ({
  isOpen,
  onClose,
  funcaoFuncionario,
  loading = false
}) => {
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
      title="Visualizar Função de Funcionário"
      loading={loading}
    >
      {funcaoFuncionario ? (
        <div className="space-y-4">
          {/* Cabeçalho com status de ativo */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Dados da Função</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${funcaoFuncionario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {funcaoFuncionario.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Primeira linha: Código, Nome da Função */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Código', funcaoFuncionario.id)}
            {renderField('Nome da Função', funcaoFuncionario.funcaoFuncionario, true)}
          </div>

          {/* Segunda linha: Carga Horária, Salário Base, Requer CNH */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderField('Carga Horária', funcaoFuncionario.cargaHoraria ? `${funcaoFuncionario.cargaHoraria}h/sem` : 'N/A')}
            {renderField('Salário Base', funcaoFuncionario.salarioBase ? `R$ ${Number(funcaoFuncionario.salarioBase).toFixed(2)}` : 'N/A')}
            {renderField('Requer CNH', funcaoFuncionario.requerCNH ? 'Sim' : 'Não')}
          </div>

          {/* Terceira linha: Descrição */}
          <div className="grid grid-cols-1 gap-4">
            {renderField('Descrição', funcaoFuncionario.descricao)}
          </div>

          {/* Quarta linha: Observações */}
          <div className="grid grid-cols-1 gap-4">
            {renderField('Observações', funcaoFuncionario.observacao)}
          </div>

          {/* Informações do Registro */}
          <div className="mt-8 border-t pt-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Data de Cadastro:</span> {funcaoFuncionario.dataCadastro || funcaoFuncionario.dataCriacao || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Última Alteração:</span> {funcaoFuncionario.ultimaModificacao || funcaoFuncionario.dataAlteracao || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ViewModal>
  );
};

export default FuncaoFuncionarioViewModal; 