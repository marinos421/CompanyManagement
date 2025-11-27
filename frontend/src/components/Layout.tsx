import { Outlet, Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import Sidebar from "./sidebar"

const Layout = () => {
  const currentUser = AuthService.getCurrentUser();

  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {}
      <Sidebar />

      {}
      <div className="flex-1 ml-64 p-8">
        {}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;