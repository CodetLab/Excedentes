import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getCompanyInfo } from "../../services/company.service";
import Card from "../../components/Card";
import Button from "../../components/Button";
import styles from "./Perfil.module.css";

const Perfil = () => {
  const { user, companyId } = useAuth();
  const { success, error: showError, info } = useToast();

  // Estado para edición de perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // Estado para cambio de contraseña
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // Guardar cambios de perfil
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // TODO: Llamar a la API para actualizar el perfil
      // await updateProfile(profileData);
      
      // Simulación
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      success("Perfil actualizado correctamente");
      setIsEditingProfile(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Las contraseñas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      // TODO: Llamar a la API para cambiar contraseña
      // await changePassword(passwordData);
      
      // Simulación
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      success("Contraseña cambiada correctamente");
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mi Perfil</h1>
      <p className={styles.subtitle}>
        Administra tu información personal y configuración de cuenta
      </p>

      <div className={styles.grid}>
        {/* Información del Usuario */}
        <Card title="Información Personal" className={styles.card}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            {!isEditingProfile ? (
              <div className={styles.infoDisplay}>
                <div className={styles.infoRow}>
                  <label className={styles.infoLabel}>Nombre</label>
                  <p className={styles.infoValue}>{user?.name || "No especificado"}</p>
                </div>
                <div className={styles.infoRow}>
                  <label className={styles.infoLabel}>Email</label>
                  <p className={styles.infoValue}>{user?.email}</p>
                </div>
                <div className={styles.infoRow}>
                  <label className={styles.infoLabel}>Rol</label>
                  <p className={styles.infoValue}>
                    <span className={styles.badge}>
                      {user?.role === "admin" ? "Administrador" : "Usuario"}
                    </span>
                  </p>
                </div>
                <div className={styles.actions}>
                  <Button onClick={() => setIsEditingProfile(true)} variant="primary">
                    Editar Perfil
                  </Button>
                </div>
              </div>
            ) : (
              <div className={styles.infoEdit}>
                <div className={styles.formField}>
                  <label className={styles.label}>Nombre</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className={styles.input}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className={styles.input}
                    placeholder="tu@email.com"
                  />
                </div>
                <div className={styles.actions}>
                  <Button
                    onClick={handleSaveProfile}
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileData({
                        name: user?.name || "",
                        email: user?.email || "",
                      });
                    }}
                    variant="secondary"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Cambio de Contraseña */}
        <Card title="Seguridad" className={styles.card}>
          {!isChangingPassword ? (
            <div className={styles.securityInfo}>
              <p className={styles.securityDescription}>
                Mantén tu cuenta segura con una contraseña fuerte
              </p>
              <Button onClick={() => setIsChangingPassword(true)} variant="secondary">
                Cambiar Contraseña
              </Button>
            </div>
          ) : (
            <div className={styles.passwordForm}>
              <div className={styles.formField}>
                <label className={styles.label}>Contraseña Actual</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className={styles.input}
                  placeholder="••••••••"
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className={styles.input}
                  placeholder="••••••••"
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={styles.input}
                  placeholder="••••••••"
                />
              </div>
              <div className={styles.actions}>
                <Button
                  onClick={handleChangePassword}
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? "Cambiando..." : "Cambiar Contraseña"}
                </Button>
                <Button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  variant="secondary"
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Información de la Cuenta */}
        <Card title="Información de Cuenta" className={styles.card}>
          <div className={styles.accountInfo}>
            <div className={styles.infoRow}>
              <label className={styles.infoLabel}>ID de Usuario</label>
              <p className={styles.infoValueMono}>{user?.id}</p>
            </div>
            {user?.companyId && (
              <div className={styles.infoRow}>
                <label className={styles.infoLabel}>ID de Empresa</label>
                <p className={styles.infoValueMono}>{user.companyId}</p>
              </div>
            )}
            <div className={styles.infoRow}>
              <label className={styles.infoLabel}>Cuenta creada</label>
              <p className={styles.infoValue}>
                {new Date().toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Información de Empresa */}
        {companyId && (
          <Card title="Tu Empresa" className={styles.card}>
            <div className={styles.accountInfo}>
              <div className={styles.infoRow}>
                <label className={styles.infoLabel}>ID de Empresa</label>
                <p className={styles.infoValueMono}>{companyId}</p>
              </div>
              <div className={styles.infoRow}>
                <label className={styles.infoLabel}>Estado</label>
                <p className={styles.infoValue}>
                  <span className={styles.badgeSuccess}>✓ Configurada</span>
                </p>
              </div>
              <div className={styles.infoNote}>
                <p>
                  💡 Tu empresa está correctamente configurada. Todos tus datos se
                  almacenan de forma segura y organizada.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Alerta si no hay companyId */}
        {!companyId && (
          <Card title="⚠️ Configuración Pendiente" className={styles.card}>
            <div className={styles.warningBox}>
              <p className={styles.warningText}>
                Tu cuenta no tiene una empresa asociada. Esto puede causar problemas
                al guardar datos.
              </p>
              <Button
                onClick={() => {
                  info("Recarga la página y completa la configuración inicial");
                  setTimeout(() => window.location.reload(), 1500);
                }}
                variant="primary"
              >
                Configurar Ahora
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Perfil;
