// components/DataTable.tsx
import React from "react";
import { safeString } from "../utils/formatters";

/**
 * Definición estricta de columna
 * - key: identificador de la propiedad
 * - label: texto del encabezado
 * - render: función que recibe el valor Y el item completo
 */
export interface Column<T> {
  key: keyof T | string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  keyField?: keyof T;
}

/**
 * DataTable completamente blindado contra datos inválidos
 * - Valida que data sea un array
 * - Valida cada valor antes de renderizar
 * - Nunca lanza errores por valores undefined/null
 * - Usa render en lugar de format para mayor claridad
 */
function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
  keyField = "id" as keyof T,
}: DataTableProps<T>) {
  // VALIDACIÓN: Si data no es array válido, no renderizar nada
  if (!data || !Array.isArray(data)) {
    return null;
  }

  /**
   * Obtiene un valor anidado de manera segura
   * Soporta paths como "user.name"
   */
  const getValue = (item: T, key: string): any => {
    if (!item) return undefined;
    return key.split(".").reduce((obj, k) => obj?.[k], item as any);
  };

  /**
   * Renderiza el contenido de una celda de manera segura
   * - Si value es null/undefined y no es 0 → muestra "-"
   * - Si hay render → lo ejecuta con el valor y el row
   * - Si no hay render → convierte a string seguro
   */
  const renderCell = (column: Column<T>, value: any, row: T): React.ReactNode => {
    // Si el valor es null/undefined (pero no 0), mostrar fallback
    if (value === null || value === undefined) {
      return column.render ? column.render(value, row) : "-";
    }

    // Si hay render personalizado, usarlo
    if (column.render) {
      try {
        return column.render(value, row);
      } catch (error) {
        console.error(`Error en render de columna "${String(column.key)}":`, error);
        return "-";
      }
    }

    // Fallback: convertir a string seguro
    return safeString(value, "-");
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
          {data.map((item, index) => {
            // Usar keyField si existe, sino usar index
            const rowKey = item?.[keyField] ?? index;
            
            return (
              <tr key={rowKey} className={item?._rowClass || ""}>
                {columns.map((col) => {
                  const value = getValue(item, String(col.key));
                  
                  return (
                    <td key={String(col.key)} style={{ textAlign: col.align || "left" }}>
                      {renderCell(col, value, item)}
                    </td>
                  );
                })}
                {(onEdit || onDelete) && (
                  <td style={{ textAlign: "center" }}>
                    <div className="action-buttons">
                      {onEdit && (
                        <button 
                          type="button" 
                          className="btn-icon btn-edit" 
                          onClick={() => onEdit(item)} 
                          title="Editar"
                        >
                          ✏️
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          type="button" 
                          className="btn-icon btn-delete" 
                          onClick={() => onDelete(item)} 
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
