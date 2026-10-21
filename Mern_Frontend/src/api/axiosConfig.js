import axios from "axios";

const api = axios.create({
baseURL: "https://hydrogen-monitoring-system.onrender.com",
withCredentials: true,
});

export default api;
