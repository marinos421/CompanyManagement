import axios from "axios";
import AuthService from "./auth.service";

const API_URL = "http://localhost:8080/api/company/";

export interface CompanyProfile {
  name: string;
  email: string;
  taxId: string;
  phone: string;
  website: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  logoBase64: string | null;
  logoContentType: string | null;
}

const getAuthHeader = () => {
  const user = AuthService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: "Bearer " + user.token };
  }
  return {};
};

const getProfile = async () => {
  const response = await axios.get(API_URL + "profile", { headers: getAuthHeader() });
  return response.data;
};

const updateProfile = async (formData: FormData) => {
  const response = await axios.post(API_URL + "profile", formData, {
    headers: getAuthHeader(), 
  });
  return response.data;
};

const CompanyService = {
  getProfile,
  updateProfile,
};

export default CompanyService;