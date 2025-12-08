import React, { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import TaskService, { Task } from "../../services/Workforce/task.service";
import EmployeeService, { Employee } from "../../services/Workforce/employee.service";
import AuthService from "../../services/Auth/auth.service";

// Components
import Button from "../../components/Button";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Modal from "../../components/Modal";
import TaskColumn from "../../components/Task/TaskCollumn";
import ErrorNotification from "../../components/ErrorNotificationProps";
import TaskDetailModal from "../../components/Task/TaskDetailModal"; // NEW COMPONENT

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Error Notification State
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    dueDate: "",
    assignedToId: 0,
  });
  const [files, setFiles] = useState<FileList | null>(null);

  const role = AuthService.getUserRole();
  const isAdmin = role === "COMPANY_ADMIN";

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
            setFormData((prev: any) => ({ ...prev, assignedToId: empData[0].id }));
        }
      }
    } catch (error) {
      console.error("Error loading data", error);
      showErrorNotification("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Helper to show error notifications
  const showErrorNotification = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
  };

  // --- DRAG AND DROP HANDLER ---
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId; 

    // Optimistic UI Update
    const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus as any } : t
    );
    setTasks(updatedTasks);

    try {
        await TaskService.update(taskId, newStatus);
    } catch (error) {
        showErrorNotification("Failed to move task");
        loadData();
    }
  };

  // --- CREATE TASK ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("dueDate", formData.dueDate);
    data.append("assignedToId", formData.assignedToId);
    
    if (files) {
        for (let i = 0; i < files.length; i++) {
            data.append("files", files[i]);
        }
    }

    try {
        await TaskService.create(data);
        setShowCreateModal(false);
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          assignedToId: employees[0]?.id || 0,
        });
        setFiles(null);
        loadData();
    } catch (error) {
        showErrorNotification("Failed to create task");
    }
  };

  // --- DELETE TASK ---
  const handleDelete = async () => {
      if (!selectedTask) return;
      if (confirm("Are you sure you want to delete this task?")) {
          try {
              await TaskService.remove(selectedTask.id!);
              setTasks(tasks.filter(t => t.id !== selectedTask.id));
              setShowDetailModal(false);
          } catch (error) {
              showErrorNotification("Failed to delete task");
          }
      }
  };

  // --- RATING ---
  const handleRate = async (stars: number) => {
    if (!selectedTask || !isAdmin) return;
    try {
        const updated = await TaskService.update(selectedTask.id!, undefined, stars);
        setTasks(tasks.map(t => t.id === updated.id ? updated : t));
        setSelectedTask(updated);
    } catch (error) {
        showErrorNotification("Failed to rate task");
    }
  };

  // --- COLUMNS DEFINITION ---
  const columns = {
    TODO: { title: "To Do", color: "bg-slate-700/50 border-slate-600" },
    IN_PROGRESS: { title: "In Progress", color: "bg-blue-500/10 border-blue-500/30" },
    DONE: { title: "Done", color: "bg-emerald-500/10 border-emerald-500/30" }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* ERROR NOTIFICATION */}
      <ErrorNotification 
        message={errorMessage}
        isOpen={showError}
        onClose={() => setShowError(false)}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-3xl font-bold text-white">Task Board</h2>
            <p className="text-slate-400">Manage tasks via drag and drop</p>
        </div>
        {isAdmin && (
            <Button onClick={() => setShowCreateModal(true)}>+ New Task</Button>
        )}
      </div>

      {/* KANBAN BOARD */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 h-full">
            {Object.entries(columns).map(([columnId, col]) => (
                <TaskColumn 
                    key={columnId}
                    columnId={columnId}
                    title={col.title}
                    colorClass={col.color}
                    tasks={tasks.filter(t => t.status === columnId)}
                    onTaskClick={(task) => { setSelectedTask(task); setShowDetailModal(true); }}
                />
            ))}
        </div>
      </DragDropContext>

      {/* CREATE TASK MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Task">
        <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            
            <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Description</label>
                <textarea className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white h-24 outline-none focus:border-blue-500"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="Due Date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required />
                
                <Select 
                    label="Assign To" 
                    options={employees.map(e => ({ value: e.id!, label: `${e.firstName} ${e.lastName}` }))}
                    value={formData.assignedToId}
                    onChange={e => setFormData({...formData, assignedToId: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Attachments</label>
                <input type="file" multiple className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
                    onChange={e => setFiles(e.target.files)} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)} type="button">Cancel</Button>
                <Button type="submit">Create Task</Button>
            </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onRate={handleRate}
        onDelete={handleDelete}
        isAdmin={isAdmin}
      />

    </div>
  );
};

export default TasksPage;