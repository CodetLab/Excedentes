import { Outlet } from "react-router-dom";
import Sidebar from "@/components/sidebar/sidebar";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import CompanyGuard from "@/components/CompanyGuard";

const MainLayout = () => {
  return (
    <CompanyGuard>
      <div className="layout-shell">
        <Sidebar />
        <main className="layout-main">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </CompanyGuard>
  );
};

export default MainLayout;
