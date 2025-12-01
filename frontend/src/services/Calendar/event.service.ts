import axios from "axios";
import AuthService from "../Auth/auth.service";

const API_URL = "http://localhost:8080/api/events";

export interface CompanyEvent {
  id?: number;
  title: string;
  description: string;
  startTime: string | Date; // Το API στέλνει String, το Calendar θέλει Date
  endTime: string | Date;
  location: string;
  type: "MEETING" | "EVENT" | "HOLIDAY" | "OTHER";
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
  // Μετατροπή των strings σε Date objects για να δουλέψει το ημερολόγιο
  return response.data.map((ev: any) => ({
    ...ev,
    startTime: new Date(ev.startTime),
    endTime: new Date(ev.endTime),
  }));
};

const create = async (data: CompanyEvent) => {
  const response = await axios.post(API_URL, data, { headers: getAuthHeader() });
  return response.data;
};

const remove = async (id: number) => {
  await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

const EventService = {
  getAll,
  create,
  remove,
};

export default EventService;