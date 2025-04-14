import React from 'react';
import { DataTableProps } from './types';

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete
}) => {
  const getValue = (item: any, path: string) => {
    if (!path) return '';
    const keys = path.split('.');
    let value = item;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column: any, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column: any, colIndex) => {
                const accessKey = column.accessorKey || column.accessor;
                return (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {column.cell
                      ? column.cell({ value: getValue(item, accessKey) })
                      : getValue(item, accessKey)}
                  </td>
                );
              })}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {onEdit && (
                  <button
                    onClick={() => onEdit(item.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable; 