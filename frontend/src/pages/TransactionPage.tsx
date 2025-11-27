import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import TransactionService, { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../services/transaction.service";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"];
const OVERVIEW_COLORS = ["#10b981", "#f43f5e"]; 

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    try {
      const data = await TransactionService.getAll();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Logic ---
  const completedTransactions = transactions.filter(t => t.status === "COMPLETED");
  
  const totalIncome = completedTransactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = completedTransactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const getChartData = () => {
    if (chartType === "OVERVIEW") {
        return [
            { name: "Income", value: totalIncome },
            { name: "Expenses", value: totalExpense }
        ].filter(d => d.value > 0);
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

  // --- Handlers ---
  
  // NEW: Mark as Completed Handler
  const handleMarkCompleted = async (id: number) => {
    try {
        const updatedTransaction = await TransactionService.markCompleted(id);
        // Ενημερώνουμε τη λίστα τοπικά για να φανεί αμέσως η αλλαγή
        setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
    } catch (error) {
        alert("Failed to update status");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "type") {
        const newType = value as "INCOME" | "EXPENSE";
        setFormData({
            ...formData,
            type: newType,
            category: newType === "INCOME" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
        });
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

  const handleDeleteClick = (id: number) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
        await TransactionService.remove(idToDelete);
        setTransactions(transactions.filter(t => t.id !== idToDelete));
        setShowDeleteModal(false);
        setIdToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-8">
      
      {/* Header */}
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
            <p className="text-slate-400 text-sm uppercase font-semibold">Total Income (Paid)</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <p className="text-slate-400 text-sm uppercase font-semibold">Total Expenses (Paid)</p>
            <p className="text-2xl font-bold text-rose-400 mt-2">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <p className="text-slate-400 text-sm uppercase font-semibold">Net Balance</p>
            <p className={`text-2xl font-bold mt-2 ${netBalance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                {formatCurrency(netBalance)}
            </p>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Transaction List */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700 bg-slate-700/30">
                <h3 className="font-bold text-white">Recent Transactions</h3>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-slate-400 text-xs uppercase tracking-wider bg-slate-700/20">
                        <th className="p-4">Date</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                    {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-700/30 transition">
                            <td className="p-4 text-slate-300">{t.date}</td>
                            <td className="p-4 text-white font-medium">
                                <span className={`px-2 py-1 rounded text-xs font-bold bg-slate-700 border border-slate-600`}>
                                    {t.category}
                                </span>
                            </td>
                            <td className="p-4 text-slate-400">{t.description || "-"}</td>
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
                            <td className="p-4 text-right flex justify-end gap-2">
                                {/* NEW: Complete Button (Only visible if Pending) */}
                                {t.status === 'PENDING' && (
                                    <button 
                                        onClick={() => handleMarkCompleted(t.id!)} 
                                        title="Mark as Paid"
                                        className="text-slate-500 hover:text-emerald-400 transition p-2 bg-slate-700/50 rounded-full hover:bg-emerald-500/10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </button>
                                )}

                                {/* Delete Button */}
                                <button onClick={() => handleDeleteClick(t.id!)} title="Delete" className="text-slate-500 hover:text-red-500 transition p-2 hover:bg-red-500/10 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">No transactions yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Analytics (Same as before) */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-6 flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-4">
                <h3 className="font-bold text-white">Analytics</h3>
                <select 
                    value={chartType} 
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1 outline-none cursor-pointer hover:bg-slate-600 transition"
                >
                    <option value="OVERVIEW">Overview (Income vs Exp)</option>
                    <option value="EXPENSE">Expenses Breakdown</option>
                    <option value="INCOME">Income Breakdown</option>
                </select>
            </div>
            
            <div className="w-full h-64">
                {getChartData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={getChartData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {getChartData().map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={chartType === 'OVERVIEW' ? OVERVIEW_COLORS[index % 2] : COLORS[index % COLORS.length]} 
                                    />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} itemStyle={{color: '#fff'}} formatter={(value: number) => formatCurrency(value)}/>
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm flex-col">
                        <p>No completed data.</p>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Add Modal & Delete Modal (ΙΔΙΑ ΜΕ ΠΡΙΝ - Δεν χρειάζεται αλλαγή) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
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
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
                <p className="text-slate-400 mb-6">Do you really want to delete this transaction? This cannot be undone.</p>
                <div className="flex justify-center gap-3"><button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">Cancel</button><button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-lg shadow-red-500/20">Delete</button></div>
            </div>
        </div>
      )}

    </div>
  );
};

export default TransactionsPage;