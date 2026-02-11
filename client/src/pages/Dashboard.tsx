import styles from "../styles/Dashboard.module.css";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <button onClick={logout}>Cerrar sesión</button>
      </header>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h3>Usuarios</h3>
          <p>1.245</p>
        </div>

        <div className={styles.card}>
          <h3>Ingresos</h3>
          <p>$12.430</p>
        </div>

        <div className={styles.card}>
          <h3>Reportes</h3>
          <p>8 activos</p>
        </div>
      </section>
    </div>
  );
}
