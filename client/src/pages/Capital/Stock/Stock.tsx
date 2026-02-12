// pages/Capital/Stock/Stock.tsx
import { useState, useEffect } from "react";
import { stockService } from "../../../services/capital.service";
import type { StockItem } from "../../../types/planillas";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import DataTable from "../../../components/DataTable";
import Modal from "../../../components/Modal";
import TableErrorBoundary from "../../../components/TableErrorBoundary";
import { safeCurrency } from "../../../utils/formatters";
import "../../../styles/planillas.css";

const CATEGORIAS = [
  { value: "INSUMOS", label: "Insumos" }, { value: "MATERIALES", label: "Materiales" },
  { value: "REPUESTOS", label: "Repuestos" }, { value: "PRODUCTOS", label: "Productos" }, { value: "OTRO", label: "Otro" },
];
const UNIDADES = [
  { value: "UNIDAD", label: "Unidad" }, { value: "KG", label: "Kilogramo" },
  { value: "LITRO", label: "Litro" }, { value: "METRO", label: "Metro" }, { value: "CAJA", label: "Caja" },
];

const initialForm: Omit<StockItem, "id"> = {
  nombre: "", categoria: "INSUMO", unidad: "UNIDAD", cantidadActual: 0, costoUnitarioUSD: 0, valorTotalUSD: 0, stockMinimo: 0, notas: "",
};

const Stock = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { setLoading(true); setItems(await stockService.getAll()); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setLoading(false); } };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newForm = { ...form, [name]: type === "number" ? parseFloat(value) || 0 : value };
    if (name === "cantidadActual" || name === "costoUnitarioUSD") newForm.valorTotalUSD = newForm.cantidadActual * newForm.costoUnitarioUSD;
    setForm(newForm);
  };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { if (editingId) await stockService.update(editingId, form); else await stockService.create(form); await loadData(); closeModal(); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setSaving(false); } };
  const handleEdit = (item: StockItem) => { setEditingId(item.id || null); setForm({ ...item }); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { if (confirm("¿Eliminar?")) { await stockService.remove(id); await loadData(); } };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(initialForm); };
  const totals = items.reduce((a, i) => ({ valor: a.valor + i.valorTotalUSD, bajo: a.bajo + (i.cantidadActual <= i.stockMinimo ? 1 : 0) }), { valor: 0, bajo: 0 });

  return (
    <div className="planilla-page">
      <header className="page-header"><div><h1>Stock</h1><p>Inventario de insumos y materiales</p></div><Button onClick={() => setIsModalOpen(true)}>+ Agregar</Button></header>
      {error && <div className="error-banner">{error}</div>}
      <div className="summary-cards">
        <Card className="summary-card"><span className="summary-label">Items</span><span className="summary-value">{items.length}</span></Card>
        <Card className="summary-card"><span className="summary-label">Valor Stock</span><span className="summary-value">{safeCurrency(totals.valor)}</span></Card>
        <Card className="summary-card"><span className="summary-label">Stock Bajo</span><span className="summary-value" style={{ color: totals.bajo > 0 ? "#ef4444" : "#22c55e" }}>{totals.bajo}</span></Card>
      </div>
      <Card>
        {loading ? <div className="loading">Cargando...</div> : items.length === 0 ? <div className="empty-state"><p>Sin stock</p><Button onClick={() => setIsModalOpen(true)}>Agregar</Button></div> : (
          <TableErrorBoundary>
            <DataTable columns={[
              { key: "nombre", label: "Nombre" }, { key: "categoria", label: "Categoría" },
              { key: "cantidadActual", label: "Cantidad", align: "right" }, { key: "unidad", label: "Unidad" },
              { key: "valorTotalUSD", label: "Valor", align: "right", render: v => safeCurrency(v) },
            ]} data={items.map(i => ({ ...i, _rowClass: i.cantidadActual <= i.stockMinimo ? "low-stock" : "" }))} onEdit={handleEdit} onDelete={i => handleDelete(i.id!)} />
          </TableErrorBoundary>
        )}
      </Card>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar" : "Nuevo Stock"}>
        <form onSubmit={handleSubmit} className="planilla-form">
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <div className="form-row">
            <div className="form-field"><label className="form-label">Categoría</label><select name="categoria" className="form-select" value={form.categoria} onChange={handleChange}>{CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
            <div className="form-field"><label className="form-label">Unidad</label><select name="unidad" className="form-select" value={form.unidad} onChange={handleChange}>{UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</select></div>
          </div>
          <div className="form-row">
            <Input label="Cantidad Actual" name="cantidadActual" type="number" min={0} value={form.cantidadActual} onChange={handleChange} />
            <Input label="Costo Unitario USD" name="costoUnitarioUSD" type="number" min={0} value={form.costoUnitarioUSD} onChange={handleChange} />
          </div>
          <div className="form-row">
            <Input label="Valor Total" name="valorTotalUSD" type="number" value={form.valorTotalUSD} disabled />
            <Input label="Stock Mínimo" name="stockMinimo" type="number" min={0} value={form.stockMinimo} onChange={handleChange} />
          </div>
          <Input label="Notas" name="notas" value={form.notas || ""} onChange={handleChange} />
          <div className="form-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button><Button type="submit" isLoading={saving}>{editingId ? "Guardar" : "Crear"}</Button></div>
        </form>
      </Modal>
    </div>
  );
};
export default Stock;
