import axios from "axios";
import { getToken, removeToken } from "../utils/auth";

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Add token to requests if available
API.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle token expiration
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeToken();
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

/// login 
export const loginUser = (data) => 
    API.post("/auth/login" , data);

/// signup
export const signupUser = (data) =>
    API.post("/auth/signup", data);

/// logout
export const logoutUser = () =>
    API.post("/auth/logout");

/// get profile
export const getProfile = () =>
    API.get("/auth/profile");

/// forgot password
export const forgotPassword = (data) =>
    API.post("/auth/forgot-password", data);

/// reset password
export const resetPassword = (data) =>
    API.post("/auth/reset-password", data);

export default API;