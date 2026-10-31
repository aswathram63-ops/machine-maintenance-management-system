
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Get all machines
export const getMachines = async (search = "", status = "") => {
    const response = await API.get("/machines", {
        params: { search, status }
    });

    return response.data;
};

// Get machine by ID
export const getMachineById = async (id) => {
    const response = await API.get(`/machines/${id}`);
    return response.data;
};

// Add machine
export const addMachine = async (machine) => {
    const response = await API.post("/machines", machine);
    return response.data;
};

// Update machine
export const updateMachine = async (id, machine) => {
    const response = await API.put(`/machines/${id}`, machine);
    return response.data;
};

// Delete machine
export const deleteMachine = async (id) => {
    const response = await API.delete(`/machines/${id}`);
    return response.data;
};
