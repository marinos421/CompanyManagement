import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">{label}</label>}
      <input 
        className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 transition ${className}`}
        {...props} 
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;