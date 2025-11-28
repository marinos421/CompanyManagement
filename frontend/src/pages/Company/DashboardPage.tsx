import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TransactionService, {Transaction} from "../../services/Finance/transaction.service";
import EmployeeService, { Employee } from "../../services/Workforce/employee.service";
import TaskService, { Task } from "../../services/Workforce/task.service"; // Import Task Service

const DashboardPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Φέρνουμε τα πάντα παράλληλα
      const [transData, empData, taskData] = await Promise.all([
        TransactionService.getAll(),
        EmployeeService.getAll(),
        TaskService.getAll()
      ]);
      setTransactions(transData);
      setEmployees(empData);
      // Φιλτράρουμε μόνο τα tasks που είναι IN_PROGRESS
      setActiveTasks(taskData.filter((t: Task) => t.status === "IN_PROGRESS"));
    } catch (error) {
      console.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const completedTrans = transactions.filter(t => t.status === "COMPLETED");
  const totalIncome = completedTrans.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = completedTrans.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const recentActivity = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(amount);
  };

  if (loading) return <div className="text-white p-8">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      
      <div>
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400">Welcome back, here is what's happening with your company.</p>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
            </div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Employees</p>
            <p className="text-3xl font-bold text-white mt-2">{employees.length}</p>
            <Link to="/employees" className="text-blue-400 text-sm mt-4 inline-block hover:underline">Manage Team &rarr;</Link>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Monthly Income</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Monthly Expenses</p>
            <p className="text-2xl font-bold text-rose-400 mt-2">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Net Balance</p>
            <p className={`text-2xl font-bold mt-2 ${netBalance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                {formatCurrency(netBalance)}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT ACTIVITY */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-white text-lg">Recent Transactions</h3>
                <Link to="/transactions" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-700 text-sm">
                        {recentActivity.map(t => (
                            <tr key={t.id} className="hover:bg-slate-700/30 transition">
                                <td className="p-4 text-slate-300">{t.date}</td>
                                <td className="p-4">
                                    <span className="text-white font-medium block">{t.category}</span>
                                    <span className="text-slate-500 text-xs">{t.description}</span>
                                </td>
                                <td className="p-4 text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className={`p-4 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                                </td>
                            </tr>
                        ))}
                        {recentActivity.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">No activity yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* TASKS IN PROGRESS (New Section) */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-6 overflow-hidden">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Tasks In Progress
            </h3>
            
            <div className="space-y-3">
                {activeTasks.length === 0 ? (
                    <p className="text-slate-500 text-sm italic text-center py-4">No tasks in progress currently.</p>
                ) : (
                    activeTasks.map(task => (
                        <div key={task.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                            <h4 className="text-white font-medium text-sm mb-1">{task.title}</h4>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">
                                    To: <span className="text-blue-300">{task.assignedToName?.split(' ')[0]}</span>
                                </span>
                                <span className="text-red-400">Due: {task.dueDate}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                <Link to="/tasks" className="text-sm text-blue-400 hover:text-blue-300">Manage All Tasks &rarr;</Link>
            </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;