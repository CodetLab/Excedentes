// pages/Personal/PersonalTerceros/PersonalTerceros.tsx
import { useState, useEffect } from "react";
import { personalTercerosService } from "../../../services/personal.service";
import type { PersonalTercerosItem } from "../../../types/planillas";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import DataTable from "../../../components/DataTable";
import Modal from "../../../components/Modal";
import "../../../styles/planillas.css";

const TIPOS_CONTRATO = [
  { value: "PERMANENTE", label: "Permanente" }, { value: "TEMPORARIO", label: "Temporario" },
  { value: "POR_OBRA", label: "Por Obra" }, { value: "ZAFRA", label: "Zafra" },
];

const initialForm: Omit<PersonalTercerosItem, "id"> = {
  proveedor: "", servicio: "", cantidadPersonas: 1, costoMensualUSD: 0, tipoContrato: "PERMANENTE", fechaInicio: "", fechaFin: "", activo: true, notas: "",
};

const PersonalTerceros = () => {
  const [items, setItems] = useState<PersonalTercerosItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { setLoading(true); setItems(await personalTercerosService.getAll()); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setLoading(false); } };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: string | number | boolean = value;
    if (type === "number") val = parseFloat(value) || 0;
    if (type === "checkbox") val = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: val });
  };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { if (editingId) await personalTercerosService.update(editingId, form); else await personalTercerosService.create(form); await loadData(); closeModal(); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setSaving(false); } };
  const handleEdit = (item: PersonalTercerosItem) => { setEditingId(item.id || null); setForm({ ...item }); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { if (confirm("¿Eliminar?")) { await personalTercerosService.remove(id); await loadData(); } };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(initialForm); };
  const activos = items.filter(i => i.activo);
  const totals = activos.reduce((a, i) => ({ personas: a.personas + i.cantidadPersonas, costo: a.costo + i.costoMensualUSD }), { personas: 0, costo: 0 });

  return (
    <div className="planilla-page">
      <header className="page-header"><div><h1>Personal de Terceros</h1><p>Servicios tercerizados y contratistas</p></div><Button onClick={() => setIsModalOpen(true)}>+ Agregar</Button></header>
      {error && <div className="error-banner">{error}</div>}
      <div className="summary-cards">
        <Card className="summary-card"><span className="summary-label">Servicios Activos</span><span className="summary-value">{activos.length}</span></Card>
        <Card className="summary-card"><span className="summary-label">Total Personas</span><span className="summary-value">{totals.personas}</span></Card>
        <Card className="summary-card"><span className="summary-label">Costo Mensual</span><span className="summary-value">${totals.costo.toLocaleString()}</span></Card>
      </div>
      <Card>
        {loading ? <div className="loading">Cargando...</div> : items.length === 0 ? <div className="empty-state"><p>Sin servicios</p><Button onClick={() => setIsModalOpen(true)}>Agregar</Button></div> : (
          <DataTable columns={[
            { key: "proveedor", label: "Proveedor" }, { key: "servicio", label: "Servicio" },
            { key: "cantidadPersonas", label: "Personas", align: "right" }, { key: "tipoContrato", label: "Contrato" },
            { key: "costoMensualUSD", label: "Costo Mensual", align: "right", format: v => `$${v.toLocaleString()}` },
            { key: "activo", label: "Estado", format: v => v ? "Activo" : "Inactivo" },
          ]} data={items} onEdit={handleEdit} onDelete={i => handleDelete(i.id!)} />
        )}
      </Card>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar" : "Nuevo Servicio"}>
        <form onSubmit={handleSubmit} className="planilla-form">
          <div className="form-row">
            <Input label="Proveedor" name="proveedor" value={form.proveedor} onChange={handleChange} required />
            <Input label="Servicio" name="servicio" value={form.servicio} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <Input label="Cantidad Personas" name="cantidadPersonas" type="number" min={1} value={form.cantidadPersonas} onChange={handleChange} />
            <div className="form-field"><label className="form-label">Tipo Contrato</label><select name="tipoContrato" className="form-select" value={form.tipoContrato} onChange={handleChange}>{TIPOS_CONTRATO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          </div>
          <div className="form-row">
            <Input label="Fecha Inicio" name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleChange} />
            <Input label="Fecha Fin" name="fechaFin" type="date" value={form.fechaFin || ""} onChange={handleChange} />
          </div>
          <div className="form-row">
            <Input label="Costo Mensual USD" name="costoMensualUSD" type="number" min={0} value={form.costoMensualUSD} onChange={handleChange} />
            <div className="form-field checkbox-field"><label><input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} /> Activo</label></div>
          </div>
          <Input label="Notas" name="notas" value={form.notas || ""} onChange={handleChange} />
          <div className="form-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button><Button type="submit" isLoading={saving}>{editingId ? "Guardar" : "Crear"}</Button></div>
        </form>
      </Modal>
    </div>
  );
};
export default PersonalTerceros;
