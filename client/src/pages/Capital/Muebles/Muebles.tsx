// pages/Capital/Muebles/Muebles.tsx
import { useState, useEffect } from "react";
import { mueblesService } from "../../../services/capital.service";
import type { MuebleItem } from "../../../types/planillas";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import DataTable from "../../../components/DataTable";
import Modal from "../../../components/Modal";
import TableErrorBoundary from "../../../components/TableErrorBoundary";
import { safeCurrency } from "../../../utils/formatters";
import "../../../styles/planillas.css";

const initialForm: Omit<MuebleItem, "id"> = {
  nombre: "", descripcion: "", cantidad: 1, valorUnitarioUSD: 0,
  valorTotalUSD: 0, depreciacionAnual: 0, ubicacion: "", notas: "",
};

const Muebles = () => {
  const [items, setItems] = useState<MuebleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setLoading(true); setItems(await mueblesService.getAll()); }
    catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newForm = { ...form, [name]: type === "number" ? parseFloat(value) || 0 : value };
    if (name === "cantidad" || name === "valorUnitarioUSD") {
      newForm.valorTotalUSD = newForm.cantidad * newForm.valorUnitarioUSD;
    }
    setForm(newForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId) await mueblesService.update(editingId, form);
      else await mueblesService.create(form);
      await loadData(); closeModal();
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleEdit = (item: MuebleItem) => { setEditingId(item.id || null); setForm({ ...item }); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { if (confirm("¿Eliminar?")) { await mueblesService.remove(id); await loadData(); } };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(initialForm); };

  const totals = items.reduce((a, i) => ({ valor: a.valor + i.valorTotalUSD, deprec: a.deprec + i.depreciacionAnual }), { valor: 0, deprec: 0 });

  return (
    <div className="planilla-page">
      <header className="page-header">
        <div><h1>Muebles</h1><p>Mobiliario y equipamiento</p></div>
        <Button onClick={() => setIsModalOpen(true)}>+ Agregar</Button>
      </header>
      {error && <div className="error-banner">{error}</div>}
      <div className="summary-cards">
        <Card className="summary-card"><span className="summary-label">Items</span><span className="summary-value">{items.length}</span></Card>
        <Card className="summary-card"><span className="summary-label">Valor Total</span><span className="summary-value">{safeCurrency(totals.valor)}</span></Card>
        <Card className="summary-card"><span className="summary-label">Deprec. Anual</span><span className="summary-value">{safeCurrency(totals.deprec)}</span></Card>
      </div>
      <Card>
        {loading ? <div className="loading">Cargando...</div> : items.length === 0 ? (
          <div className="empty-state"><p>Sin muebles</p><Button onClick={() => setIsModalOpen(true)}>Agregar</Button></div>
        ) : (
          <TableErrorBoundary>
            <DataTable columns={[
              { key: "nombre", label: "Nombre" },
              { key: "cantidad", label: "Cant.", align: "right" },
              { key: "valorUnitarioUSD", label: "$/Unidad", align: "right", render: v => safeCurrency(v) },
              { key: "valorTotalUSD", label: "Total", align: "right", render: v => safeCurrency(v) },
              { key: "depreciacionAnual", label: "Deprec.", align: "right", render: v => safeCurrency(v) },
            ]} data={items} onEdit={handleEdit} onDelete={i => handleDelete(i.id!)} />
          </TableErrorBoundary>
        )}
      </Card>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar" : "Nuevo Mueble"}>
        <form onSubmit={handleSubmit} className="planilla-form">
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <Input label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} />
          <div className="form-row">
            <Input label="Cantidad" name="cantidad" type="number" min={1} value={form.cantidad} onChange={handleChange} />
            <Input label="Valor Unitario (USD)" name="valorUnitarioUSD" type="number" min={0} value={form.valorUnitarioUSD} onChange={handleChange} />
          </div>
          <div className="form-row">
            <Input label="Valor Total (USD)" name="valorTotalUSD" type="number" value={form.valorTotalUSD} onChange={handleChange} disabled />
            <Input label="Deprec. Anual" name="depreciacionAnual" type="number" min={0} value={form.depreciacionAnual} onChange={handleChange} />
          </div>
          <Input label="Ubicación" name="ubicacion" value={form.ubicacion || ""} onChange={handleChange} />
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" isLoading={saving}>{editingId ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Muebles;
