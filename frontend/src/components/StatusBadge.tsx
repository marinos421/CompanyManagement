import React from "react";

interface BadgeProps {
  status: string;
}

const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  let colorClass = "bg-slate-700 text-slate-300"; // Default

  const s = status.toUpperCase();

  if (s === "COMPLETED" || s === "DONE" || s === "INCOME") {
    colorClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  } else if (s === "PENDING" || s === "IN_PROGRESS") {
    colorClass = "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
  } else if (s === "EXPENSE" || s === "CANCELLED") {
    colorClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  }

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
      {status.replace("_", " ")}
    </span>
  );
};

export default StatusBadge;