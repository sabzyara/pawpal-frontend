import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    const isAuthRequest =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register");

    console.log("REQUEST:", config.url);

    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("TOKEN ATTACHED ");
    } else {
      console.log("NO TOKEN / AUTH REQUEST ");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("API ERROR:", error?.response?.status);

    if (error?.response?.status === 401) {
      console.log("TOKEN EXPIRED → REMOVING");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user"); 
    }

    return Promise.reject(error);
  }
);

export default api;