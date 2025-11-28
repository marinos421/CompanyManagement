import axios from "axios";
import AuthService from "../Auth/auth.service";

const API_URL = "http://localhost:8080/api/tasks";

export interface Task {
  id?: number;
  title: string;
  description: string;
  dueDate: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignedToId: number;
  assignedToName?: string; // Για να το δείχνουμε στον πίνακα
}

const getAuthHeader = () => {
  const user = AuthService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: "Bearer " + user.token };
  }
  return {};
};

const getAll = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeader() });
  return response.data;
};

const create = async (data: Task) => {
  const response = await axios.post(API_URL, data, { headers: getAuthHeader() });
  return response.data;
};

// Ενημέρωση Status (π.χ. όταν ο υπάλληλος το τελειώσει)
const updateStatus = async (id: number, status: string) => {
  const response = await axios.patch(`${API_URL}/${id}/status`, null, {
    headers: getAuthHeader(),
    params: { status } // Στέλνουμε το status ως query param
  });
  return response.data;
};

const remove = async (id: number) => {
  await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

const TaskService = {
  getAll,
  create,
  updateStatus,
  remove,
};

export default TaskService;