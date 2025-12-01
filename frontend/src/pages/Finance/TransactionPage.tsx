import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import TransactionService, { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../../services/Finance/transaction.service";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"];
const OVERVIEW_COLORS = ["#10b981", "#f43f5e"];

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: ""
  });

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Transaction>({
    type: "EXPENSE",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    category: EXPENSE_CATEGORIES[0],
    description: "",
    status: "COMPLETED"
  });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [chartType, setChartType] = useState<"INCOME" | "EXPENSE" | "OVERVIEW">("OVERVIEW");

  useEffect(() => {
    loadTransactions();
  }, []); 

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

  // --- Logic ---
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
    } catch (error) {
      alert("Failed to add transaction");
    }
  };

  const handleDeleteClick = (id: number) => { setIdToDelete(id); setShowDeleteModal(true); };
  const confirmDelete = async () => { if (idToDelete) { await TransactionService.remove(idToDelete); setTransactions(transactions.filter(t => t.id !== idToDelete)); setShowDeleteModal(false); setIdToDelete(null); } };

  return (
    <div className="w-full space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-white">Transactions</h2>
            <p className="text-slate-400">Track your cash flow</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition">
            + Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
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

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Transaction List with Integrated Filters */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl flex flex-col h-full">
            
            {/* --- TABLE HEADER WITH FILTERS --- */}
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">Transaction List</h3>
                </div>
                
                {/* Filter Toolbar */}
                <div className="flex flex-wrap gap-2 items-end">
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="bg-slate-800 border border-slate-600 text-white text-xs rounded px-2 py-1.5 outline-none w-24 focus:border-blue-500">
                        <option value="ALL">Type: All</option>
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                    </select>

                    <select name="category" value={filters.category} onChange={handleFilterChange} className="bg-slate-800 border border-slate-600 text-white text-xs rounded px-2 py-1.5 outline-none w-32 focus:border-blue-500">
                        <option value="ALL">Cat: All</option>
                        {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-1">
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="bg-slate-800 border border-slate-600 text-white text-xs rounded px-2 py-1.5 outline-none focus:border-blue-500" />
                        <span className="text-slate-500">-</span>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="bg-slate-800 border border-slate-600 text-white text-xs rounded px-2 py-1.5 outline-none focus:border-blue-500" />
                    </div>

                    <button onClick={applyFilters} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition flex items-center gap-1 ml-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                        Search
                    </button>
                    <button onClick={clearFilters} className="px-3 py-1.5 text-slate-400 hover:text-white text-xs border border-slate-600 rounded hover:bg-slate-700 transition">
                        Clear
                    </button>
                </div>
            </div>

            {/* Table */}
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
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                        {t.status}
                                    </span>
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

        {/* Analytics Chart */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-6 flex flex-col items-center h-fit sticky top-6">
            <div className="flex justify-between items-center w-full mb-4">
                <h3 className="font-bold text-white">Analytics</h3>
                <select value={chartType} onChange={(e) => setChartType(e.target.value as any)} className="bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1 outline-none cursor-pointer hover:bg-slate-600">
                    <option value="OVERVIEW">Overview</option>
                    <option value="EXPENSE">Expenses</option>
                    <option value="INCOME">Income</option>
                </select>
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

      {/* MODALS (Add/Delete) - IDIA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Add Transaction</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 bg-slate-700 p-1 rounded-lg">
                        <button type="button" onClick={() => setFormData({...formData, type: "INCOME", category: INCOME_CATEGORIES[0]})} className={`py-2 rounded-md text-sm font-bold transition ${formData.type === 'INCOME' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Income</button>
                        <button type="button" onClick={() => setFormData({...formData, type: "EXPENSE", category: EXPENSE_CATEGORIES[0]})} className={`py-2 rounded-md text-sm font-bold transition ${formData.type === 'EXPENSE' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Expense</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs text-slate-400 mb-1 uppercase">Amount</label><input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" /></div>
                        <div><label className="block text-xs text-slate-400 mb-1 uppercase">Date</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" /></div>
                    </div>
                    <div><label className="block text-xs text-slate-400 mb-1 uppercase">Category</label><select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500">{(formData.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
                    <div><label className="block text-xs text-slate-400 mb-1 uppercase">Description</label><input name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" placeholder="Optional notes..." /></div>
                    <div><label className="block text-xs text-slate-400 mb-1 uppercase">Status</label><select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"><option value="COMPLETED">Completed (Paid)</option><option value="PENDING">Pending (Unpaid)</option></select></div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-lg">Save</button></div>
                </form>
            </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-sm shadow-2xl text-center">
                <h3 className="text-xl font-bold text-white mb-2">Delete?</h3>
                <p className="text-slate-400 mb-6">This action cannot be undone.</p>
                <div className="flex justify-center gap-3"><button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">Cancel</button><button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-lg">Delete</button></div>
            </div>
        </div>
      )}

    </div>
  );
};

export default TransactionsPage;