import React, { useEffect, useState } from 'react';
import { Funcionario } from '../../types';
import ViewModal from './ViewModal';
import { getNacionalidades } from '../../services/nacionalidadeService';

interface FuncionarioViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionario: Funcionario | null;
  loading?: boolean;
}

/**
 * Modal de visualização específico para Funcionários
 * Baseado no layout padrão definido para FornecedorViewModal
 */
const FuncionarioViewModal: React.FC<FuncionarioViewModalProps> = ({
  isOpen,
  onClose,
  funcionario,
  loading = false
}) => {
  const [nacionalidadeNome, setNacionalidadeNome] = useState<string>('');

  useEffect(() => {
    const carregarDadosRelacionados = async () => {
      if (funcionario) {
        try {
          // Carregar nacionalidade
          if (funcionario.nacionalidadeId) {
            const nacionalidades = await getNacionalidades();
            const nacionalidade = nacionalidades.find(n => n.id === funcionario.nacionalidadeId);
            setNacionalidadeNome(nacionalidade?.nome || 'N/A');
          }
        } catch (error) {
          console.error('Erro ao carregar dados relacionados:', error);
        }
      }
    };

    carregarDadosRelacionados();
  }, [funcionario]);

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

  const formatEstadoCivil = (estadoCivil?: number) => {
    switch (estadoCivil) {
      case 1:
        return 'Solteiro(a)';
      case 2:
        return 'Casado(a)';
      case 3:
        return 'Divorciado(a)';
      case 4:
        return 'Viúvo(a)';
      case 5:
        return 'União Estável';
      default:
        return 'N/A';
    }
  };

  const formatSexo = (sexo?: number) => {
    switch (sexo) {
      case 1:
        return 'Masculino';
      case 2:
        return 'Feminino';
      default:
        return 'N/A';
    }
  };

  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualizar Funcionário"
      loading={loading}
    >
      {funcionario ? (
        <div className="space-y-4">
          {/* Cabeçalho com status de ativo */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Dados do Funcionário</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${funcionario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {funcionario.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Primeira linha: Código, Tipo, Nome, Apelido */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('Código', funcionario.id)}
            {renderField('Tipo', funcionario.tipo === 1 ? 'Pessoa Física' : 'Pessoa Jurídica', true)}
            {renderField('Nome', funcionario.funcionario || funcionario.nome, true)}
            {renderField('Apelido', funcionario.apelido)}
          </div>

          {/* Segunda linha: Endereço, Número, Complemento, Bairro, CEP, Cidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {renderField('Endereço', funcionario.endereco, true)}
            {renderField('Número', funcionario.numero)}
            {renderField('Complemento', funcionario.complemento)}
            {renderField('Bairro', funcionario.bairro)}
            {renderField('CEP', funcionario.cep)}
            {renderField('Cidade', funcionario.cidade?.nome ? `${funcionario.cidade.nome} - ${funcionario.cidade.estado?.uf || ''}` : 'N/A', true)}
          </div>

          {/* Terceira linha: Telefone, Email, Nacionalidade, Função */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('Telefone', funcionario.telefone)}
            {renderField('Email', funcionario.email)}
            {renderField('Nacionalidade', nacionalidadeNome)}
            {renderField('Função', funcionario.funcaoFuncionario?.funcaoFuncionario || funcionario.cargo)}
          </div>

          {/* Quarta linha: RG, CPF, Salário, CNH */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('RG', funcionario.rgInscricaoEstadual)}
            {renderField('CPF', funcionario.cpfCpnj)}
            {renderField('Salário', funcionario.salario ? `R$ ${Number(funcionario.salario).toFixed(2)}` : 'R$ 0,00', true)}
            {renderField('CNH', funcionario.cnh)}
          </div>

          {/* Quinta linha: Data de Nascimento, Estado Civil, Sexo, Validade CNH */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('Data de Nascimento', funcionario.dataNascimento)}
            {renderField('Estado Civil', formatEstadoCivil(Number(funcionario.estadoCivil)))}
            {renderField('Sexo', formatSexo(Number(funcionario.sexo)))}
            {renderField('Validade CNH', funcionario.dataValidadeCnh)}
          </div>

          {/* Sexta linha: Data de Admissão, Data de Demissão */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderField('Data de Admissão', funcionario.dataAdmissao)}
            {renderField('Data de Demissão', funcionario.dataDemissao)}
          </div>

          {/* Observações */}
          <div className="mt-4">
            {renderField('Observações', funcionario.observacao)}
          </div>

          {/* Informações do Registro */}
          <div className="mt-8 border-t pt-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Data de Cadastro:</span> {funcionario.dataCadastro || funcionario.dataCriacao || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Última Alteração:</span> {funcionario.ultimaModificacao || funcionario.dataAlteracao || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ViewModal>
  );
};

export default FuncionarioViewModal; 