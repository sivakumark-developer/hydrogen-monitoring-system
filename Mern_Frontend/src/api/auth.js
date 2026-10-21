import api from "./axiosConfig";

const API_URL = "/api/auth";

// REGISTER
export const registerUser = async (userData) => {
const response = await api.post(`${API_URL}/register`, userData);
return response.data;
};

// LOGIN
export const loginUser = async (userData) => {
const response = await api.post(`${API_URL}/login`, userData);
return response.data;
};

// LOGOUT
export const logoutUser = async () => {
const response = await api.post(`${API_URL}/logout`, {});
return response.data;
};

// GET CURRENT USER
export const getCurrentUser = async () => {
const response = await api.get(`${API_URL}/me`);
return response.data;
};

// FORGOT PASSWORD
export const forgotPassword = async (email) => {
const response = await api.post(`${API_URL}/forgot-password`, { email });
return response.data;
};

// RESET PASSWORD
export const resetPassword = async (token, password) => {
const response = await api.post(
`${API_URL}/reset-password/${encodeURIComponent(token)}`,
{ password }
);
return response.data;
};
