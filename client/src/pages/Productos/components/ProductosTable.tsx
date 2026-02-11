import Button from "@/components/Button";
import Table from "@/components/Table";
import type { Producto } from "../types";

type ProductosTableProps = {
  items: Producto[];
  onEdit: (item: Producto) => void;
  onDelete: (item: Producto) => void;
};

const ProductosTable = ({ items, onEdit, onDelete }: ProductosTableProps) => {
  if (items.length === 0) {
    return <p className="text-muted">No hay productos registrados.</p>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Costo</th>
          <th>Stock</th>
          <th className="table-actions">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item._id}>
            <td>{item.name}</td>
            <td className="numeric">{item.price.toLocaleString("es-AR")}</td>
            <td className="numeric">{item.cost.toLocaleString("es-AR")}</td>
            <td className="numeric">{item.stock}</td>
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

export default ProductosTable;
