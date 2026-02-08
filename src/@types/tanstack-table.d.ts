// src/@types/tanstack-table.d.ts
import "@tanstack/react-table"; // Importa o módulo original para estendê-lo

declare module "@tanstack/react-table" {
  // Estende a interface ColumnMeta para aceitar className
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}
