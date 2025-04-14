import React from 'react';
import DataTable from './DataTable';
import { DataTableColumn } from './DataTable/types';

// Interface que representa o tipo Column que está causando o conflito
interface Column {
  header: string;
  accessor: string;
  cell?: any;
}

interface TableAdapterProps {
  data: any[];
  columns: DataTableColumn[];
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}

const TableAdapter: React.FC<TableAdapterProps> = ({ data, columns, onEdit, onDelete }) => {
  // Criamos um novo array de colunas compatível com o tipo esperado
  const adaptedColumns = columns.map(col => ({
    ...col,
    accessor: col.accessorKey || col.accessor || '',
  }));

  return (
    <DataTable
      data={data}
      columns={adaptedColumns}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default TableAdapter; 