import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "secondary" | "outline";
  size?: "sm" | "md";
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  isLoading, 
  className = "", 
  ...props 
}) => {
  
  const baseStyles = "rounded-lg font-medium transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20",
    secondary: "bg-slate-600 hover:bg-slate-500 text-white",
    outline: "border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "..." : children}
    </button>
  );
};

export default Button;