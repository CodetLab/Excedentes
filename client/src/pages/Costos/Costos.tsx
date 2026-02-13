import { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useCostos } from "./hooks/useCostos";
import type { Costo, CostoFormValues } from "./types";
import CostosTable from "./components/CostosTable";
import CostoForm from "./components/CostoForm";
import EditCostoModal from "./components/EditCostoModal";
import DeleteCostoDialog from "./components/DeleteCostoDialog";
import "./Costos.css";

const emptyForm: CostoFormValues = {
  nombre: "",
  etiqueta: "",
  monto: "",
  tipo: "FIJO",
};

const Costos = () => {
  const { items, isLoading, isSubmitting, error, reload, createCosto, updateCosto, deleteCosto } =
    useCostos();
  const [createValues, setCreateValues] = useState<CostoFormValues>(emptyForm);
  const [editing, setEditing] = useState<Costo | null>(null);
  const [editValues, setEditValues] = useState<CostoFormValues>(emptyForm);
  const [deleting, setDeleting] = useState<Costo | null>(null);

  const handleCreateChange = (field: keyof CostoFormValues, value: string) => {
    setCreateValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field: keyof CostoFormValues, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = async () => {
    try {
      await createCosto(createValues);
      setCreateValues(emptyForm);
    } catch (error) {
      return;
    }
  };

  const handleEditOpen = (item: Costo) => {
    setEditing(item);
    setEditValues({
      nombre: item.nombre,
      etiqueta: item.etiqueta,
      monto: String(item.monto),
      tipo: item.tipo,
    });
  };

  const handleEditSubmit = async () => {
    if (!editing) {
      return;
    }
    try {
      await updateCosto(editing._id, editValues);
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
      await deleteCosto(deleting._id);
      setDeleting(null);
    } catch (error) {
      return;
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Costos</h1>
          <p className="text-muted">Administra tus costos fijos y variables.</p>
        </div>
        <div className="page-actions">
          <Button type="button" variant="secondary" onClick={reload}>
            Recargar
          </Button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {isLoading && <div className="alert">Cargando costos...</div>}

      <div className="page-grid">
        <Card title="Nuevo costo">
          <CostoForm
            values={createValues}
            onChange={handleCreateChange}
            onSubmit={handleCreateSubmit}
            submitLabel="Crear costo"
            isSubmitting={isSubmitting}
          />
        </Card>

        <Card title="Listado">
          <CostosTable items={items} onEdit={handleEditOpen} onDelete={setDeleting} />
        </Card>
      </div>

      <EditCostoModal
        isOpen={Boolean(editing)}
        values={editValues}
        isSubmitting={isSubmitting}
        onChange={handleEditChange}
        onSubmit={handleEditSubmit}
        onClose={() => setEditing(null)}
      />

      <DeleteCostoDialog
        item={deleting}
        isSubmitting={isSubmitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
};

export default Costos;
