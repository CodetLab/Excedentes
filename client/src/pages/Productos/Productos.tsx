import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useProductos } from "./hooks/useProductos";
import type { Producto, ProductoFormValues } from "./types";
import ProductosTable from "./components/ProductosTable";
import ProductoForm from "./components/ProductoForm";
import EditProductoModal from "./components/EditProductoModal";
import DeleteProductoDialog from "./components/DeleteProductoDialog";
import "./productos.css";

const emptyForm: ProductoFormValues = {
  name: "",
  price: "",
  cost: "",
  stock: "0",
};

const Productos = () => {
  const { items, isLoading, isSubmitting, error, reload, createProducto, updateProducto, deleteProducto } =
    useProductos();
  const [createValues, setCreateValues] = useState<ProductoFormValues>(emptyForm);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [editValues, setEditValues] = useState<ProductoFormValues>(emptyForm);
  const [deleting, setDeleting] = useState<Producto | null>(null);

  const handleCreateChange = (field: keyof ProductoFormValues, value: string) => {
    setCreateValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field: keyof ProductoFormValues, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = async () => {
    try {
      await createProducto(createValues);
      setCreateValues(emptyForm);
    } catch (error) {
      return;
    }
  };

  const handleEditOpen = (item: Producto) => {
    setEditing(item);
    setEditValues({
      name: item.name,
      price: String(item.price),
      cost: String(item.cost),
      stock: String(item.stock),
    });
  };

  const handleEditSubmit = async () => {
    if (!editing) {
      return;
    }
    try {
      await updateProducto(editing._id, editValues);
      setEditing(null);
    } catch (error) {
      return;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) {
      return;
    }
    try {
      await deleteProducto(deleting._id);
      setDeleting(null);
    } catch (error) {
      return;
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Productos</h1>
          <p className="text-muted">Controla precios, costos y stock.</p>
        </div>
        <div className="page-actions">
          <Button type="button" variant="secondary" onClick={reload}>
            Recargar
          </Button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {isLoading && <div className="alert">Cargando productos...</div>}

      <div className="page-grid">
        <Card title="Nuevo producto">
          <ProductoForm
            values={createValues}
            onChange={handleCreateChange}
            onSubmit={handleCreateSubmit}
            submitLabel="Crear producto"
            isSubmitting={isSubmitting}
          />
        </Card>

        <Card title="Listado">
          <ProductosTable items={items} onEdit={handleEditOpen} onDelete={setDeleting} />
        </Card>
      </div>

      <EditProductoModal
        isOpen={Boolean(editing)}
        values={editValues}
        isSubmitting={isSubmitting}
        onChange={handleEditChange}
        onSubmit={handleEditSubmit}
        onClose={() => setEditing(null)}
      />

      <DeleteProductoDialog
        item={deleting}
        isSubmitting={isSubmitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
};

export default Productos;
