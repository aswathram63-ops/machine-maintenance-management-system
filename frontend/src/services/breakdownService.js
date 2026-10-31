
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

export const getBreakdowns = (search = "", status = "", priority = "") =>
    API.get("/breakdowns", {
        params: { search, status, priority }
    });

export const getBreakdownMachines = () =>
    API.get("/breakdowns/machines");

export const getBreakdownStaff = async () => {
    const response = await API.get("/breakdowns/staff");
    return response.data;
};

export const addBreakdown = (data) =>
    API.post("/breakdowns", data);

export const getBreakdownById = (id) =>
    API.get(`/breakdowns/${id}`);

export const updateBreakdown = (id, data) =>
    API.put(`/breakdowns/${id}`, data);

export const deleteBreakdown = (id) =>
    API.delete(`/breakdowns/${id}`);

export const updateBreakdownStatus = (
    id,
    status,
    work_description = ""
) =>
    API.patch(`/breakdowns/${id}/status`, {
        status,
        work_description
    });
