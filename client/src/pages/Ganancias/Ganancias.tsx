// pages/Ganancias/Ganancias.tsx
import { useState, useEffect } from "react";
import { gananciasService } from "../../services/datos.service";
import type { GananciasData } from "../../types/planillas";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import "../../styles/planillas.css";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const currentYear = new Date().getFullYear();
const AÑOS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const Ganancias = () => {
  const [data, setData] = useState<GananciasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<GananciasData>({
    periodo: "", mes: 1, anio: currentYear, gananciaUSD: 0,
    desglose: { gananciaCapital: 0, gananciaPersonal: 0 }, notas: ""
  });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try { setLoading(true); const d = await gananciasService.get(); if (d) { setData(d); setForm(d); } } 
    catch (e) { setError(e instanceof Error ? e.message : "Error"); } 
    finally { setLoading(false); }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name.startsWith("desglose.")) {
      const key = name.split(".")[1] as keyof GananciasData["desglose"];
      const newDesglose = { ...form.desglose, [key]: parseFloat(value) || 0 };
      const total = newDesglose.gananciaCapital + newDesglose.gananciaPersonal;
      setForm({ ...form, desglose: newDesglose, gananciaUSD: total });
    } else {
      setForm({ ...form, [name]: type === "number" ? parseFloat(value) || 0 : value });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const periodo = `${MESES[form.mes - 1]} ${form.anio}`;
      await gananciasService.save({ ...form, periodo });
      await loadData(); setEditMode(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setSaving(false); }
  };

  return (
    <div className="planilla-page">
      <header className="page-header">
        <div><h1>Ganancias</h1><p>Ganancias del período - separadas por capital y trabajo personal</p></div>
        {!editMode && <Button onClick={() => setEditMode(true)}>Editar</Button>}
      </header>
      {error && <div className="error-banner">{error}</div>}
      {loading ? <div className="loading">Cargando...</div> : editMode ? (
        <Card className="single-data-card">
          <form onSubmit={handleSubmit} className="planilla-form">
            <h3>Período</h3>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Mes</label><select name="mes" className="form-select" value={form.mes} onChange={handleChange}>{MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}</select></div>
              <div className="form-field"><label className="form-label">Año</label><select name="anio" className="form-select" value={form.anio} onChange={handleChange}>{AÑOS.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
            </div>
            <h3>Desglose de Ganancias (Regla 8: separar capital y trabajo)</h3>
            <div className="form-row">
              <Input label="Ganancia por Capital USD" name="desglose.gananciaCapital" type="number" min={0} value={form.desglose.gananciaCapital} onChange={handleChange} />
              <Input label="Ganancia por Trabajo Personal USD" name="desglose.gananciaPersonal" type="number" min={0} value={form.desglose.gananciaPersonal} onChange={handleChange} />
            </div>
            <Input label="Ganancia Total USD (calculado)" name="gananciaUSD" type="number" value={form.gananciaUSD} disabled />
            <div className="form-field"><label className="form-label">Notas</label><textarea name="notas" className="form-textarea" value={form.notas || ""} onChange={handleChange} rows={3} /></div>
            <div className="form-actions"><Button type="button" variant="secondary" onClick={() => setEditMode(false)}>Cancelar</Button><Button type="submit" isLoading={saving}>Guardar</Button></div>
          </form>
        </Card>
      ) : (
        <>
          <div className="summary-cards">
            <Card className="summary-card highlight"><span className="summary-label">Ganancia Total</span><span className="summary-value large">${data?.gananciaUSD?.toLocaleString() || 0}</span></Card>
            <Card className="summary-card"><span className="summary-label">Período</span><span className="summary-value">{data?.periodo || "No definido"}</span></Card>
          </div>
          {data && (
            <Card><h3>Desglose por Tipo</h3>
              <div className="desglose-grid">
                <div className="desglose-card capital">
                  <span className="desglose-label">Ganancia por Capital</span>
                  <span className="desglose-value">${data.desglose.gananciaCapital.toLocaleString()}</span>
                  <span className="desglose-desc">Retorno del capital invertido</span>
                </div>
                <div className="desglose-card personal">
                  <span className="desglose-label">Ganancia por Trabajo Personal</span>
                  <span className="desglose-value">${data.desglose.gananciaPersonal.toLocaleString()}</span>
                  <span className="desglose-desc">Retribución por trabajo del productor</span>
                </div>
              </div>
              {data.notas && <p className="notas-text">{data.notas}</p>}
            </Card>
          )}
        </>
      )}
    </div>
  );
};
export default Ganancias;
