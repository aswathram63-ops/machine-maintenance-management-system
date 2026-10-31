
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

export const getProfile = () => {
    return API.get("/settings/profile");
};

export const updateProfile = (profileData) => {
    return API.put("/settings/profile", profileData);
};

export const changePassword = (passwordData) => {
    return API.put("/settings/change-password", passwordData);
};
