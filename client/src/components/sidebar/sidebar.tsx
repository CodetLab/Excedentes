import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiChevronDown,
  FiChevronRight,
  FiMap,
  FiGrid,
  FiTruck,
  FiTool,
  FiPackage,
  FiUsers,
  FiUserCheck,
  FiDollarSign,
  FiTrendingUp,
  FiPlusCircle,
  FiLayers,
} from "react-icons/fi";
import { FaBuilding, FaCouch } from "react-icons/fa";
import "./sidebar.css";

interface SubMenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: <FiHome />,
    path: "/",
  },
  {
    label: "Capital",
    icon: <FiLayers />,
    subItems: [
      { label: "Tierras", path: "/capital/tierras", icon: <FiMap /> },
      { label: "Inmuebles", path: "/capital/inmuebles", icon: <FaBuilding /> },
      { label: "Muebles", path: "/capital/muebles", icon: <FaCouch /> },
      { label: "Vehículos", path: "/capital/vehiculos", icon: <FiTruck /> },
      { label: "Herramientas", path: "/capital/herramientas", icon: <FiTool /> },
      { label: "Stock", path: "/capital/stock", icon: <FiPackage /> },
    ],
  },
  {
    label: "Personal",
    icon: <FiUsers />,
    subItems: [
      { label: "Propio", path: "/personal/propio", icon: <FiUserCheck /> },
      { label: "De terceros", path: "/personal/terceros", icon: <FiUsers /> },
    ],
  },
  {
    label: "Ventas",
    icon: <FiDollarSign />,
    path: "/ventas",
  },
  {
    label: "Ganancias",
    icon: <FiTrendingUp />,
    path: "/ganancias",
  },
  {
    label: "Extras",
    icon: <FiPlusCircle />,
    path: "/extras",
  },
];

const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>(["Capital", "Personal"]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isExpanded = (label: string) => expandedItems.includes(label);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <FiTrendingUp className="logo-icon" />
        <span className="logo-text">Excedentes</span>
      </div>

      {/* Menú */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <div key={item.label} className="menu-section">
            {item.subItems ? (
              <>
                <button
                  className="menu-item menu-item-expandable"
                  onClick={() => toggleExpand(item.label)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {isExpanded(item.label) ? <FiChevronDown className="chevron" /> : <FiChevronRight className="chevron" />}
                </button>
                {isExpanded(item.label) && (
                  <div className="submenu">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className="submenu-item"
                      >
                        {subItem.icon}
                        <span>{subItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink to={item.path!} end={item.path === "/"} className="menu-item">
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* Info */}
      <div className="sidebar-footer">
        <div className="sidebar-info">
          <span className="info-label">v0.0.3</span>
          <span className="info-text">11 planillas de carga</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
