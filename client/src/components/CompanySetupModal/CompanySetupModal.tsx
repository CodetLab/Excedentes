import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { setupCompany } from "../../services/company.service";
import Button from "../Button";
import styles from "./CompanySetupModal.module.css";

interface CompanySetupModalProps {
  onComplete: () => void;
}

const CompanySetupModal = ({ onComplete }: CompanySetupModalProps) => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      showError("Por favor ingresa el nombre de tu empresa");
      return;
    }

    setLoading(true);
    try {
      await setupCompany({ companyName: companyName.trim() });
      success("¡Empresa configurada correctamente!");
      
      // Actualizar localStorage con el nuevo companyId
      const authData = localStorage.getItem("excedentes_auth");
      if (authData) {
        const parsed = JSON.parse(authData);
        parsed.companyId = companyName; // En producción vendría del backend
        localStorage.setItem("excedentes_auth", JSON.stringify(parsed));
      }
      
      onComplete();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error al configurar empresa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>¡Bienvenido a Excedentes! 🎉</h2>
          <p className={styles.subtitle}>
            Para comenzar, necesitamos algunos datos sobre tu empresa
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Nombre de tu Empresa *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ej: Mi Empresa S.A."
              className={styles.input}
              autoFocus
              required
            />
            <p className={styles.hint}>
              Este nombre se usará para identificar tu cuenta y organizar tus datos
            </p>
          </div>

          <div className={styles.userInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Usuario:</span>
              <span className={styles.infoValue}>{user?.name || "Sin nombre"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{user?.email}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Configurando..." : "Continuar"}
            </Button>
          </div>

          <p className={styles.footer}>
            💡 Podrás modificar esta información más tarde desde tu perfil
          </p>
        </form>
      </div>
    </div>
  );
};

export default CompanySetupModal;
