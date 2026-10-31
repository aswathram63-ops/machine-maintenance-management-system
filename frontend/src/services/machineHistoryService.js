import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

// Attach JWT token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Get machine history by machine ID
export const getMachineHistory = (machineId) => {
    return API.get(`/machine-history/${machineId}`);
};

export default API;