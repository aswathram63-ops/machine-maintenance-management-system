
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

export const getWorkLogs = (search = "") =>
    API.get("/work-logs", {
        params: { search }
    });

export const getWorkLogBreakdowns = () =>
    API.get("/work-logs/breakdowns");

export const getWorkLogMaintenances = () =>
    API.get("/work-logs/maintenances");

export const getWorkLogStaff = () =>
    API.get("/work-logs/staff");

export const addWorkLog = (data) =>
    API.post("/work-logs", data);

export const getWorkLogById = (id) =>
    API.get(`/work-logs/${id}`);
