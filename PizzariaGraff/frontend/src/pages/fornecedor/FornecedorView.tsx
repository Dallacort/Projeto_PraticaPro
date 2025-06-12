import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFornecedor } from '../../services/fornecedorService';
import { Fornecedor } from '../../types';
import { FaSpinner, FaEdit, FaArrowLeft } from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';

const FornecedorView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID do fornecedor não especificado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fornecedorData = await getFornecedor(Number(id));
        
        if (!fornecedorData) {
          setError('Fornecedor não encontrado');
          return;
        }
        
        setFornecedor(fornecedorData);
      } catch (err) {
        console.error('Erro ao carregar fornecedor:', err);
        setError('Erro ao carregar os dados do fornecedor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEdit = () => {
    if (id) {
      navigate(`/fornecedores/${id}`);
    }
  };

  const handleBack = () => {
    navigate('/fornecedores');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-primary">
          <FaSpinner className="animate-spin text-blue-500" size={24} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={handleBack}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Voltar à Lista
          </button>
        </div>
      </div>
    );
  }

  if (!fornecedor) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Fornecedor não encontrado</p>
          <button 
            onClick={handleBack}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Voltar à Lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden max-w-7xl w-full mx-auto my-4">
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Visualizar Fornecedor</h1>
        {fornecedor.ativo !== undefined && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${fornecedor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {fornecedor.ativo ? 'Ativo' : 'Inativo'}
          </span>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Dados básicos */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">Dados Básicos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Código</p>
              <p className="font-semibold">{fornecedor.id}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Tipo</p>
              <p className="font-semibold">{fornecedor.tipo === 1 ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Fornecedor</p>
              <p className="font-semibold">{fornecedor.fornecedor || fornecedor.razaoSocial}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Apelido</p>
              <p className="font-semibold">{fornecedor.apelido || fornecedor.nomeFantasia || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Telefone</p>
              <p className="font-semibold">{fornecedor.telefone || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="font-semibold">{fornecedor.email || 'N/A'}</p>
            </div>




          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-sm font-medium text-gray-500">RG/I.E.</p>
              <p className="font-semibold">{fornecedor.rgInscricaoEstadual || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">CPF/CNPJ</p>
              <p className="font-semibold">{fornecedor.cpfCnpj || fornecedor.cnpj || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Limite de Crédito</p>
              <p className="font-semibold">
                R$ {fornecedor.limiteCredito ? Number(fornecedor.limiteCredito).toFixed(2) : '0,00'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Condição de Pagamento</p>
              <p className="font-semibold">{fornecedor.condicaoPagamentoId || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="col-span-3">
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">CEP</p>
              <p className="font-semibold">{fornecedor.cep || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Cidade</p>
              <p className="font-semibold">{fornecedor.cidade?.nome || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Estado</p>
              <p className="font-semibold">
                {fornecedor.cidade?.estado?.nome || 'N/A'} ({fornecedor.cidade?.estado?.uf || 'N/A'})
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">País</p>
              <p className="font-semibold">{fornecedor.cidade?.estado?.pais?.nome || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Observações */}
        {fornecedor.observacoes && (
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Observações</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{fornecedor.observacoes}</p>
            </div>
          </div>
        )}

        {/* Rodapé com informações de registro e botões */}
        <div className="flex justify-between items-end pt-6 border-t">
          {/* Informações do Registro */}
          {(fornecedor.dataCadastro || fornecedor.ultimaModificacao) && (
            <div className="text-sm text-gray-600">
              <h3 className="font-semibold text-gray-700 mb-1">Informações do Registro:</h3>
              {fornecedor.dataCadastro && (
                <p>Cadastrado em: {formatDate(fornecedor.dataCadastro)}</p>
              )}
              {fornecedor.ultimaModificacao && (
                <p>Última modificação: {formatDate(fornecedor.ultimaModificacao)}</p>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Voltar
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none flex items-center"
            >
              <FaEdit className="mr-2" />
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FornecedorView; 