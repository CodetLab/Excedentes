import Button from "@/components/Button";
import Input from "@/components/Input";
import type { ProductoFormValues } from "../types";

type ProductoFormProps = {
  values: ProductoFormValues;
  onChange: (field: keyof ProductoFormValues, value: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
};

const ProductoForm = ({ values, onChange, onSubmit, submitLabel, isSubmitting }: ProductoFormProps) => {
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
        name="name"
        value={values.name}
        onChange={(event) => onChange("name", event.target.value)}
        placeholder="Ej: Producto premium"
        required
      />
      <Input
        label="Precio"
        name="price"
        type="number"
        value={values.price}
        onChange={(event) => onChange("price", event.target.value)}
        placeholder="0"
        min="0"
        step="0.01"
        required
      />
      <Input
        label="Costo"
        name="cost"
        type="number"
        value={values.cost}
        onChange={(event) => onChange("cost", event.target.value)}
        placeholder="0"
        min="0"
        step="0.01"
        required
      />
      <Input
        label="Stock"
        name="stock"
        type="number"
        value={values.stock}
        onChange={(event) => onChange("stock", event.target.value)}
        placeholder="0"
        min="0"
        step="1"
        required
      />
      <div className="form-actions">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ProductoForm;
