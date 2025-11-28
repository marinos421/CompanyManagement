import { useEffect, useState } from "react";
import TaskService, { Task } from "../../services/Workforce/task.service";
import EmployeeService, { Employee } from "../../services/Workforce/employee.service";
import AuthService from "../../services/Auth/auth.service";

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  
  // Role Check
  const role = AuthService.getUserRole();
  const isAdmin = role === "COMPANY_ADMIN";

  const [formData, setFormData] = useState<Task>({
    title: "",
    description: "",
    dueDate: "",
    status: "TODO",
    assignedToId: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const tasksData = await TaskService.getAll();
      setTasks(tasksData);

      if (isAdmin) {
        const empData = await EmployeeService.getAll();
        setEmployees(empData);
        if (empData.length > 0) {
            setFormData(prev => ({ ...prev, assignedToId: empData[0].id! }));
        }
      }
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await TaskService.create(formData);
        setShowModal(false);
        loadData();
    } catch (error) {
        alert("Failed to assign task.");
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
        await TaskService.updateStatus(taskId, newStatus);
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
    } catch (error) {
        alert("Failed to update status.");
    }
  };

  // --- DELETE LOGIC (Custom Modal) ---
  const handleDeleteClick = (id: number) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
        await TaskService.remove(idToDelete);
        setTasks(tasks.filter(t => t.id !== idToDelete));
        setShowDeleteModal(false);
        setIdToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case "TODO": return "bg-slate-700 text-slate-300";
        case "IN_PROGRESS": return "bg-blue-500/20 text-blue-400";
        case "DONE": return "bg-green-500/20 text-green-400";
        default: return "bg-slate-700";
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-white">Tasks</h2>
            <p className="text-slate-400">{isAdmin ? "Assign work to your team" : "My assigned tasks"}</p>
        </div>
        
        {isAdmin && (
            <button 
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-blue-500/20"
            >
                + Assign Task
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
            <div key={task.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-600 transition relative">
                
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${getStatusColor(task.status)}`}>
                        {task.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-slate-500">{task.dueDate}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
                <p className="text-slate-400 text-sm mb-4 min-h-[40px]">{task.description}</p>

                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                        {task.assignedToName?.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-400">Assigned to: <span className="text-white">{task.assignedToName}</span></span>
                </div>

                <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                    <select 
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id!, e.target.value)}
                        className="bg-slate-900 border border-slate-600 text-xs text-white rounded px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"
                    >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>

                    {/* HIDE DELETE BUTTON FOR EMPLOYEES */}
                    {isAdmin && (
                        <button onClick={() => handleDeleteClick(task.id!)} className="text-slate-500 hover:text-red-500 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Assign New Task</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 uppercase">Task Title</label>
                        <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 uppercase">Description</label>
                        <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 h-20"></textarea>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 uppercase">Due Date</label>
                        <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 uppercase">Assign To</label>
                        <select 
                            value={formData.assignedToId} 
                            onChange={e => setFormData({...formData, assignedToId: Number(e.target.value)})} 
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-lg">Assign</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Task?</h3>
                <p className="text-slate-400 mb-6">This action cannot be undone.</p>
                <div className="flex justify-center gap-3">
                    <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">Cancel</button>
                    <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-lg shadow-red-500/20">Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;