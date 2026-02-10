import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/sidebar";
const MainLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1}}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
