import React, { useEffect } from "react";

export interface NotificationState {
  message: string;
  type: "success" | "error";
}

interface Props {
  notification: NotificationState | null;
  onClose: () => void;
}

const NotificationToast: React.FC<Props> = ({ notification, onClose }) => {
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-xl text-white font-medium animate-bounce ${
        notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
    }`}>
        {notification.message}
    </div>
  );
};

export default NotificationToast;