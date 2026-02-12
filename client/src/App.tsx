import "./styles/App.css";
import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";

function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
