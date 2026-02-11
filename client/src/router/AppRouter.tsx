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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
