import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiChevronDown,
  FiChevronRight,
  FiMap,
  FiTruck,
  FiTool,
  FiPackage,
  FiUsers,
  FiUserCheck,
  FiDollarSign,
  FiTrendingUp,
  FiPlusCircle,
  FiLayers,
  FiSettings,
  FiUser,
  FiMenu,
  FiX,
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
  {
    label: "Configuración",
    icon: <FiSettings />,
    path: "/configuracion",
  },
];

const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>(["Capital", "Personal"]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleExpand = (label: string) => {
    if (isCollapsed) return; // Don't expand when collapsed
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandedItems([]); // Close all submenus when collapsing
    } else {
      setExpandedItems(["Capital", "Personal"]); // Restore default expanded items
    }
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  const isExpanded = (label: string) => expandedItems.includes(label);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="mobile-menu-toggle" onClick={toggleMobile}>
        {isMobileOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && <div className="mobile-overlay" onClick={closeMobile} />}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <FiTrendingUp className="logo-icon" />
          {!isCollapsed && <span className="logo-text">Excedentes</span>}
          <button 
            className="collapse-toggle" 
            onClick={toggleCollapse}
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
          </button>
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
                    title={isCollapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!isCollapsed && <span>{item.label}</span>}
                    {!isCollapsed && (
                      isExpanded(item.label) ? <FiChevronDown className="chevron" /> : <FiChevronRight className="chevron" />
                    )}
                  </button>
                  {!isCollapsed && isExpanded(item.label) && (
                    <div className="submenu">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className="submenu-item"
                          onClick={closeMobile}
                        >
                          {subItem.icon}
                          <span>{subItem.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink 
                  to={item.path!} 
                  end={item.path === "/"} 
                  className="menu-item"
                  title={isCollapsed ? item.label : undefined}
                  onClick={closeMobile}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Perfil de Usuario */}
        <div className="sidebar-profile">
          <NavLink 
            to="/perfil" 
            className="profile-link"
            title={isCollapsed ? "Mi Perfil" : undefined}
            onClick={closeMobile}
          >
            <FiUser className="profile-icon" />
            {!isCollapsed && <span>Mi Perfil</span>}
          </NavLink>
        </div>

        {/* Info */}
        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-info">
              <span className="info-label">v0.0.3</span>
              <span className="info-text">11 planillas de carga</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
