export interface DataTableColumn {
  header: string;
  accessorKey?: string;
  accessor?: string;
  cell?: ({ value }: { value: any }) => React.ReactNode;
}

export interface DataTableProps {
  data: any[];
  columns: any[];
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
} 