import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL
});

function getStoredToken() {
    let token = localStorage.getItem('token');
    if (!token) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('token') || key.includes('ROCP')) && !key.includes('userId')) {
                const val = localStorage.getItem(key);
                if (val && (val.startsWith('ey') || val.includes('.'))) {
                    return val;
                }
            }
        }
    }
    return token;
}

function parseJwtSub(token) {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const parsed = JSON.parse(jsonPayload);
        return parsed.sub;
    } catch {
        return null;
    }
}

api.interceptors.request.use((config) => {
    let token = getStoredToken();
    let userId = localStorage.getItem('userId');

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        if (!userId) {
            userId = parseJwtSub(token);
            if (userId) {
                localStorage.setItem('userId', userId);
            }
        }
    }
    if (userId) {
        config.headers['X-User-ID'] = userId;
    }
    return config;
});

export const getActivities = () => api.get('/activities');
export const getActivity = (id) => api.get(`/activities/${id}`);
export const addActivity = (activity) => api.post('/activities', activity);
export const getActivityDetail = (id) => api.get(`/recommendations/activity/${id}`);
export const getActivityRecommendation = (id) => api.get(`/recommendations/activity/${id}`);


