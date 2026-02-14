/**
 * ErrorBoundary para capturar errores en DataTable y otros componentes
 * Evita que toda la app crashee por un error de renderizado
 */
import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class TableErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("TableErrorBoundary capturó un error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: "20px",
          border: "1px solid #f44336",
          borderRadius: "4px",
          backgroundColor: "#ffebee",
          color: "#c62828",
          margin: "10px 0"
        }}>
          <h3>❌ Error al renderizar la tabla</h3>
          <p>Hubo un problema al mostrar los datos. Por favor, recarga la página.</p>
          {this.state.error && (
            <details style={{ marginTop: "10px", fontSize: "12px" }}>
              <summary>Detalles técnicos</summary>
              <pre style={{ overflow: "auto", marginTop: "10px" }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default TableErrorBoundary;
