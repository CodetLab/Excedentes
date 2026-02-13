import Modal from "@/components/Modal";
import type { VentaFormValues } from "../types";
import VentaForm from "./VentaForm";

type EditVentaModalProps = {
  isOpen: boolean;
  values: VentaFormValues;
  isSubmitting?: boolean;
  onChange: (field: keyof VentaFormValues, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

const EditVentaModal = ({
  isOpen,
  values,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: EditVentaModalProps) => {
  return (
    <Modal isOpen={isOpen} title="Editar venta" onClose={onClose}>
      <VentaForm
        values={values}
        onChange={onChange}
        onSubmit={onSubmit}
        submitLabel="Guardar cambios"
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
};

export default EditVentaModal;
