import axios from "axios";
import AuthService from "../Auth/auth.service";

const API_URL = "http://localhost:8080/api/employees";

export interface Employee {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  salary: number;
  companyName?: string;
  phoneNumber?: string;
  personalTaxId?: string;
  idNumber?: string;
  address?: string;
  avatarBase64?: string;
  avatarContentType?: string;
  newPassword?: string;
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

const getMe = async () => {
  const response = await axios.get(`${API_URL}/me`, { headers: getAuthHeader() });
  return response.data;
};

const updateMe = async (formData: FormData) => {
    const response = await axios.post(`${API_URL}/me`, formData, { 
        headers: getAuthHeader() 
    });
    return response.data;
};

const create = async (data: Employee) => {
  const response = await axios.post(API_URL, data, { headers: getAuthHeader() });
  return response.data;
};

const update = async (id: number, data: Employee) => {
  const response = await axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeader() });
  return response.data;
};

const remove = async (id: number) => {
  await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};


const EmployeeService = {
  getAll,
  create,
  update,
  remove,
  getMe,
  updateMe,
};

export default EmployeeService;