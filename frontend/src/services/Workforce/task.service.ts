import axios from "axios";
import AuthService from "../Auth/auth.service";

const API_URL = "http://localhost:8080/api/tasks";

export interface Task {
  id?: number;
  title: string;
  description: string;
  dueDate: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  rating?: number; // 1-5
  assignedToId: number;
  assignedToName?: string;
  attachments?: { id: number; fileName: string; fileType: string }[];
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

// Change: Accepts FormData
const create = async (formData: FormData) => {
  const response = await axios.post(API_URL, formData, {
    headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

// Change: Accepts Rating
const update = async (id: number, status?: string, rating?: number) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (rating !== undefined) params.append("rating", rating.toString());

  const response = await axios.patch(`${API_URL}/${id}`, null, {
    headers: getAuthHeader(),
    params: params
  });
  return response.data;
};

const remove = async (id: number) => {
  await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

const TaskService = {
  getAll,
  create,
  update,
  remove,
};

export default TaskService;
