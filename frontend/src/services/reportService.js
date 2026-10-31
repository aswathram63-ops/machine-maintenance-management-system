
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

// Report Overview
export const getReportOverview = () => {
    return API.get("/reports/overview");
};

// Machine Status Report
export const getMachineStatusReport = () => {
    return API.get("/reports/machine-status");
};

// Breakdown Report
export const getBreakdownReport = () => {
    return API.get("/reports/breakdowns");
};

// Maintenance Report
export const getMaintenanceReport = () => {
    return API.get("/reports/maintenance");
};

// Staff Performance Report
export const getStaffPerformanceReport = () => {
    return API.get("/reports/staff-performance");
};

export default API;
