import axios from "axios";
import AuthService from "../Auth/auth.service";
const API_URL = "http://localhost:8080/api/transactions";

// Helper lists for the Dropdown menus
export const INCOME_CATEGORIES = ["SALES", "SERVICES", "INVESTMENTS", "REFUNDS", "OTHER"];
export const EXPENSE_CATEGORIES = ["RENT", "UTILITIES", "SALARIES", "EQUIPMENT", "MARKETING", "SOFTWARE", "TAXES", "OTHER"];

export interface Transaction {
  id?: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: string;
  category: string;
  description: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
}

const getAuthHeader = () => {
  const user = AuthService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: "Bearer " + user.token };
  }
  return {};
};

const getAll = async (filters?: any) => {
  // Μετατροπή των φίλτρων σε URL parameters
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.type) params.append("type", filters.type);
    if (filters.category) params.append("category", filters.category);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
  }

  const response = await axios.get(`${API_URL}?${params.toString()}`, { headers: getAuthHeader() });
  return response.data;
};

const create = async (data: Transaction) => {
  const response = await axios.post(API_URL, data, { headers: getAuthHeader() });
  return response.data;
};

const remove = async (id: number) => {
  await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

const markCompleted = async (id: number) => {
  const response = await axios.patch(`${API_URL}/${id}/complete`, {}, { headers: getAuthHeader() });
  return response.data;
};

const runPayroll = async () => {
  await axios.post(`${API_URL}/payroll`, {}, { headers: getAuthHeader() });
};

const createBatch = async (data: Transaction[]) => {
  const response = await axios.post(`${API_URL}/batch`, data, { headers: getAuthHeader() });
  return response.data;
};

const TransactionService = {
  getAll,
  create,
  remove,
  markCompleted,
  runPayroll,
  createBatch,
};

export default TransactionService;