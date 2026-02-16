import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import CompanySetupModal from "../components/CompanySetupModal/CompanySetupModal";

interface CompanyGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que verifica si el usuario tiene companyId configurado
 * Si no lo tiene, muestra el modal de configuración
 */
const CompanyGuard = ({ children }: CompanyGuardProps) => {
  const { companyId, user, isLoading } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    // Solo verificar después de que termine de cargar
    if (!isLoading && user && !companyId && !setupComplete) {
      setShowSetup(true);
    }
  }, [isLoading, user, companyId, setupComplete]);

  const handleSetupComplete = () => {
    setShowSetup(false);
    setSetupComplete(true);
    // Recargar la página para actualizar el contexto
    window.location.reload();
  };

  // Si está cargando, no mostrar nada (o un loading spinner si quieres)
  if (isLoading) {
    return null;
  }

  return (
    <>
      {showSetup && <CompanySetupModal onComplete={handleSetupComplete} />}
      {children}
    </>
  );
};

export default CompanyGuard;
