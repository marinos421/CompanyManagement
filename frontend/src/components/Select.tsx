import React from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

const Select: React.FC<SelectProps> = ({ label, options, error, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">{label}</label>}
      <div className="relative">
        <select
          className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 transition appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom Arrow Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Select;