// pages/Personal/PersonalPropio/PersonalPropio.tsx
import { useState, useEffect } from "react";
import { personalPropioService } from "../../../services/personal.service";
import type { PersonalPropioItem } from "../../../types/planillas";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import DataTable from "../../../components/DataTable";
import Modal from "../../../components/Modal";
import "../../../styles/planillas.css";

const CARGOS = [
  { value: "ENCARGADO", label: "Encargado" }, { value: "OPERARIO", label: "Operario" },
  { value: "ADMINISTRATIVO", label: "Administrativo" }, { value: "TECNICO", label: "Técnico" }, { value: "OTRO", label: "Otro" },
];

const initialForm: Omit<PersonalPropioItem, "id"> = {
  nombre: "", apellido: "", documento: "", cargo: "OPERARIO", fechaIngreso: "", salarioMensualUSD: 0, cargosSocialesUSD: 0, costoTotalMensualUSD: 0, activo: true, notas: "",
};

const PersonalPropio = () => {
  const [items, setItems] = useState<PersonalPropioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { setLoading(true); setItems(await personalPropioService.getAll()); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setLoading(false); } };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: string | number | boolean = value;
    if (type === "number") val = parseFloat(value) || 0;
    if (type === "checkbox") val = (e.target as HTMLInputElement).checked;
    const newForm = { ...form, [name]: val };
    if (name === "salarioMensualUSD" || name === "cargosSocialesUSD") newForm.costoTotalMensualUSD = newForm.salarioMensualUSD + newForm.cargosSocialesUSD;
    setForm(newForm);
  };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { if (editingId) await personalPropioService.update(editingId, form); else await personalPropioService.create(form); await loadData(); closeModal(); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setSaving(false); } };
  const handleEdit = (item: PersonalPropioItem) => { setEditingId(item.id || null); setForm({ ...item }); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { if (confirm("¿Dar de baja?")) { await personalPropioService.remove(id); await loadData(); } };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(initialForm); };
  const activos = items.filter(i => i.activo);
  const totals = activos.reduce((a, i) => ({ salario: a.salario + i.salarioMensualUSD, cargos: a.cargos + i.cargosSocialesUSD, total: a.total + i.costoTotalMensualUSD }), { salario: 0, cargos: 0, total: 0 });

  return (
    <div className="planilla-page">
      <header className="page-header"><div><h1>Personal Propio</h1><p>Empleados en relación de dependencia</p></div><Button onClick={() => setIsModalOpen(true)}>+ Agregar</Button></header>
      {error && <div className="error-banner">{error}</div>}
      <div className="summary-cards">
        <Card className="summary-card"><span className="summary-label">Empleados Activos</span><span className="summary-value">{activos.length}</span></Card>
        <Card className="summary-card"><span className="summary-label">Salarios Mes</span><span className="summary-value">${totals.salario.toLocaleString()}</span></Card>
        <Card className="summary-card"><span className="summary-label">Cargos Sociales</span><span className="summary-value">${totals.cargos.toLocaleString()}</span></Card>
        <Card className="summary-card"><span className="summary-label">Costo Total Mes</span><span className="summary-value">${totals.total.toLocaleString()}</span></Card>
      </div>
      <Card>
        {loading ? <div className="loading">Cargando...</div> : items.length === 0 ? <div className="empty-state"><p>Sin personal</p><Button onClick={() => setIsModalOpen(true)}>Agregar</Button></div> : (
          <DataTable columns={[
            { key: "apellido", label: "Apellido" }, { key: "nombre", label: "Nombre" },
            { key: "cargo", label: "Cargo" },
            { key: "salarioMensualUSD", label: "Salario", align: "right", format: v => `$${v.toLocaleString()}` },
            { key: "costoTotalMensualUSD", label: "Costo Total", align: "right", format: v => `$${v.toLocaleString()}` },
            { key: "activo", label: "Estado", format: v => v ? "Activo" : "Inactivo" },
          ]} data={items} onEdit={handleEdit} onDelete={i => handleDelete(i.id!)} />
        )}
      </Card>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar" : "Nuevo Empleado"}>
        <form onSubmit={handleSubmit} className="planilla-form">
          <div className="form-row">
            <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            <Input label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <Input label="Documento" name="documento" value={form.documento} onChange={handleChange} />
            <div className="form-field"><label className="form-label">Cargo</label><select name="cargo" className="form-select" value={form.cargo} onChange={handleChange}>{CARGOS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          </div>
          <div className="form-row">
            <Input label="Fecha Ingreso" name="fechaIngreso" type="date" value={form.fechaIngreso} onChange={handleChange} />
            <div className="form-field checkbox-field"><label><input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} /> Activo</label></div>
          </div>
          <div className="form-row">
            <Input label="Salario Mensual USD" name="salarioMensualUSD" type="number" min={0} value={form.salarioMensualUSD} onChange={handleChange} />
            <Input label="Cargos Sociales USD" name="cargosSocialesUSD" type="number" min={0} value={form.cargosSocialesUSD} onChange={handleChange} />
          </div>
          <Input label="Costo Total Mensual" name="costoTotalMensualUSD" type="number" value={form.costoTotalMensualUSD} disabled />
          <div className="form-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button><Button type="submit" isLoading={saving}>{editingId ? "Guardar" : "Crear"}</Button></div>
        </form>
      </Modal>
    </div>
  );
};
export default PersonalPropio;
