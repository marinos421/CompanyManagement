import { useEffect, useState } from "react";
import AuthService from "../../services/Auth/auth.service";
import TaskService, { Task } from "../../services/Workforce/task.service";

const EmployeeDashboard = () => {
  const user = AuthService.getCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
        try {
            const data = await TaskService.getAll();
            setTasks(data);
        } catch (error) {
            console.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };
    fetchTasks();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
        case "TODO": return "bg-slate-700 text-slate-300";
        case "IN_PROGRESS": return "bg-blue-500/20 text-blue-400";
        case "DONE": return "bg-green-500/20 text-green-400";
        default: return "bg-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-lg text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.sub ? user.sub.split('@')[0] : "Employee"}!</h2>
        <p className="text-slate-400">You have <span className="text-blue-400 font-bold">{tasks.filter(t => t.status !== 'DONE').length}</span> active tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* MY TASKS WIDGET */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-96 overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                My Tasks
            </h3>
            
            {loading ? (
                <p className="text-slate-500">Loading...</p>
            ) : tasks.length === 0 ? (
                <p className="text-slate-500 italic">No tasks assigned yet.</p>
            ) : (
                <div className="space-y-3">
                    {tasks.map(task => (
                        <div key={task.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-slate-500 transition">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-white font-medium">{task.title}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getStatusColor(task.status)}`}>
                                    {task.status.replace("_", " ")}
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs mb-2">{task.description}</p>
                            <p className="text-slate-500 text-xs text-right">Due: {task.dueDate}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* ANNOUNCEMENTS */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                Announcements
            </h3>
            <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded text-sm text-slate-300">
                <p className="font-bold text-blue-400 mb-1">System Update</p>
                <p>Welcome to the new Employee Portal! Please check your assigned tasks daily.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;