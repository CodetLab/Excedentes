import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useVentas } from "./hooks/useVentas";
import type { Venta, VentaFormValues } from "./types";
import VentasTable from "./components/VentasTable";
import VentaForm from "./components/VentaForm";
import EditVentaModal from "./components/EditVentaModal";
import DeleteVentaDialog from "./components/DeleteVentaDialog";
import "./Ventas.css";

const emptyForm: VentaFormValues = {
  productId: "",
  quantity: "1",
  unitPrice: "",
  totalAmount: "",
  date: "",
};

const Ventas = () => {
  const { items, isLoading, isSubmitting, error, reload, createVenta, updateVenta, deleteVenta } = useVentas();
  const [createValues, setCreateValues] = useState<VentaFormValues>(emptyForm);
  const [editing, setEditing] = useState<Venta | null>(null);
  const [editValues, setEditValues] = useState<VentaFormValues>(emptyForm);
  const [deleting, setDeleting] = useState<Venta | null>(null);

  const handleCreateChange = (field: keyof VentaFormValues, value: string) => {
    setCreateValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field: keyof VentaFormValues, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = async () => {
    try {
      await createVenta(createValues);
      setCreateValues(emptyForm);
    } catch (error) {
      return;
    }
  };

  const handleEditOpen = (item: Venta) => {
    const firstProduct = item.products?.[0];
    setEditing(item);
    setEditValues({
      productId: firstProduct?.productId || "",
      quantity: firstProduct?.quantity ? String(firstProduct.quantity) : "1",
      unitPrice: firstProduct?.unitPrice ? String(firstProduct.unitPrice) : "",
      totalAmount: String(item.totalAmount),
      date: item.date ? item.date.slice(0, 10) : "",
    });
  };

  const handleEditSubmit = async () => {
    if (!editing) {
      return;
    }
    try {
      await updateVenta(editing._id, editValues);
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
      await deleteVenta(deleting._id);
      setDeleting(null);
    } catch (error) {
      return;
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Ventas</h1>
          <p className="text-muted">Registra ventas y controla resultados.</p>
        </div>
        <div className="page-actions">
          <Button type="button" variant="secondary" onClick={reload}>
            Recargar
          </Button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {isLoading && <div className="alert">Cargando ventas...</div>}

      <div className="page-grid">
        <Card title="Nueva venta">
          <VentaForm
            values={createValues}
            onChange={handleCreateChange}
            onSubmit={handleCreateSubmit}
            submitLabel="Crear venta"
            isSubmitting={isSubmitting}
          />
        </Card>

        <Card title="Listado">
          <VentasTable items={items} onEdit={handleEditOpen} onDelete={setDeleting} />
        </Card>
      </div>

      <EditVentaModal
        isOpen={Boolean(editing)}
        values={editValues}
        isSubmitting={isSubmitting}
        onChange={handleEditChange}
        onSubmit={handleEditSubmit}
        onClose={() => setEditing(null)}
      />

      <DeleteVentaDialog
        item={deleting}
        isSubmitting={isSubmitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
};

export default Ventas;
