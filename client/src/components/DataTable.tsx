// components/DataTable.tsx
import React from "react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  align?: "left" | "center" | "right";
  format?: (value: any, item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  keyField?: keyof T;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
  keyField = "id" as keyof T,
}: DataTableProps<T>) {
  const getValue = (item: T, key: string): any => {
    return key.split(".").reduce((obj, k) => obj?.[k], item as any);
  };

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} style={{ textAlign: col.align || "left" }}>
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th style={{ textAlign: "center" }}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item[keyField] ?? index} className={item._rowClass || ""}>
              {columns.map((col) => {
                const value = getValue(item, String(col.key));
                return (
                  <td key={String(col.key)} style={{ textAlign: col.align || "left" }}>
                    {col.format ? col.format(value, item) : String(value ?? "")}
                  </td>
                );
              })}
              {(onEdit || onDelete) && (
                <td style={{ textAlign: "center" }}>
                  <div className="action-buttons">
                    {onEdit && (
                      <button type="button" className="btn-icon btn-edit" onClick={() => onEdit(item)} title="Editar">
                        ✏️
                      </button>
                    )}
                    {onDelete && (
                      <button type="button" className="btn-icon btn-delete" onClick={() => onDelete(item)} title="Eliminar">
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
