import ConfirmDialog from "@/components/ConfirmDialog";
import type { Costo } from "../types";

type DeleteCostoDialogProps = {
  item: Costo | null;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteCostoDialog = ({ item, isSubmitting, onConfirm, onCancel }: DeleteCostoDialogProps) => {
  return (
    <ConfirmDialog
      isOpen={Boolean(item)}
      title="Eliminar costo"
      description={
        item ? (
          <span>
            Esto eliminara <strong>{item.nombre}</strong>. Esta accion no se puede deshacer.
          </span>
        ) : undefined
      }
      confirmLabel="Eliminar"
      isLoading={isSubmitting}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default DeleteCostoDialog;
