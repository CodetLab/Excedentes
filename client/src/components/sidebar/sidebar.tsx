import "./Sidebar.css";
import { NavLink } from "react-router-dom";

type MenuItem = {
  name: string;
  path: string;
  icon: string;
};

const Sidebar = () => {
  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      path: "/",
      icon: "fa-solid fa-chart-line",
    },
    {
      name: "Costos",
      path: "/costos",
      icon: "fa-solid fa-wallet",
    },
    {
      name: "Productos",
      path: "/productos",
      icon: "fa-solid fa-box",
    },
    {
      name: "Ventas",
      path: "/ventas",
      icon: "fa-solid fa-arrow-trend-up",
    },
    {
      name: "Reportes",
      path: "/reportes",
      icon: "fa-solid fa-file-lines",
    },
    {
      name: "Configuración",
      path: "/configuracion",
      icon: "fa-solid fa-gear",
    },
  ];

  return (
    <aside className="sidebar">
      {/* HEADER */}
      <div className="sidebar-header">
        <h2>AnalizaTuNegocio</h2>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <i className={item.icon}></i>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="user-info">
          <img src="https://i.pravatar.cc/40" alt="avatar" />
          <div>
            <strong>Juan Pérez</strong>
            <p>Vicepresidente</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
