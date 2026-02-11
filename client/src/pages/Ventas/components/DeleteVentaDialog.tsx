import ConfirmDialog from "@/components/ConfirmDialog";
import type { Venta } from "../types";

type DeleteVentaDialogProps = {
  item: Venta | null;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteVentaDialog = ({ item, isSubmitting, onConfirm, onCancel }: DeleteVentaDialogProps) => {
  return (
    <ConfirmDialog
      isOpen={Boolean(item)}
      title="Eliminar venta"
      description={
        item ? (
          <span>
            Esto eliminara la venta de <strong>{item.totalAmount.toLocaleString("es-AR")}</strong>.
            Esta accion no se puede deshacer.
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

export default DeleteVentaDialog;
