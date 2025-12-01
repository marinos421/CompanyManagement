import axios from "axios";
import AuthService from "../auth/auth.service";

const API_URL = "http://localhost:8080/api/notifications";

export interface Notification {
  id: number;
  message: string;
  type: "TASK" | "PAYROLL" | "CHAT" | "OTHER";
  read: boolean; // isRead στο backend, read στο JSON
  timestamp: string;
}

const getAuthHeader = () => {
  const user = AuthService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: "Bearer " + user.token };
  }
  return {};
};

const getMyNotifications = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeader() });
  return response.data;
};

const markAsRead = async (id: number) => {
  await axios.patch(`${API_URL}/${id}/read`, {}, { headers: getAuthHeader() });
};

const NotificationService = {
  getMyNotifications,
  markAsRead,
};

export default NotificationService;