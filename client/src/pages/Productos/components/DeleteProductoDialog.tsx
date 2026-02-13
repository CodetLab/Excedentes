import ConfirmDialog from "@/components/ConfirmDialog";
import type { Producto } from "../types";

type DeleteProductoDialogProps = {
  item: Producto | null;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteProductoDialog = ({ item, isSubmitting, onConfirm, onCancel }: DeleteProductoDialogProps) => {
  return (
    <ConfirmDialog
      isOpen={Boolean(item)}
      title="Eliminar producto"
      description={
        item ? (
          <span>
            Esto eliminara <strong>{item.name}</strong>. Esta accion no se puede deshacer.
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

export default DeleteProductoDialog;
