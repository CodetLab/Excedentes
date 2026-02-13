import Button from "@/components/Button";
import Table from "@/components/Table";
import { safeNumber } from "@/utils/formatters";
import type { Venta } from "../types";

type VentasTableProps = {
  items: Venta[];
  onEdit: (item: Venta) => void;
  onDelete: (item: Venta) => void;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("es-AR");
};

const VentasTable = ({ items, onEdit, onDelete }: VentasTableProps) => {
  if (items.length === 0) {
    return <p className="text-muted">No hay ventas registradas.</p>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Productos</th>
          <th>Total</th>
          <th className="table-actions">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item._id}>
            <td>{formatDate(item.date)}</td>
            <td className="numeric">{item.products?.length ?? 0}</td>
            <td className="numeric">{safeNumber(item.totalAmount)}</td>
            <td>
              <div className="row-actions">
                <Button type="button" variant="ghost" onClick={() => onEdit(item)}>
                  Editar
                </Button>
                <Button type="button" variant="danger" onClick={() => onDelete(item)}>
                  Eliminar
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default VentasTable;
