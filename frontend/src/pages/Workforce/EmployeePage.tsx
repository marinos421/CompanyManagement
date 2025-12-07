import React, { useEffect, useState } from "react";
import EmployeeService, { Employee } from "../../services/Workforce/employee.service";
import TransactionService from "../../services/Finance/transaction.service";

// Components
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showModal, setShowModal] = useState(false); // Create/Edit
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete Confirmation
  const [showPayrollModal, setShowPayrollModal] = useState(false); // Payroll Confirmation
  
  // Selection States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

  // Notification State (Local toast for simplicity or use Layout's via Context later)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [formData, setFormData] = useState<Employee>({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    salary: 0,
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadEmployees = async () => {
    try {
      const data = await EmployeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // --- Handlers ---

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ firstName: "", lastName: "", email: "", jobTitle: "", salary: 0 });
    setShowModal(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id!);
    setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        jobTitle: employee.jobTitle,
        salary: employee.salary
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setEmployeeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
        try {
            await EmployeeService.remove(employeeToDelete);
            setEmployees(employees.filter(emp => emp.id !== employeeToDelete));
            setNotification({ message: "Employee deleted successfully", type: "success" });
        } catch (error) {
            setNotification({ message: "Failed to delete employee", type: "error" });
        } finally {
            setShowDeleteModal(false);
            setEmployeeToDelete(null);
        }
    }
  };

  // --- Payroll Handlers ---
  const handleRunPayrollClick = () => {
    setShowPayrollModal(true);
  };

  const confirmRunPayroll = async () => {
    try {
        await TransactionService.runPayroll();
        setNotification({ message: "Payroll generated successfully!", type: "success" });
    } catch (error) {
        setNotification({ message: "Failed to generate payroll.", type: "error" });
    } finally {
        setShowPayrollModal(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await EmployeeService.update(editingId, formData);
        setNotification({ message: "Employee updated successfully", type: "success" });
      } else {
        await EmployeeService.create(formData);
        setNotification({ message: "Employee created successfully", type: "success" });
      }
      
      setShowModal(false);
      loadEmployees();
    } catch (error) {
        setNotification({ message: "Operation failed. Email might be taken.", type: "error" });
    }
  };

  return (
    <div className="w-full relative">
      
      {/* NOTIFICATION BANNER */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-xl text-white font-medium animate-bounce ${
            notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
            {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-white">Employees</h2>
            <p className="text-slate-400">Manage your team members</p>
        </div>
        
        <div className="flex gap-3">
            <Button variant="secondary" onClick={handleRunPayrollClick}>
                 Run Payroll
            </Button>

            <Button onClick={handleAddNew}>
                + Add Employee
            </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-700/50 text-slate-300 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Salary</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading...</td></tr>
                ) : employees.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No employees found.</td></tr>
                ) : (
                    employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-700/30 transition">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                                        {emp.firstName[0]}{emp.lastName[0]}
                                    </div>
                                    <span className="text-white font-medium">{emp.firstName} {emp.lastName}</span>
                                </div>
                            </td>
                            <td className="p-4 text-slate-300">{emp.jobTitle}</td>
                            <td className="p-4 text-slate-400">{emp.email}</td>
                            <td className="p-4 text-slate-300 font-mono">{formatCurrency(emp.salary)}</td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleEdit(emp)}
                                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(emp.id!)}
                                        className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingId ? "Edit Employee" : "Add New Employee"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
            </div>

            <Input label="Work Email" type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            <Input label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} required />
            <Input label="Monthly Salary (¤)" type="number" name="salary" value={formData.salary} onChange={handleInputChange} required />

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Save"}</Button>
            </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Employee?">
        <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <p className="text-slate-400 mb-6">Do you really want to delete this employee? This process cannot be undone.</p>
            <div className="flex justify-center gap-3">
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button variant="danger" onClick={confirmDelete}>Delete Employee</Button>
            </div>
        </div>
      </Modal>

      {/* PAYROLL CONFIRMATION MODAL */}
      <Modal isOpen={showPayrollModal} onClose={() => setShowPayrollModal(false)} title="Run Payroll?">
        <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">??</span>
            </div>
            <p className="text-slate-400 mb-6">This will create pending expense transactions for all active employees based on their salary.</p>
            
            <div className="flex justify-center gap-3">
                <Button variant="secondary" onClick={() => setShowPayrollModal(false)}>Cancel</Button>
                <Button onClick={confirmRunPayroll}>Confirm & Run</Button>
            </div>
        </div>
      </Modal>

    </div>
  );
};

export default EmployeesPage;