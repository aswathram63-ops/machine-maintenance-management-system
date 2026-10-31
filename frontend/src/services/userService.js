import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

// Automatically attach JWT token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Get all users
export const getUsers = (params = {}) => {
    return API.get("/users", { params });
};

// Create user
export const createUser = (userData) => {
    return API.post("/users", userData);
};

// Update user
export const updateUser = (id, userData) => {
    return API.put(`/users/${id}`, userData);
};

// Activate / Deactivate user
export const updateUserStatus = (id, is_active) => {
    return API.patch(`/users/${id}/status`, { is_active });
};

export default API;