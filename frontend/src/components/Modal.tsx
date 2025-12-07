import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                X
            </button>
        </div>

        {/* Content */}
        {children}
        
      </div>
    </div>
  );
};

export default Modal;