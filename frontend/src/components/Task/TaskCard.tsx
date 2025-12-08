import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Task } from "../../services/Workforce/task.service";
import StarRating from "../Task/StarRating";

interface Props {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<Props> = ({ task, index, onClick }) => {
  return (
    <Draggable draggableId={task.id!.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-slate-700 p-4 rounded-lg shadow-md border border-slate-600 hover:border-blue-500 transition cursor-pointer group ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-blue-500 z-50' : ''
            }`}
        >
          {/* Top Row: Rating & Attachment Icon */}
          <div className="flex justify-between items-start mb-2 h-5">
            {task.rating ? <StarRating rating={task.rating} size="sm" /> : <div />}

            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px]">{task.attachments.length}</span>
              </div>
            )}
          </div>

          <h4 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition text-sm">
            {task.title}
          </h4>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-600/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white border border-slate-500">
                {task.assignedToName?.charAt(0)}
              </div>
              <span className="text-xs text-slate-400 truncate max-w-[80px]">
                {task.assignedToName?.split(' ')[0]}
              </span>
            </div>

            <span className={`text-[10px] ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
              {task.dueDate}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;