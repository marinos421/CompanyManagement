import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthService from "../services/Auth/auth.service";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = AuthService.getUserRole(); // Παίρνουμε τον ρόλο

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  // Ορίζουμε ποια μενού βλέπει ο καθένας
  const menuItems = [
    { 
      path: "/dashboard", 
      label: "Dashboard",
      roles: ["COMPANY_ADMIN", "EMPLOYEE"] // Όλοι

    },
    { 
      path: "/my-profile", 
      label: "My Profile", 
      roles: ["EMPLOYEE"]
    },
    { 
      path: "/tasks", 
      label: "Tasks", 
      roles: ["COMPANY_ADMIN", "EMPLOYEE"]
    },
    { 
      path: "/employees", 
      label: "Employees", 
      roles: ["COMPANY_ADMIN"] // Μόνο Admin
    },
    { 
      path: "/transactions", 
      label: "Transactions", 
      roles: ["COMPANY_ADMIN"] // Μόνο Admin
    },
    { 
      path: "/profile", 
      label: "Company Profile", 
      roles: ["COMPANY_ADMIN"] // Μόνο Admin
    },
    // Θα προσθέσουμε αργότερα: "My Profile" & "My Tasks" για Employees
  ];

  return (
    <div className="h-screen w-64 bg-slate-800 border-r border-slate-700 flex flex-col text-white fixed left-0 top-0">
      
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-500">EconomIT</h1>
        {/* Δείχνουμε τον ρόλο για debugging/info */}
        <span className="text-xs text-slate-500 uppercase tracking-widest">
            {role === "COMPANY_ADMIN" ? "Admin Workspace" : "Employee Portal"}
        </span>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
            // Αν ο ρόλος του χρήστη δεν είναι στη λίστα επιτρεπόμενων, μην το δείξεις
            if (!item.roles.includes(role || "")) return null;

            return (
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
            );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-left flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;