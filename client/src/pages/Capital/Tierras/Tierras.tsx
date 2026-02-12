// pages/Capital/Tierras/Tierras.tsx
// Planilla de carga: Tierras

import { useState, useEffect } from "react";
import { tierrasService } from "../../../services/capital.service";
import type { TierraItem } from "../../../types/planillas";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import DataTable from "../../../components/DataTable";
import Modal from "../../../components/Modal";
import "./Tierras.css";

const TIPOS_USO = [
  { value: "AGRICOLA", label: "Agrícola" },
  { value: "GANADERO", label: "Ganadero" },
  { value: "MIXTO", label: "Mixto" },
  { value: "OTRO", label: "Otro" },
];

const initialForm: Omit<TierraItem, "id"> = {
  nombre: "",
  ubicacion: "",
  superficieHa: 0,
  valorUSD: 0,
  costoMantenimientoAnual: 0,
  tipoUso: "AGRICOLA",
  notas: "",
};

const Tierras = () => {
  const [items, setItems] = useState<TierraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await tierrasService.getAll();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await tierrasService.update(editingId, form);
      } else {
        await tierrasService.create(form);
      }
      await loadData();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: TierraItem) => {
    setEditingId(item.id || null);
    setForm({
      nombre: item.nombre,
      ubicacion: item.ubicacion,
      superficieHa: item.superficieHa,
      valorUSD: item.valorUSD,
      costoMantenimientoAnual: item.costoMantenimientoAnual,
      tipoUso: item.tipoUso,
      notas: item.notas || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta tierra?")) return;
    try {
      await tierrasService.remove(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error eliminando");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const totals = items.reduce(
    (acc, item) => ({
      superficie: acc.superficie + item.superficieHa,
      valor: acc.valor + item.valorUSD,
      costoAnual: acc.costoAnual + item.costoMantenimientoAnual,
    }),
    { superficie: 0, valor: 0, costoAnual: 0 }
  );

  return (
    <div className="tierras-page">
      <header className="page-header">
        <div>
          <h1>Tierras</h1>
          <p>Planilla de carga de tierras y terrenos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Agregar Tierra</Button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {/* Resumen */}
      <div className="summary-cards">
        <Card className="summary-card">
          <span className="summary-label">Total Hectáreas</span>
          <span className="summary-value">{totals.superficie.toLocaleString()} ha</span>
        </Card>
        <Card className="summary-card">
          <span className="summary-label">Valor Total</span>
          <span className="summary-value">${totals.valor.toLocaleString()}</span>
        </Card>
        <Card className="summary-card">
          <span className="summary-label">Costo Anual</span>
          <span className="summary-value">${totals.costoAnual.toLocaleString()}</span>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>No hay tierras registradas</p>
            <Button onClick={() => setIsModalOpen(true)}>Agregar primera tierra</Button>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: "nombre", label: "Nombre" },
              { key: "ubicacion", label: "Ubicación" },
              { key: "superficieHa", label: "Hectáreas", align: "right" },
              { key: "valorUSD", label: "Valor (USD)", align: "right", format: (v) => `$${v.toLocaleString()}` },
              { key: "costoMantenimientoAnual", label: "Costo Anual", align: "right", format: (v) => `$${v.toLocaleString()}` },
              { key: "tipoUso", label: "Tipo Uso" },
            ]}
            data={items}
            onEdit={handleEdit}
            onDelete={(item) => handleDelete(item.id!)}
          />
        )}
      </Card>

      {/* Modal de formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Editar Tierra" : "Nueva Tierra"}
      >
        <form onSubmit={handleSubmit} className="tierra-form">
          <Input
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <Input
            label="Ubicación"
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            required
          />
          <div className="form-row">
            <Input
              label="Superficie (ha)"
              name="superficieHa"
              type="number"
              min={0}
              step={0.01}
              value={form.superficieHa}
              onChange={handleChange}
              required
            />
            <Input
              label="Valor (USD)"
              name="valorUSD"
              type="number"
              min={0}
              step={0.01}
              value={form.valorUSD}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <Input
              label="Costo Mantenimiento Anual (USD)"
              name="costoMantenimientoAnual"
              type="number"
              min={0}
              step={0.01}
              value={form.costoMantenimientoAnual}
              onChange={handleChange}
            />
            <div className="form-field">
              <label className="form-label">Tipo de Uso</label>
              <select
                name="tipoUso"
                className="input"
                value={form.tipoUso}
                onChange={handleChange}
              >
                {TIPOS_USO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Notas</label>
            <textarea
              name="notas"
              className="input textarea"
              value={form.notas}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingId ? "Guardar Cambios" : "Crear Tierra"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tierras;
