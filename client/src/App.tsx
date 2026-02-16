import "./styles/App.css";
import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";
import ToastContainer from "./components/Toast/ToastContainer";

function App() {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRouter />
            <ToastContainer />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
