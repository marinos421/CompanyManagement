import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/Auth/RegisterPage";
import LoginPage from "./pages/Auth/LoginPage";
import Layout from "./components/Layout";
import CompanyProfilePage from "./pages/Company/CompanyProfilePage"; 
import EmployeesPage from "./pages/Workforce/EmployeePage";
import TransactionsPage from "./pages/Finance/TransactionPage";
import DashboardPage from "./pages/Company/DashboardPage";
import EmployeeDashboard from "./pages/Workforce/EmployeeDashboard";
import AuthService from "./services/Auth/auth.service";
import TasksPage from "./pages/Workforce/TaskPage";
import EmployeeProfilePage from "./pages/Workforce/EmployeeProfilePage";
import CalendarPage from "./pages/Calendar/CalendarPage";
import ChatPage from "./pages/Chat/ChatPage";
import LandingPage from "./pages/Auth/LandingPage";



const DashboardDecider = () => {
  const role = AuthService.getUserRole();
  if (role === "EMPLOYEE") {
    return <EmployeeDashboard />;
  }
  return <DashboardPage />;
};




function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (Χωρίς Sidebar) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes (Με Sidebar & Layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardDecider />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/profile" element={<CompanyProfilePage />} />
          <Route path="/my-profile" element={<EmployeeProfilePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;