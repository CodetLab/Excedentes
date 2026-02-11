import Modal from "@/components/Modal";
import type { ProductoFormValues } from "../types";
import ProductoForm from "./ProductoForm";

type EditProductoModalProps = {
  isOpen: boolean;
  values: ProductoFormValues;
  isSubmitting?: boolean;
  onChange: (field: keyof ProductoFormValues, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

const EditProductoModal = ({
  isOpen,
  values,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: EditProductoModalProps) => {
  return (
    <Modal isOpen={isOpen} title="Editar producto" onClose={onClose}>
      <ProductoForm
        values={values}
        onChange={onChange}
        onSubmit={onSubmit}
        submitLabel="Guardar cambios"
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
};

export default EditProductoModal;
