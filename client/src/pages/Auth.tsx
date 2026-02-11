import { useEffect, useState } from "react";
import Login from "@/auth/login";
import Register from "@/auth/register";
import styles from "../styles/Auth.module.css";

type AuthMode = "login" | "register";

export default function Auth({
  initialMode = "login",
}: {
  initialMode?: AuthMode;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {mode === "login" ? (
          <>
            <Login />
            <button
              className={styles.switch}
              onClick={() => setMode("register")}
            >
              ¿No tienes cuenta? <span>Regístrate</span>
            </button>
          </>
        ) : (
          <>
            <Register />
            <button
              className={styles.switch}
              onClick={() => setMode("login")}
            >
              ¿Ya tienes cuenta? <span>Iniciar Sesión</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
