import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout.js";

import Dashboard from "./pages/Dashboard/Dashboard.js";
import Costos from "./pages/Costos/Costos.js";
import Productos from "./pages/Productos/Productos.js";
import Ventas from "./pages/Ventas/Ventas.js";
import Reportes from "./pages/Reportes/Reportes.js";
import Configuracion from "./pages/Configuracion/Configuracion.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Layout principal */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/costos" element={<Costos />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ventas" element={<Ventas />} />
          //<Route path="/reportes" element={<Reportes />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
