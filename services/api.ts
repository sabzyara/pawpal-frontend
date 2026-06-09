// services/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, APPOINTMENT_SERVICE_URL } from "../constants/api";


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export const appointmentApiClient = axios.create({
  baseURL: APPOINTMENT_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
];

const getTokenFromStorage = async (): Promise<string | null> => {
  try {
    const authStorage = await AsyncStorage.getItem("auth-storage");
    if (!authStorage) return null;
    
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.token || null;
  } catch (error) {
    console.log("Error parsing token:", error);
    return null;
  }
};


api.interceptors.request.use(
  async (config) => {
    try {
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
        config.url?.includes(endpoint)
      );

      if (!isPublicEndpoint) {
        const token = await getTokenFromStorage();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("✅ Token attached to:", config.url);
        } else {
          console.log("⚠️ No token found for:", config.url);
        }
      } else {
        console.log("📢 Public endpoint - no token:", config.url);
      }
      
      return config;
    } catch (error) {
      console.log("Error in request interceptor:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);


appointmentApiClient.interceptors.request.use(
  async (config) => {
    try {
      console.log('📤 APPOINTMENT API:', config.method?.toUpperCase(), config.url);
      
      const token = await getTokenFromStorage();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token attached to appointment service:', config.url);
      } else {
        console.log('⚠️ No token for appointment service:', config.url);
      }
      
      return config;
    } catch (error) {
      console.log("❌ Error in appointment API interceptor:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    console.log("📊 URL:", originalRequest?.url);
    console.log("📊 STATUS:", error.response?.status);
    console.log("📊 DATA:", error.response?.data);
    
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
      originalRequest?.url?.includes(endpoint)
    );
    
    if (error?.response?.status === 401 && !originalRequest?._retry && !isPublicEndpoint) {
      originalRequest._retry = true;
      console.log("🔐 401 Unauthorized - Clearing auth storage");
      
      await AsyncStorage.removeItem("auth-storage");
      await AsyncStorage.removeItem("profile-storage");
    }
    
    return Promise.reject(error);
  }
);


appointmentApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("📊 APPOINTMENT API ERROR:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    

    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem("auth-storage");
    }
    
    return Promise.reject(error);
  }
);

export default api;