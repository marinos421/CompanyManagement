import React from "react";
import Modal from "../Modal";
import Button from "../Button";
import StarRating from "./StarRating";
import { Task } from "../../services/Workforce/task.service";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onRate?: (stars: number) => void;
  onDelete?: () => void;
  isAdmin: boolean;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onRate,
  onDelete,
  isAdmin,
}) => {
  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} className="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-full">

        {/* LEFT COLUMN - Description & Attachments */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <div>
            <h4 className="text-sm text-slate-400 uppercase font-bold mb-2">Description</h4>
            <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 min-h-[200px] max-h-[400px] overflow-y-auto">
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                {task.description}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 ? (
            <div>
              <h4 className="text-sm text-slate-400 uppercase font-bold mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path
                    fillRule="evenodd"
                    d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z"
                    clipRule="evenodd"
                  />
                </svg>
                Attachments
                <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs">
                  {task.attachments.length}
                </span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {task.attachments.map((att) => {
                  const fileUrl = `http://localhost:8080/api/attachments/${att.id}`;
                  const isImage = att.fileType?.startsWith("image/");

                  return (
                    <div
                      key={att.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden p-[3px] hover:shadow-md transition group"
                    >
                      {/* Preview Area */}
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-slate-100 rounded-t-lg relative overflow-hidden aspect-[4/3]"
                      >
                        {isImage ? (
                          <div className="w-full h-full relative">
                            <img
                              src={fileUrl}
                              alt={att.fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                                (e.target as HTMLImageElement).nextElementSibling?.setAttribute(
                                  "style",
                                  "display: flex;"
                                );
                              }}
                            />
                            {/* Hidden Fallback */}
                            <div
                              className="absolute inset-0 flex items-center justify-center text-slate-400"
                              style={{ display: "none" }}
                            >
                              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1">
                            <svg
                              className="w-10 h-10 text-slate-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d={
                                  att.fileType.includes("pdf")
                                    ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    : "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                }
                              />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {att.fileType.split("/")[1] || "FILE"}
                            </span>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 p-1.5 rounded-full shadow-lg">
                            <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </div>
                        </div>
                      </a>

                      {/* Footer Area */}
                      <div className="px-3 py-2 bg-white">
                        <p className="text-sm font-semibold text-slate-800 truncate" title={att.fileName}>
                          {att.fileName}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Added via Task</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* RIGHT COLUMN - Metadata */}
        <div className="lg:col-span-1 space-y-4">

          {/* Assigned To */}
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Assign to</label>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm text-white border border-slate-500">
                {task.assignedToName?.charAt(0)}
              </div>
              <span className="text-white text-sm">{task.assignedToName}</span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Status</label>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
              <span className="px-2 py-1 bg-slate-700 rounded text-white text-xs uppercase font-bold">
                {task.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Due to</label>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
              <span className="text-white text-sm">{task.dueDate}</span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold block mb-2">Rating</label>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex justify-center">
              <StarRating
                rating={task.rating || 0}
                onRate={isAdmin && onRate ? onRate : undefined}
                size="lg"
              />
            </div>
          </div>

          {/* Delete Button */}
          {isAdmin && onDelete && (
            <div className="pt-4">
              <Button variant="danger" size="sm" onClick={onDelete} className="w-full">
                Delete Task
              </Button>
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
};

export default TaskDetailModal;
