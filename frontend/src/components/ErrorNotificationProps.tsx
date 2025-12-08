import React, { useEffect } from 'react';

interface ErrorNotificationProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ 
  message, 
  isOpen, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
      <div className="bg-red-500/90 backdrop-blur-sm border border-red-400 rounded-lg shadow-2xl p-4 min-w-[300px] max-w-[400px]">
        <div className="flex items-start gap-3">
          {/* Error Icon */}
          <div className="flex-shrink-0">
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          {/* Message */}
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm mb-1">Error</h3>
            <p className="text-white/90 text-sm">{message}</p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/80 hover:text-white transition"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;