import Modal from "@/components/Modal";
import type { CostoFormValues } from "../types";
import CostoForm from "./CostoForm";

type EditCostoModalProps = {
  isOpen: boolean;
  values: CostoFormValues;
  isSubmitting?: boolean;
  onChange: (field: keyof CostoFormValues, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

const EditCostoModal = ({
  isOpen,
  values,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: EditCostoModalProps) => {
  return (
    <Modal isOpen={isOpen} title="Editar costo" onClose={onClose}>
      <CostoForm
        values={values}
        onChange={onChange}
        onSubmit={onSubmit}
        submitLabel="Guardar cambios"
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
};

export default EditCostoModal;
