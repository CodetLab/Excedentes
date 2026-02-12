// pages/Extras/Extras.tsx
import { useState, useEffect } from "react";
import { extrasService } from "../../services/datos.service";
import type { ExtrasItem } from "../../types/planillas";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import TableErrorBoundary from "../../components/TableErrorBoundary";
import { safeCurrency } from "../../utils/formatters";
import "../../styles/planillas.css";

const CATEGORIAS = [
  { value: "IMPUESTOS", label: "Impuestos" }, { value: "SEGUROS", label: "Seguros" },
  { value: "SERVICIOS", label: "Servicios" }, { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "ADMINISTRATIVO", label: "Administrativo" }, { value: "OTRO", label: "Otro" },
];
const FRECUENCIAS = [
  { value: "MENSUAL", label: "Mensual" }, { value: "BIMESTRAL", label: "Bimestral" },
  { value: "TRIMESTRAL", label: "Trimestral" }, { value: "SEMESTRAL", label: "Semestral" }, { value: "ANUAL", label: "Anual" },
];

const initialForm: Omit<ExtrasItem, "id"> = {
  concepto: "", categoria: "OTRO", montoUSD: 0, frecuencia: "MENSUAL", montoMensualUSD: 0, esCostoFijo: true, notas: "",
};

const calcularMensual = (monto: number, frecuencia: string): number => {
  const factores: Record<string, number> = { MENSUAL: 1, BIMESTRAL: 2, TRIMESTRAL: 3, SEMESTRAL: 6, ANUAL: 12 };
  return monto / (factores[frecuencia] || 1);
};

const Extras = () => {
  const [items, setItems] = useState<ExtrasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { setLoading(true); setItems(await extrasService.getAll()); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setLoading(false); } };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: string | number | boolean = value;
    if (type === "number") val = parseFloat(value) || 0;
    if (type === "checkbox") val = (e.target as HTMLInputElement).checked;
    const newForm = { ...form, [name]: val };
    if (name === "montoUSD" || name === "frecuencia") {
      newForm.montoMensualUSD = calcularMensual(
        name === "montoUSD" ? (val as number) : newForm.montoUSD,
        name === "frecuencia" ? (val as string) : newForm.frecuencia
      );
    }
    setForm(newForm);
  };
  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setSaving(true); 
    try { 
      // Mapear concepto → nombre para compatibilidad con backend
      const payload = {
        ...form,
        nombre: form.concepto, // Backend espera "nombre"
      };
      
      if (editingId) {
        await extrasService.update(editingId, payload);
      } else {
        await extrasService.create(payload);
      }
      await loadData(); 
      closeModal(); 
    } catch (e) { 
      setError(e instanceof Error ? e.message : "Error"); 
    } finally { 
      setSaving(false); 
    } 
  };
  const handleEdit = (item: ExtrasItem) => { setEditingId(item.id || null); setForm({ ...item }); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { if (confirm("¿Eliminar?")) { await extrasService.remove(id); await loadData(); } };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(initialForm); };
  const costosFijos = items.filter(i => i.esCostoFijo);
  const costosVariables = items.filter(i => !i.esCostoFijo);
  const totalFijosMes = costosFijos.reduce((a, i) => a + i.montoMensualUSD, 0);
  const totalVariablesMes = costosVariables.reduce((a, i) => a + i.montoMensualUSD, 0);

  return (
    <div className="planilla-page">
      <header className="page-header"><div><h1>Gastos Extra</h1><p>Costos fijos y variables adicionales</p></div><Button onClick={() => setIsModalOpen(true)}>+ Agregar</Button></header>
      {error && <div className="error-banner">{error}</div>}
      <div className="summary-cards">
        <Card className="summary-card"><span className="summary-label">Total Items</span><span className="summary-value">{items.length}</span></Card>
        <Card className="summary-card"><span className="summary-label">Costos Fijos/Mes</span><span className="summary-value">{safeCurrency(totalFijosMes)}</span></Card>
        <Card className="summary-card"><span className="summary-label">Costos Variables/Mes</span><span className="summary-value">{safeCurrency(totalVariablesMes)}</span></Card>
        <Card className="summary-card highlight"><span className="summary-label">Total Mensual</span><span className="summary-value">{safeCurrency(totalFijosMes + totalVariablesMes)}</span></Card>
      </div>
      <Card>
        {loading ? <div className="loading">Cargando...</div> : items.length === 0 ? <div className="empty-state"><p>Sin gastos extra</p><Button onClick={() => setIsModalOpen(true)}>Agregar</Button></div> : (
          <TableErrorBoundary>
            <DataTable columns={[
              { key: "concepto", label: "Concepto" }, { key: "categoria", label: "Categoría" },
              { key: "montoUSD", label: "Monto", align: "right", render: v => safeCurrency(v) },
              { key: "frecuencia", label: "Frecuencia" },
              { key: "montoMensualUSD", label: "Mensual", align: "right", render: v => safeCurrency(v) },
              { key: "esCostoFijo", label: "Tipo", render: v => v ? "Fijo" : "Variable" },
            ]} data={items} onEdit={handleEdit} onDelete={i => handleDelete(i.id!)} />
          </TableErrorBoundary>
        )}
      </Card>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar" : "Nuevo Gasto"}>
        <form onSubmit={handleSubmit} className="planilla-form">
          <Input label="Concepto" name="concepto" value={form.concepto} onChange={handleChange} required />
          <div className="form-row">
            <div className="form-field"><label className="form-label">Categoría</label><select name="categoria" className="form-select" value={form.categoria} onChange={handleChange}>{CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
            <div className="form-field"><label className="form-label">Frecuencia</label><select name="frecuencia" className="form-select" value={form.frecuencia} onChange={handleChange}>{FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select></div>
          </div>
          <div className="form-row">
            <Input label="Monto USD" name="montoUSD" type="number" min={0} value={form.montoUSD} onChange={handleChange} />
            <Input label="Monto Mensual (calculado)" name="montoMensualUSD" type="number" value={form.montoMensualUSD} disabled />
          </div>
          <div className="form-field checkbox-field"><label><input type="checkbox" name="esCostoFijo" checked={form.esCostoFijo} onChange={handleChange} /> Es Costo Fijo</label></div>
          <Input label="Notas" name="notas" value={form.notas || ""} onChange={handleChange} />
          <div className="form-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button><Button type="submit" isLoading={saving}>{editingId ? "Guardar" : "Crear"}</Button></div>
        </form>
      </Modal>
    </div>
  );
};
export default Extras;
