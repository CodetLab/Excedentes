import Button from "@/components/Button";
import Input from "@/components/Input";
import type { VentaFormValues } from "../types";

type VentaFormProps = {
  values: VentaFormValues;
  onChange: (field: keyof VentaFormValues, value: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
};

const VentaForm = ({ values, onChange, onSubmit, submitLabel, isSubmitting }: VentaFormProps) => {
  return (
    <form
      className="form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Input
        label="Producto ID"
        name="productId"
        value={values.productId}
        onChange={(event) => onChange("productId", event.target.value)}
        placeholder="ID de producto"
        required
      />
      <Input
        label="Cantidad"
        name="quantity"
        type="number"
        value={values.quantity}
        onChange={(event) => onChange("quantity", event.target.value)}
        placeholder="1"
        min="1"
        step="1"
        required
      />
      <Input
        label="Precio unitario"
        name="unitPrice"
        type="number"
        value={values.unitPrice}
        onChange={(event) => onChange("unitPrice", event.target.value)}
        placeholder="0"
        min="0"
        step="0.01"
        required
      />
      <Input
        label="Total"
        name="totalAmount"
        type="number"
        value={values.totalAmount}
        onChange={(event) => onChange("totalAmount", event.target.value)}
        placeholder="0"
        min="0"
        step="0.01"
        required
      />
      <Input
        label="Fecha"
        name="date"
        type="date"
        value={values.date}
        onChange={(event) => onChange("date", event.target.value)}
      />
      <div className="form-actions">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default VentaForm;
