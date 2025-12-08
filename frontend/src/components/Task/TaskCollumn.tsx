import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import { Task } from "../../services/Workforce/task.service";

interface Props {
  columnId: string;
  title: string;
  tasks: Task[];
  colorClass: string;
  onTaskClick: (task: Task) => void;
}

const TaskColumn: React.FC<Props> = ({ columnId, title, tasks, colorClass, onTaskClick }) => {
  return (
    <Droppable droppableId={columnId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex-1 min-w-[320px] bg-slate-800/50 backdrop-blur-md rounded-2xl border ${snapshot.isDraggingOver ? 'border-blue-500/50 bg-slate-800/80' : 'border-slate-700/50'} flex flex-col h-fit shadow-xl transition-colors duration-200`}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${colorClass.replace('border-', 'bg-')}`}></div>
              <h3 className="font-bold text-slate-100 uppercase text-sm tracking-widest">
                {title}
              </h3>
            </div>
            <span className="bg-slate-900/50 text-slate-400 px-2.5 py-1 rounded-lg text-xs font-mono border border-slate-700/50 min-w-[30px] text-center">
              {tasks.length}
            </span>
          </div>

          {/* Cards Area */}
          <div className="p-4 space-y-3 min-h-[150px]">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default TaskColumn;