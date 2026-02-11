import Button from "@/components/Button";
import Table from "@/components/Table";
import type { Costo } from "../types";

type CostosTableProps = {
  items: Costo[];
  onEdit: (item: Costo) => void;
  onDelete: (item: Costo) => void;
};

const CostosTable = ({ items, onEdit, onDelete }: CostosTableProps) => {
  if (items.length === 0) {
    return <p className="text-muted">No hay costos registrados.</p>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Etiqueta</th>
          <th>Monto</th>
          <th>Tipo</th>
          <th className="table-actions">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item._id}>
            <td>{item.nombre}</td>
            <td>{item.etiqueta}</td>
            <td className="numeric">{item.monto.toLocaleString("es-AR")}</td>
            <td>
              <span className={item.tipo === "FIJO" ? "badge badge-primary" : "badge"}>
                {item.tipo}
              </span>
            </td>
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

export default CostosTable;
