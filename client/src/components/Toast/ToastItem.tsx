import { useEffect, useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import type { Toast } from "../../context/ToastContext";
import styles from "./Toast.module.css";

interface ToastItemProps {
  toast: Toast;
}

const icons = {
  success: <FiCheckCircle />,
  error: <FiAlertCircle />,
  warning: <FiAlertTriangle />,
  info: <FiInfo />,
};

const ToastItem = ({ toast }: ToastItemProps) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, (toast.duration || 4000) - 300);

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${
        isExiting ? styles.exiting : ""
      }`}
      onClick={handleClose}
    >
      <div className={styles.icon}>{icons[toast.type]}</div>
      <div className={styles.message}>{toast.message}</div>
      <button className={styles.closeButton} onClick={handleClose}>
        <FiX />
      </button>
    </div>
  );
};

export default ToastItem;
