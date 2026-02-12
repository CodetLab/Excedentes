// pages/Capital/Vehiculos/Vehiculos.tsx
import { useState, useEffect } from "react";
import { vehiculosService } from "../../../services/capital.service";
import type { VehiculoItem } from "../../../types/planillas";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import DataTable from "../../../components/DataTable";
import Modal from "../../../components/Modal";
import TableErrorBoundary from "../../../components/TableErrorBoundary";
import { safeCurrency } from "../../../utils/formatters";
import "../../../styles/planillas.css";

const TIPOS = [
  { value: "AUTO", label: "Auto" }, { value: "CAMION", label: "Camión" },
  { value: "TRACTOR", label: "Tractor" }, { value: "MOTO", label: "Moto" }, { value: "OTRO", label: "Otro" },
];

const initialForm: Omit<VehiculoItem, "id"> = {
  tipo: "AUTO", marca: "", modelo: "", anio: new Date().getFullYear(), patente: "",
  valorUSD: 0, costoMantenimientoAnual: 0, depreciacionAnual: 0, kmActuales: 0, notas: "",
};

const Vehiculos = () => {
  const [items, setItems] = useState<VehiculoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { setLoading(true); setItems(await vehiculosService.getAll()); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setLoading(false); } };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value, type } = e.target; setForm(prev => ({ ...prev, [name]: type === "number" ? parseFloat(value) || 0 : value })); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { if (editingId) await vehiculosService.update(editingId, form); else await vehiculosService.create(form); await loadData(); closeModal(); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setSaving(false); } };
  const handleEdit = (item: VehiculoItem) => { setEditingId(item.id || null); setForm({ ...item }); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { if (confirm("¿Eliminar?")) { await vehiculosService.remove(id); await loadData(); } };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(initialForm); };
  const totals = items.reduce((a, i) => ({ valor: a.valor + i.valorUSD, costo: a.costo + i.costoMantenimientoAnual + i.depreciacionAnual }), { valor: 0, costo: 0 });

  return (
    <div className="planilla-page">
      <header className="page-header"><div><h1>Vehículos</h1><p>Autos, camiones, tractores y motos</p></div><Button onClick={() => setIsModalOpen(true)}>+ Agregar</Button></header>
      {error && <div className="error-banner">{error}</div>}
      <div className="summary-cards">
        <Card className="summary-card"><span className="summary-label">Vehículos</span><span className="summary-value">{items.length}</span></Card>
        <Card className="summary-card"><span className="summary-label">Valor Total</span><span className="summary-value">{safeCurrency(totals.valor)}</span></Card>
        <Card className="summary-card"><span className="summary-label">Costo Anual</span><span className="summary-value">{safeCurrency(totals.costo)}</span></Card>
      </div>
      <Card>
        {loading ? <div className="loading">Cargando...</div> : items.length === 0 ? <div className="empty-state"><p>Sin vehículos</p><Button onClick={() => setIsModalOpen(true)}>Agregar</Button></div> : (
          <TableErrorBoundary>
            <DataTable columns={[
              { key: "tipo", label: "Tipo" },
              { key: "marca", label: "Marca" },
              { key: "modelo", label: "Modelo" },
              { key: "anio", label: "Año", align: "right" },
              { key: "valorUSD", label: "Valor", align: "right", render: v => safeCurrency(v) },
              { key: "depreciacionAnual", label: "Deprec.", align: "right", render: v => safeCurrency(v) },
            ]} data={items} onEdit={handleEdit} onDelete={i => handleDelete(i.id!)} />
          </TableErrorBoundary>
        )}
      </Card>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar" : "Nuevo Vehículo"}>
        <form onSubmit={handleSubmit} className="planilla-form">
          <div className="form-row">
            <div className="form-field"><label className="form-label">Tipo</label><select name="tipo" className="form-select" value={form.tipo} onChange={handleChange}>{TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <Input label="Marca" name="marca" value={form.marca} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <Input label="Modelo" name="modelo" value={form.modelo} onChange={handleChange} required />
            <Input label="Año" name="anio" type="number" value={form.anio} onChange={handleChange} />
          </div>
          <div className="form-row">
            <Input label="Patente" name="patente" value={form.patente || ""} onChange={handleChange} />
            <Input label="Valor (USD)" name="valorUSD" type="number" min={0} value={form.valorUSD} onChange={handleChange} />
          </div>
          <div className="form-row">
            <Input label="Costo Mant. Anual" name="costoMantenimientoAnual" type="number" min={0} value={form.costoMantenimientoAnual} onChange={handleChange} />
            <Input label="Deprec. Anual" name="depreciacionAnual" type="number" min={0} value={form.depreciacionAnual} onChange={handleChange} />
          </div>
          <div className="form-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button><Button type="submit" isLoading={saving}>{editingId ? "Guardar" : "Crear"}</Button></div>
        </form>
      </Modal>
    </div>
  );
};
export default Vehiculos;
