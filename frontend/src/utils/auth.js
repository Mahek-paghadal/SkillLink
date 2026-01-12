// Token storage utilities
import { jwtDecode } from 'jwt-decode';

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const removeToken = () => {
    localStorage.removeItem('token');
};

export const isAuthenticated = () => {
    return !!getToken();
};

export const getUserRole = () => {
    try {
        const token = getToken();
        if (!token) return null;
        const decoded = jwtDecode(token);
        return decoded.role;
    } catch (error) {
        return null;
    }
};

export const getUserId = () => {
    try {
        const token = getToken();
        if (!token) return null;
        const decoded = jwtDecode(token);
        return decoded.userId;
    } catch (error) {
        return null;
    }
};
