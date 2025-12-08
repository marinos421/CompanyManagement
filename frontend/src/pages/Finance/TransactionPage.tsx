import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import TransactionService, { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../../services/Finance/transaction.service";
import { exportToCSV, exportToPDF } from "../../Utils/export.utils";
import AuthService from "../../services/Auth/auth.service";

// Components
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Select from "../../components/Select";
import StatusBadge from "../../components/StatusBadge";
import ImportTransactionsModal from "../../components/ImportTransactionModal";
import NotificationToast, { NotificationState } from "../../components/NotificationToast"; 

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"];
const OVERVIEW_COLORS = ["#10b981", "#f43f5e"];

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [chartType, setChartType] = useState<"INCOME" | "EXPENSE" | "OVERVIEW">("OVERVIEW");

  // Modal States
  const [showModal, setShowModal] = useState(false); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [showImportModal, setShowImportModal] = useState(false); 
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  // Notification State
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: ""
  });

  const [formData, setFormData] = useState<Transaction>({
    type: "EXPENSE",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    category: EXPENSE_CATEGORIES[0],
    description: "",
    status: "COMPLETED"
  });

  useEffect(() => {
    loadTransactions();
  }, []); 

  // (Removed manual useEffect for timer - handled by component now)

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const cleanFilters = {
        ...filters,
        type: filters.type === "ALL" ? "" : filters.type,
        category: filters.category === "ALL" ? "" : filters.category
      };
      
      const data = await TransactionService.getAll(cleanFilters);
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    loadTransactions();
  };

  const clearFilters = () => {
    setFilters({ type: "", category: "", startDate: "", endDate: "" });
    TransactionService.getAll().then(data => setTransactions(data));
  };

  const handleExportCSV = () => {
    exportToCSV(transactions);
    setShowExportMenu(false);
    setNotification({ message: "CSV downloaded successfully!", type: "success" });
  };

  const handleExportPDF = () => {
    const user = AuthService.getCurrentUser();
    exportToPDF(transactions, user?.companyName || "EconomIT");
    setShowExportMenu(false);
    setNotification({ message: "PDF downloaded successfully!", type: "success" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "type") {
        const newType = value as "INCOME" | "EXPENSE";
        setFormData({ ...formData, type: newType, category: newType === "INCOME" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0] });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await TransactionService.create(formData);
      setShowModal(false);
      loadTransactions();
      setFormData({ type: "EXPENSE", amount: 0, date: new Date().toISOString().split("T")[0], category: EXPENSE_CATEGORIES[0], description: "", status: "COMPLETED" });
      setNotification({ message: "Transaction added successfully!", type: "success" });
    } catch (error) {
      setNotification({ message: "Failed to add transaction.", type: "error" });
    }
  };

  const handleDeleteClick = (id: number) => { setIdToDelete(id); setShowDeleteModal(true); };
  
  const confirmDelete = async () => { 
      if (idToDelete) { 
          try {
            await TransactionService.remove(idToDelete); 
            setTransactions(transactions.filter(t => t.id !== idToDelete)); 
            setNotification({ message: "Transaction deleted successfully", type: "success" });
          } catch (error) {
            setNotification({ message: "Failed to delete transaction", type: "error" });
          } finally {
            setShowDeleteModal(false); 
            setIdToDelete(null); 
          }
      } 
  };

  const completedTransactions = transactions.filter(t => t.status === "COMPLETED");
  const totalIncome = completedTransactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = completedTransactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const getChartData = () => {
    if (chartType === "OVERVIEW") {
        return [{ name: "Income", value: totalIncome }, { name: "Expenses", value: totalExpense }].filter(d => d.value > 0);
    }
    const filtered = completedTransactions.filter(t => t.type === chartType);
    const grouped = filtered.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(grouped).map(key => ({ name: key, value: grouped[key] }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(amount);
  };

  const typeOptions = [
      { value: "ALL", label: "All Types" },
      { value: "INCOME", label: "Income" },
      { value: "EXPENSE", label: "Expense" }
  ];
  
  const categoryOptions = [
      { value: "ALL", label: "All Categories" },
      ...[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(c => ({ value: c, label: c }))
  ];

  const modalCategoryOptions = (formData.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => ({ value: c, label: c }));
  
  const statusOptions = [
      { value: "COMPLETED", label: "Completed (Paid)" },
      { value: "PENDING", label: "Pending (Unpaid)" }
  ];

  return (
    <div className="w-full space-y-6 relative">
      
      {/* REUSABLE NOTIFICATION TOAST */}
      <NotificationToast 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-white">Transactions</h2>
            <p className="text-slate-400">Track your cash flow</p>
        </div>
        
        <div className="flex gap-3 relative">
            <div className="relative">
                <Button variant="secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    Export
                </Button>
                
                {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        <button onClick={handleExportPDF} className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-3 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            PDF Report
                        </button>
                        <button onClick={handleExportCSV} className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-3 transition border-t border-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m13.5 2.625v-17.1c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125z" />
                            </svg>
                            CSV (Excel)
                        </button>
                    </div>
                )}
            </div>

            <Button variant="secondary" onClick={() => setShowImportModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                Import
            </Button>

            <Button onClick={() => setShowModal(true)}>
                + Add Transaction
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <p className="text-slate-400 text-xs uppercase font-semibold">Total Income</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <p className="text-slate-400 text-xs uppercase font-semibold">Total Expenses</p>
            <p className="text-2xl font-bold text-rose-400 mt-2">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <p className="text-slate-400 text-xs uppercase font-semibold">Net Balance</p>
            <p className={`text-2xl font-bold mt-2 ${netBalance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                {formatCurrency(netBalance)}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl flex flex-col h-full">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">Transaction List</h3>
                </div>
                
                <div className="flex flex-wrap gap-2 items-end">
                    <div className="w-32">
                        <Select name="type" value={filters.type} options={typeOptions} onChange={handleFilterChange} className="py-1.5 text-xs" />
                    </div>

                    <div className="w-40">
                        <Select name="category" value={filters.category} options={categoryOptions} onChange={handleFilterChange} className="py-1.5 text-xs" />
                    </div>

                    <div className="flex items-center gap-1">
                        <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="py-1.5 text-xs" />
                        <span className="text-slate-500">-</span>
                        <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="py-1.5 text-xs" />
                    </div>

                    <div className="ml-auto flex gap-2">
                         <Button onClick={applyFilters} size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                            Search
                        </Button>
                        <Button variant="outline" onClick={clearFilters} size="sm">
                            Clear
                        </Button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-700/20 text-slate-400 text-xs uppercase sticky top-0">
                        <tr>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Category</th>
                            <th className="p-4 font-semibold">Description</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Amount</th>
                            <th className="p-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-sm">
                        {transactions.map(t => (
                            <tr key={t.id} className="hover:bg-slate-700/30 transition">
                                <td className="p-4 text-slate-300 whitespace-nowrap">{t.date}</td>
                                <td className="p-4">
                                    <span className="text-white font-medium px-2 py-1 rounded text-xs bg-slate-700 border border-slate-600">
                                        {t.category}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-400 max-w-[150px] truncate" title={t.description}>{t.description || "-"}</td>
                                <td className="p-4">
                                    <StatusBadge status={t.status} />
                                </td>
                                <td className={`p-4 text-right font-bold font-mono ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <span className={t.status === 'PENDING' ? 'opacity-50' : ''}>
                                        {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDeleteClick(t.id!)} className="text-slate-500 hover:text-red-500 transition p-2 hover:bg-slate-700 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500 italic">No transactions found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-6 flex flex-col items-center h-fit sticky top-6">
            <div className="flex justify-between items-center w-full mb-4">
                <h3 className="font-bold text-white">Analytics</h3>
                <div className="w-32">
                    <Select 
                        value={chartType} 
                        onChange={(e) => setChartType(e.target.value as any)} 
                        className="py-1 text-xs"
                        options={[
                            { value: "OVERVIEW", label: "Overview" },
                            { value: "EXPENSE", label: "Expenses" },
                            { value: "INCOME", label: "Income" }
                        ]}
                    />
                </div>
            </div>
            <div className="w-full h-64">
                {getChartData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={getChartData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {getChartData().map((entry, index) => (<Cell key={`cell-${index}`} fill={chartType === 'OVERVIEW' ? OVERVIEW_COLORS[index % 2] : COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} itemStyle={{color: '#fff'}} formatter={(value: number) => formatCurrency(value)}/>
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (<div className="h-full flex items-center justify-center text-slate-500 text-sm">No data</div>)}
            </div>
        </div>

      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Transaction">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 bg-slate-700 p-1 rounded-lg">
                <button type="button" onClick={() => setFormData({...formData, type: "INCOME", category: INCOME_CATEGORIES[0]})} className={`py-2 rounded-md text-sm font-bold transition w-full ${formData.type === 'INCOME' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Income</button>
                <button type="button" onClick={() => setFormData({...formData, type: "EXPENSE", category: EXPENSE_CATEGORIES[0]})} className={`py-2 rounded-md text-sm font-bold transition w-full ${formData.type === 'EXPENSE' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Expense</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input label="Amount (¤)" type="number" name="amount" value={formData.amount} onChange={handleInputChange} />
                <Input label="Date" type="date" name="date" value={formData.date} onChange={handleInputChange} />
            </div>
            <Select label="Category" name="category" value={formData.category} options={modalCategoryOptions} onChange={handleInputChange} />
            <Input label="Description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Optional notes..." />
            <Select label="Status" name="status" value={formData.status} options={statusOptions} onChange={handleInputChange} />
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete?">
        <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <p className="text-slate-400 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </div>
        </div>
      </Modal>

      <ImportTransactionsModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        onSuccess={() => {
            loadTransactions();
            setNotification({ message: "Transactions imported successfully!", type: "success" });
        }}
      />
    </div>
  );
};

export default TransactionsPage;