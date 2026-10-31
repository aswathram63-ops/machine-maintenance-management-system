
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

// Get all maintenance records
export const getMaintenances = async (search = "", status = "") => {
    const response = await API.get("/maintenance", {
        params: { search, status }
    });
    return response.data;
};

// Get available machines
export const getMaintenanceMachines = async () => {
    const response = await API.get("/maintenance/machines");
    return response.data;
};

// Get maintenance staff
export const getMaintenanceStaff = async () => {
    const response = await API.get("/maintenance/staff");
    return response.data;
};

// Add maintenance
export const addMaintenance = async (maintenance) => {
    const response = await API.post("/maintenance", maintenance);
    return response.data;
};

// Get maintenance by ID
export const getMaintenanceById = async (id) => {
    const response = await API.get(`/maintenance/${id}`);
    return response.data;
};

// Update maintenance
export const updateMaintenance = async (id, maintenance) => {
    const response = await API.put(`/maintenance/${id}`, maintenance);
    return response.data;
};

// Delete maintenance
export const deleteMaintenance = async (id) => {
    const response = await API.delete(`/maintenance/${id}`);
    return response.data;
};

export const updateMaintenanceStatus = (
    id,
    status,
    work_description = ""
) =>
    API.patch(`/maintenance/${id}/status`, {
        status,
        work_description
    });