
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

export const signupUser = async (userData) => {
    const response = await API.post("/auth/signup", userData);
    return response.data;
};
