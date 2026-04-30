import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 ВОТ ЭТО ГЛАВНОЕ
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  console.log("TOKEN FROM STORAGE:", token); // 👈 посмотри лог

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;