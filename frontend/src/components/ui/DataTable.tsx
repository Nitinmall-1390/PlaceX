import React, { useState } from 'react';
import { cn } from '../../utils';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found in database.',
  isLoading = false,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const res = valA < valB ? -1 : 1;
      return sortDir === 'asc' ? res : -res;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className={cn('w-full overflow-x-auto border border-[#262B38] bg-[#12151C]', className)}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#262B38] bg-[#0A0C10]/80">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-3 font-mono text-[11px] font-medium tracking-wider text-[#8B93A7] uppercase select-none',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.sortable && 'cursor-pointer hover:text-[#E7EAF0]'
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.header}</span>
                  {col.sortable && (
                    <span className="text-[#565E70]">
                      {sortKey !== col.key && <ArrowUpDown className="h-3 w-3" />}
                      {sortKey === col.key && sortDir === 'asc' && <ArrowUp className="h-3 w-3 text-[#4C8DFF]" />}
                      {sortKey === col.key && sortDir === 'desc' && <ArrowDown className="h-3 w-3 text-[#4C8DFF]" />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#262B38]/50">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[#8B93A7] font-mono text-xs">
                <span className="animate-pulse">LOADING DATA ENGINE...</span>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[#565E70] font-mono text-xs">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, idx) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'transition-colors duration-120 hover:bg-[#171B24]',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-[#E7EAF0] align-middle',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                  >
                    {col.render ? col.render(row, idx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
