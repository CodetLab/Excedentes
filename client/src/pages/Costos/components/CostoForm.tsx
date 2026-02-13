import Button from "@/components/Button";
import Input from "@/components/Input";
import type { CostoFormValues, CostoTipo } from "../types";

type CostoFormProps = {
  values: CostoFormValues;
  onChange: (field: keyof CostoFormValues, value: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
};

const CostoForm = ({ values, onChange, onSubmit, submitLabel, isSubmitting }: CostoFormProps) => {
  const handleSelectChange = (value: string) => {
    onChange("tipo", value as CostoTipo);
  };

  return (
    <form
      className="form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Input
        label="Nombre"
        name="nombre"
        value={values.nombre}
        onChange={(event) => onChange("nombre", event.target.value)}
        placeholder="Ej: Energia"
        required
      />
      <Input
        label="Etiqueta"
        name="etiqueta"
        value={values.etiqueta}
        onChange={(event) => onChange("etiqueta", event.target.value)}
        placeholder="Ej: Servicios"
        required
      />
      <Input
        label="Monto"
        name="monto"
        type="number"
        value={values.monto}
        onChange={(event) => onChange("monto", event.target.value)}
        placeholder="0"
        min="0"
        step="0.01"
        required
      />
      <label className="form-field">
        <span className="form-label">Tipo</span>
        <select
          className="input"
          value={values.tipo}
          onChange={(event) => handleSelectChange(event.target.value)}
        >
          <option value="FIJO">FIJO</option>
          <option value="VARIABLE">VARIABLE</option>
        </select>
      </label>
      <div className="form-actions">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default CostoForm;
