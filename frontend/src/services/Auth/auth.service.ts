import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

const register = async (data: RegisterData) => {
  const response = await axios.post(API_URL + "register", data);
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (data: LoginData) => {
  const response = await axios.post(API_URL + "login", data);
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) return JSON.parse(userStr);
  return null;
};

const getUserRole = (): string | null => {
  const user = getCurrentUser();
  return user ? user.role : null; // Επιστρέφει "COMPANY_ADMIN" ή "EMPLOYEE"
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
  getUserRole,
};

export default AuthService;