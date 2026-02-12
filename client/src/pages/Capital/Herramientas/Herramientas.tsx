// pages/Capital/Herramientas/Herramientas.tsx
import { useState, useEffect } from "react";
import { herramientasService } from "../../../services/capital.service";
import type { HerramientaItem } from "../../../types/planillas";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import DataTable from "../../../components/DataTable";
import Modal from "../../../components/Modal";
import "../../../styles/planillas.css";

const CATEGORIAS = [
  { value: "MANUAL", label: "Manual" }, { value: "ELECTRICA", label: "Eléctrica" },
  { value: "NEUMATICA", label: "Neumática" }, { value: "AGRICOLA", label: "Agrícola" }, { value: "OTRO", label: "Otro" },
];
const ESTADOS = [{ value: "BUENO", label: "Bueno" }, { value: "REGULAR", label: "Regular" }, { value: "MALO", label: "Malo" }];

const initialForm: Omit<HerramientaItem, "id"> = {
  nombre: "", categoria: "MANUAL", cantidad: 1, valorUnitarioUSD: 0, valorTotalUSD: 0, depreciacionAnual: 0, estado: "BUENO", notas: "",
};

const Herramientas = () => {
  const [items, setItems] = useState<HerramientaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { setLoading(true); setItems(await herramientasService.getAll()); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setLoading(false); } };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newForm = { ...form, [name]: type === "number" ? parseFloat(value) || 0 : value };
    if (name === "cantidad" || name === "valorUnitarioUSD") newForm.valorTotalUSD = newForm.cantidad * newForm.valorUnitarioUSD;
    setForm(newForm);
  };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { if (editingId) await herramientasService.update(editingId, form); else await herramientasService.create(form); await loadData(); closeModal(); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setSaving(false); } };
  const handleEdit = (item: HerramientaItem) => { setEditingId(item.id || null); setForm({ ...item }); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { if (confirm("¿Eliminar?")) { await herramientasService.remove(id); await loadData(); } };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(initialForm); };
  const totals = items.reduce((a, i) => ({ valor: a.valor + i.valorTotalUSD, deprec: a.deprec + i.depreciacionAnual }), { valor: 0, deprec: 0 });

  return (
    <div className="planilla-page">
      <header className="page-header"><div><h1>Herramientas</h1><p>Herramientas manuales y eléctricas</p></div><Button onClick={() => setIsModalOpen(true)}>+ Agregar</Button></header>
      {error && <div className="error-banner">{error}</div>}
      <div className="summary-cards">
        <Card className="summary-card"><span className="summary-label">Items</span><span className="summary-value">{items.length}</span></Card>
        <Card className="summary-card"><span className="summary-label">Valor Total</span><span className="summary-value">${totals.valor.toLocaleString()}</span></Card>
        <Card className="summary-card"><span className="summary-label">Deprec. Anual</span><span className="summary-value">${totals.deprec.toLocaleString()}</span></Card>
      </div>
      <Card>
        {loading ? <div className="loading">Cargando...</div> : items.length === 0 ? <div className="empty-state"><p>Sin herramientas</p><Button onClick={() => setIsModalOpen(true)}>Agregar</Button></div> : (
          <DataTable columns={[
            { key: "nombre", label: "Nombre" }, { key: "categoria", label: "Categoría" },
            { key: "cantidad", label: "Cant.", align: "right" }, { key: "valorTotalUSD", label: "Valor", align: "right", format: v => `$${v.toLocaleString()}` },
            { key: "estado", label: "Estado" },
          ]} data={items} onEdit={handleEdit} onDelete={i => handleDelete(i.id!)} />
        )}
      </Card>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar" : "Nueva Herramienta"}>
        <form onSubmit={handleSubmit} className="planilla-form">
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <div className="form-row">
            <div className="form-field"><label className="form-label">Categoría</label><select name="categoria" className="form-select" value={form.categoria} onChange={handleChange}>{CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
            <div className="form-field"><label className="form-label">Estado</label><select name="estado" className="form-select" value={form.estado} onChange={handleChange}>{ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}</select></div>
          </div>
          <div className="form-row">
            <Input label="Cantidad" name="cantidad" type="number" min={1} value={form.cantidad} onChange={handleChange} />
            <Input label="Valor Unitario" name="valorUnitarioUSD" type="number" min={0} value={form.valorUnitarioUSD} onChange={handleChange} />
          </div>
          <div className="form-row">
            <Input label="Valor Total" name="valorTotalUSD" type="number" value={form.valorTotalUSD} disabled />
            <Input label="Deprec. Anual" name="depreciacionAnual" type="number" min={0} value={form.depreciacionAnual} onChange={handleChange} />
          </div>
          <div className="form-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button><Button type="submit" isLoading={saving}>{editingId ? "Guardar" : "Crear"}</Button></div>
        </form>
      </Modal>
    </div>
  );
};
export default Herramientas;
