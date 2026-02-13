import { Outlet } from "react-router-dom";
import Sidebar from "@/components/sidebar/sidebar";
const MainLayout = () => {
  return (
    <div className="layout-shell">
      <Sidebar />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
