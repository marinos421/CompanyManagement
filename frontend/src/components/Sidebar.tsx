import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/employees", label: "Employees" }, // Θα το φτιάξουμε μετά
    { path: "/transactions", label: "Transactions" }, // Θα το φτιάξουμε μετά
    { path: "/profile", label: "Company Profile" },
  ];

  return (
    <div className="h-screen w-64 bg-slate-800 border-r border-slate-700 flex flex-col text-white fixed left-0 top-0">
      
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-500">EconomIT</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-left"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;