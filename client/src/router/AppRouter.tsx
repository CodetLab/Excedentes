import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layout/MainLayout";

import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Calculadora from "@/pages/Calculadora/Calculadora";
import Configuracion from "@/pages/Configuracion/Configuracion";
import Costos from "@/pages/Costos/Costos";
import Productos from "@/pages/Productos/Productos";
import Reportes from "@/pages/Reportes/Reportes";
import Ventas from "@/pages/Ventas/Ventas";

// Capital (6 subsecciones)
import Tierras from "@/pages/Capital/Tierras/Tierras";
import Inmuebles from "@/pages/Capital/Inmuebles/Inmuebles";
import Muebles from "@/pages/Capital/Muebles/Muebles";
import Vehiculos from "@/pages/Capital/Vehiculos/Vehiculos";
import Herramientas from "@/pages/Capital/Herramientas/Herramientas";
import Stock from "@/pages/Capital/Stock/Stock";

// Personal (2 subsecciones)
import PersonalPropio from "@/pages/Personal/PersonalPropio/PersonalPropio";
import PersonalTerceros from "@/pages/Personal/PersonalTerceros/PersonalTerceros";

// Ganancias y Extras
import Ganancias from "@/pages/Ganancias/Ganancias";
import Extras from "@/pages/Extras/Extras";

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Auth initialMode="login" />} />
        <Route path="/register" element={<Auth initialMode="register" />} />
        <Route path="/" element={<RootRedirect />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calculadora" element={<Calculadora />} />
          <Route path="costos" element={<Costos />} />
          <Route path="productos" element={<Productos />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="configuracion" element={<Configuracion />} />
          
          {/* Capital - 6 subsecciones */}
          <Route path="capital/tierras" element={<Tierras />} />
          <Route path="capital/inmuebles" element={<Inmuebles />} />
          <Route path="capital/muebles" element={<Muebles />} />
          <Route path="capital/vehiculos" element={<Vehiculos />} />
          <Route path="capital/herramientas" element={<Herramientas />} />
          <Route path="capital/stock" element={<Stock />} />
          
          {/* Personal - 2 subsecciones */}
          <Route path="personal/propio" element={<PersonalPropio />} />
          <Route path="personal/terceros" element={<PersonalTerceros />} />
          
          {/* Ganancias y Extras */}
          <Route path="ganancias" element={<Ganancias />} />
          <Route path="extras" element={<Extras />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
