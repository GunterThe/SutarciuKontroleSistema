import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'http://localhost:5184/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

let isRefreshing = false;
let pendingRequests = [];

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If unauthorized and we have a refresh token, try refreshing once
        if (error.response?.status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem('refreshToken');
            const hadAccessToken = !!localStorage.getItem('token');
            if (refreshToken && hadAccessToken) {
                originalRequest._retry = true;
                try {
                    if (isRefreshing) {
                        // queue until refresh finishes
                        return new Promise((resolve, reject) => {
                            pendingRequests.push({ resolve, reject, originalRequest });
                        });
                    }
                    isRefreshing = true;
                    const { data } = await axios.post(`${API_BASE_URL}/Auth/refresh`, { RefreshToken: refreshToken });
                    if (data?.accessToken) {
                        localStorage.setItem('token', data.accessToken);
                    }
                    if (data?.refreshToken) {
                        localStorage.setItem('refreshToken', data.refreshToken);
                    }
                    try { window.dispatchEvent(new Event('authChange')) } catch {}
                    // resume queued requests
                    pendingRequests.forEach(({ resolve }) => resolve(apiClient(originalRequest)));
                    pendingRequests = [];
                    return apiClient(originalRequest);
                } catch (refreshErr) {
                    // refresh failed: clear tokens and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    try { window.dispatchEvent(new Event('authChange')) } catch {}
                    pendingRequests.forEach(({ reject }) => reject(refreshErr));
                    pendingRequests = [];
                    // propagate original error
                    return Promise.reject(error);
                } finally {
                    isRefreshing = false;
                }
            }
        }
        return Promise.reject(error);
    }
);

    export const login = async (el_pastas, password) => {
        const { data } = await apiClient.post('/Auth/login', { El_pastas: el_pastas, Password: password });
            if (data?.accessToken) {
                localStorage.setItem('token', data.accessToken);
                // notify app that auth state changed
                try { window.dispatchEvent(new Event('authChange')) } catch {}
            }
            if (data?.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
        return data;
    };

    export const register = async (vardas, pavarde, gimimo_data, el_pastas, password) => {
        const { data } = await apiClient.post('/Auth/register', { Vardas: vardas, Pavarde: pavarde, Gimimo_data: gimimo_data, El_pastas: el_pastas, Password: password });
        return data;
    };

    export const getNaudotojai = async () => {
        const { data } = await apiClient.get('/Naudotojas');
        return data;
    };

    export const getNaudotojasIrasai = async (id, archyvuotas) => {
        const { data } = await apiClient.get(`/Naudotojas/${id}/Irasai`, { params: { Archyvuotas: archyvuotas } });
        return data;
    };

    export const getIrasaiAll = async () => {
        const { data } = await apiClient.get('/Irasas');
        return data;
    };

    export const getTags = async () => {
        const { data } = await apiClient.get('/Tag');
        return data;
    };

    // Tag CRUD for admin
    export const createTag = async (payload) => {
        const { data } = await apiClient.post('/Tag', payload);
        return data;
    };

    export const updateTag = async (id, payload) => {
        await apiClient.put(`/Tag/${id}`, payload);
    };

    export const deleteTag = async (id) => {
        await apiClient.delete(`/Tag/${id}`);
    };

    export const getCurrentUser = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return decoded;
        } catch {
            return null;
        }
    };

    export const getIrasasById = async (id) => {
        const { data } = await apiClient.get(`/Irasas/${id}`);
        return data;
    };

    export const archiveIrasas = async (id) => {
        await apiClient.post(`/Irasas/${id}/Archive`);
    };

    export const getCommentsForIrasas = async (irasasId) => {
        const { data } = await apiClient.get(`/Comment/Irasas/${irasasId}`);
        return data;
    };

    // Admin comment endpoints
    export const getAllComments = async () => {
        const { data } = await apiClient.get('/Comment');
        return data;
    };

    export const updateComment = async (id, payload) => {
        await apiClient.put(`/Comment/${id}`, payload);
    };

    export const deleteComment = async (id) => {
        await apiClient.delete(`/Comment/${id}`);
    };

    export const createComment = async (payload) => {
        const { data } = await apiClient.post('/Comment', payload);
        return data;
    };

    export const updateIrasas = async (id, payload) => {
        await apiClient.put(`/Irasas/${id}`, payload);
    };

    export const deleteIrasas = async (id) => {
        await apiClient.delete(`/Irasas/${id}`);
    };

    export const createIrasas = async (payload) => {
        const { data } = await apiClient.post('/Irasas', payload);
        return data;
    };

    // Naudotojas (users) admin CRUD
    export const createNaudotojas = async (payload) => {
        const { data } = await apiClient.post('/Naudotojas', payload);
        return data;
    };

    export const updateNaudotojas = async (id, payload) => {
        await apiClient.put(`/Naudotojas/${id}`, payload);
    };

    export const deleteNaudotojas = async (id) => {
        await apiClient.delete(`/Naudotojas/${id}`);
    };

    export const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        try { window.dispatchEvent(new Event('authChange')) } catch {}
        window.location.href = '/login';
    };

    export default apiClient;