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
export const deleteActivity = (id) => api.delete(`/activities/${id}`);
export const getActivityStats = () => api.get('/activities/stats');
export const getActivityDetail = (id) => api.get(`/recommendations/activity/${id}`);
export const getActivityRecommendation = (id) => api.get(`/recommendations/activity/${id}`);
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (data) => api.put('/users/profile', data);
export const sendAIChatMessage = (payload) => api.post('/recommendations/chat', payload);

// Admin Control Centre APIs
export const getAdminUsers = () => api.get('/users/admin/all');
export const getAdminUserStats = () => api.get('/users/admin/stats');
export const getAdminActivityStats = () => api.get('/activities/admin/platform-stats');
export const deactivateUser = (userId) => api.put(`/users/admin/${userId}/deactivate`);
export const restoreUser = (userId) => api.put(`/users/admin/${userId}/restore`);
export const purgeUser = (userId) => api.delete(`/users/admin/${userId}/purge`);

// Real-Time Platform Announcements & Contests
export const getActiveAnnouncement = () => api.get('/announcements/active');
export const getAllActiveAnnouncements = () => api.get('/announcements/active-all');
export const getAllAnnouncements = () => api.get('/announcements/all');
export const publishAnnouncement = (data) => api.post('/announcements', data);
export const toggleAnnouncement = (id) => api.put(`/announcements/${id}/toggle`);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);
export const clearAnnouncement = () => api.delete('/announcements/active');

// Real-Time Community Leaderboard
export const getLeaderboard = (period = 'all') => api.get(`/activities/leaderboard?period=${period}`);
