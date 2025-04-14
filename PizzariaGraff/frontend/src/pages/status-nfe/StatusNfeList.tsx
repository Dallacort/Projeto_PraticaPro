import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatusNfe } from '../../types';
import StatusNfeService from '../../services/statusNfeService';
import { FaSpinner, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';
import Icon from '../../components/Icon';

const StatusNfeList: React.FC = () => {
  const [statusList, setStatusList] = useState<StatusNfe[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchStatusNfe = async () => {
    try {
      const data = await StatusNfeService.list();
      setStatusList(data);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
      toast.error('Erro ao carregar lista de status de NFe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusNfe();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este status?')) {
      setDeleting(id);
      try {
        await StatusNfeService.delete(id);
        toast.success('Status de NFe excluído com sucesso!');
        fetchStatusNfe();
      } catch (error) {
        console.error('Erro ao excluir status:', error);
        toast.error('Erro ao excluir status de NFe');
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Icon Icon={FaSpinner} size={36} spinning className="text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Status de NFe</h1>
        <Link
          to="/status-nfe/novo"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark flex items-center"
        >
          <Icon Icon={FaPlus} className="mr-2" />
          Novo Status
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Cadastro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Modificação
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {statusList.map((status) => (
              <tr key={status.id}>
                <td className="px-6 py-4 whitespace-nowrap">{status.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      status.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {status.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {status.dataCadastro ? formatDate(status.dataCadastro) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {status.ultimaModificacao ? formatDate(status.ultimaModificacao) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/status-nfe/${status.id}`}
                    className="text-primary hover:text-primary-dark mr-4"
                  >
                    <Icon Icon={FaEdit} className="inline" />
                  </Link>
                  <button
                    onClick={() => handleDelete(status.id)}
                    disabled={deleting === status.id}
                    className="text-red-600 hover:text-red-900"
                  >
                    {deleting === status.id ? (
                      <Icon Icon={FaSpinner} spinning className="inline" />
                    ) : (
                      <Icon Icon={FaTrash} className="inline" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatusNfeList; 