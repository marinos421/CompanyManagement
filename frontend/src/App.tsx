import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import CompanyProfilePage from "./pages/CompanyProfilePage"; 
import EmployeesPage from "./pages/EmployeePage";
import TransactionsPage from "./pages/TransactionPage";
import DashboardPage from "./pages/DashboardPage";



function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (Χωρίς Sidebar) */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes (Με Sidebar & Layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Εδώ θα φτιάξουμε αμέσως μετά το Profile Setup */}
          <Route path="/profile" element={<CompanyProfilePage />} />
          
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;