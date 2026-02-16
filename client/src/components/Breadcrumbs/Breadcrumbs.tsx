import { Link, useLocation } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";
import styles from "./Breadcrumbs.module.css";

interface BreadcrumbRoute {
  path: string;
  label: string;
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  calculadora: "Calculadora",
  costos: "Costos",
  productos: "Productos",
  ventas: "Ventas",
  reportes: "Reportes",
  configuracion: "Configuración",
  capital: "Capital",
  tierras: "Tierras",
  inmuebles: "Inmuebles",
  muebles: "Muebles",
  vehiculos: "Vehículos",
  herramientas: "Herramientas",
  stock: "Stock",
  personal: "Personal",
  propio: "Personal Propio",
  terceros: "Personal de Terceros",
  ganancias: "Ganancias",
  extras: "Extras",
  perfil: "Mi Perfil",
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0 || pathnames[0] === "auth" || pathnames[0] === "login" || pathnames[0] === "register") {
    return null;
  }

  const breadcrumbs: BreadcrumbRoute[] = [];
  let currentPath = "";

  pathnames.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = routeLabels[segment] || segment;
    breadcrumbs.push({ path: currentPath, label });
  });

  return (
    <nav className={styles.breadcrumbs}>
      <Link to="/dashboard" className={styles.home}>
        <FiHome />
        <span className={styles.homeText}>Inicio</span>
      </Link>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <div key={crumb.path} className={styles.crumbWrapper}>
            <FiChevronRight className={styles.separator} />
            {isLast ? (
              <span className={styles.currentCrumb}>{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className={styles.crumb}>
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
