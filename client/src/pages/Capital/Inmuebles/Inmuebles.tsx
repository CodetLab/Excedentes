// pages/Capital/Inmuebles/Inmuebles.tsx
import { useState, useEffect } from "react";
import { inmueblesService } from "../../../services/capital.service";
import type { InmuebleItem } from "../../../types/planillas";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import DataTable from "../../../components/DataTable";
import Modal from "../../../components/Modal";
import TableErrorBoundary from "../../../components/TableErrorBoundary";
import { safeNumber, safeCurrency } from "../../../utils/formatters";
import "../../../styles/planillas.css";

const TIPOS = [
  { value: "GALPON", label: "Galpón" },
  { value: "OFICINA", label: "Oficina" },
  { value: "DEPOSITO", label: "Depósito" },
  { value: "VIVIENDA", label: "Vivienda" },
  { value: "OTRO", label: "Otro" },
];

const initialForm: Omit<InmuebleItem, "id"> = {
  nombre: "", direccion: "", superficieM2: 0, valorUSD: 0,
  costoMantenimientoAnual: 0, depreciacionAnual: 0, tipo: "GALPON", notas: "",
};

const Inmuebles = () => {
  const [items, setItems] = useState<InmuebleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await inmueblesService.getAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "number" ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) await inmueblesService.update(editingId, form);
      else await inmueblesService.create(form);
      await loadData();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: InmuebleItem) => {
    setEditingId(item.id || null);
    setForm({ ...item, notas: item.notas || "" });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await inmueblesService.remove(id);
    await loadData();
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(initialForm); };

  const totals = items.reduce((acc, i) => ({
    m2: acc.m2 + i.superficieM2, valor: acc.valor + i.valorUSD,
    costoAnual: acc.costoAnual + i.costoMantenimientoAnual + i.depreciacionAnual,
  }), { m2: 0, valor: 0, costoAnual: 0 });

  return (
    <div className="planilla-page">
      <header className="page-header">
        <div><h1>Inmuebles</h1><p>Galpones, oficinas, depósitos y edificaciones</p></div>
        <Button onClick={() => setIsModalOpen(true)}>+ Agregar</Button>
      </header>
      {error && <div className="error-banner">{error}</div>}
      <div className="summary-cards">
        <Card className="summary-card"><span className="summary-label">Total M²</span><span className="summary-value">{safeNumber(totals.m2)}</span></Card>
        <Card className="summary-card"><span className="summary-label">Valor Total</span><span className="summary-value">{safeCurrency(totals.valor)}</span></Card>
        <Card className="summary-card"><span className="summary-label">Costo Anual</span><span className="summary-value">{safeCurrency(totals.costoAnual)}</span></Card>
      </div>
      <Card>
        {loading ? <div className="loading">Cargando...</div> : items.length === 0 ? (
          <div className="empty-state"><p>Sin inmuebles</p><Button onClick={() => setIsModalOpen(true)}>Agregar</Button></div>
        ) : (
          <TableErrorBoundary>
            <DataTable
              columns={[
                { key: "nombre", label: "Nombre" },
                { key: "tipo", label: "Tipo" },
                { key: "superficieM2", label: "M²", align: "right", render: v => safeNumber(v) },
                { key: "valorUSD", label: "Valor", align: "right", render: v => safeCurrency(v) },
                { key: "depreciacionAnual", label: "Deprec. Anual", align: "right", render: v => safeCurrency(v) },
              ]}
              data={items}
              onEdit={handleEdit}
              onDelete={i => handleDelete(i.id!)}
            />
          </TableErrorBoundary>
        )}
      </Card>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar" : "Nuevo Inmueble"}>
        <form onSubmit={handleSubmit} className="planilla-form">
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <Input label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} required />
          <div className="form-row">
            <Input label="Superficie (M²)" name="superficieM2" type="number" min={0} value={form.superficieM2} onChange={handleChange} />
            <Input label="Valor (USD)" name="valorUSD" type="number" min={0} value={form.valorUSD} onChange={handleChange} />
          </div>
          <div className="form-row">
            <Input label="Costo Mant. Anual" name="costoMantenimientoAnual" type="number" min={0} value={form.costoMantenimientoAnual} onChange={handleChange} />
            <Input label="Deprec. Anual" name="depreciacionAnual" type="number" min={0} value={form.depreciacionAnual} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label className="form-label">Tipo</label>
            <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange}>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" isLoading={saving}>{editingId ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Inmuebles;
