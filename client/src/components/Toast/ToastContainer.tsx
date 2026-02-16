import { useToast } from "../../context/ToastContext";
import ToastItem from "./ToastItem";
import styles from "./Toast.module.css";

const ToastContainer = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
