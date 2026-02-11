import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiDollarSign,
  FiBox,
  FiTrendingUp,
  FiFileText,
  FiSettings,
} from "react-icons/fi";
import "./sidebar.css";
import { FaCircleUser } from "react-icons/fa6";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <FiTrendingUp className="logo-icon" />
        <span className="logo-text">Excedentes</span>
        
      </div>
{/* Menú */}
      <nav className="sidebar-menu">
        <NavLink to="/" end className="menu-item">
          <FiHome />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/costos" className="menu-item">
          <FiDollarSign />
          <span>Costos</span>
        </NavLink>

        <NavLink to="/productos" className="menu-item">
          <FiBox />
          <span>Productos</span>
        </NavLink>

        <NavLink to="/ventas" className="menu-item">
          <FiTrendingUp />
          <span>Ventas</span>
        </NavLink>

        <NavLink to="/reportes" className="menu-item">
          <FiFileText />
          <span>Reportes</span>
        </NavLink>

        <NavLink to="/configuracion" className="menu-item">
          <FiSettings className="settings-icon" />
          <span>Configuracion</span>
        </NavLink>
      </nav>

      
      {/* Footer */}
      <div className="sidebar-footer">
        <img
          src="https://i.pravatar.cc/40"
          alt="Usuario"
          className="user-avatar"
        />
        <div className="user-info">
          <span className="user-name">Juan Pérez</span>
          <span className="user-role">Vicepresidente</span>
          <FaCircleUser className="status-icon" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
