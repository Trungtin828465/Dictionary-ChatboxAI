import axios from "axios";
import { apiKeys } from "@/lib/utils";

export const api = {
  get: async (endpoint: string) => {
    console.info(`GET:: ${apiKeys}${endpoint}`);
    const response = await axios.get(`${apiKeys}${endpoint}`);
    return response.data;
  },
  post: async (endpoint: string, data: any) => {
    const response = await axios.post(`${apiKeys}${endpoint}`, data);
    return response.data;
  },
  put: async (endpoint: string, data: any) => {
    const response = await axios.put(`${apiKeys}${endpoint}`, data);
    return response.data;
  },
  delete: async (endpoint: string) => {
    const response = await axios.delete(`${apiKeys}${endpoint}`);
    return response.data;
  },
};
