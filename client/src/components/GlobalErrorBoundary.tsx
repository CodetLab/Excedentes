// components/GlobalErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("GlobalErrorBoundary caught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
          padding: "2rem",
        }}>
          <div style={{
            maxWidth: "600px",
            width: "100%",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            padding: "2rem",
          }}>
            <h1 style={{ color: "#dc3545", marginBottom: "1rem" }}>
              ⚠️ Error Crítico
            </h1>
            <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
              La aplicación encontró un error inesperado y no puede continuar.
            </p>
            
            {this.state.error && (
              <details style={{
                backgroundColor: "#f8f9fa",
                padding: "1rem",
                borderRadius: "4px",
                marginBottom: "1.5rem",
              }}>
                <summary style={{ cursor: "pointer", fontWeight: "bold", marginBottom: "0.5rem" }}>
                  Detalles técnicos
                </summary>
                <pre style={{
                  fontSize: "0.875rem",
                  overflow: "auto",
                  margin: "0.5rem 0 0 0",
                }}>
                  {this.state.error.toString()}
                  {"\n\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
