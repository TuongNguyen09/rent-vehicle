import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    adminLoginStart: async (username, password) => {
        const response = await api.post('/auth/admin/login', { username, password });
        return response.data;
    },

    adminLoginVerify: async (username, code) => {
        const response = await api.post('/auth/admin/verify', { username, code });
        return response.data;
    },

    requestChangePasswordCode: async () => {
        const response = await api.post('/auth/password/change/request-code');
        return response.data;
    },

    confirmChangePassword: async (code, oldPassword, newPassword, confirmPassword) => {
        const response = await api.post('/auth/password/change/confirm', {
            code,
            oldPassword,
            newPassword,
            confirmPassword,
        });
        return response.data;
    },

    requestForgotPasswordCode: async (email) => {
        const response = await api.post('/auth/password/forgot/request-code', { email });
        return response.data;
    },

    confirmForgotPassword: async (email, code, newPassword, confirmPassword) => {
        const response = await api.post('/auth/password/forgot/confirm', {
            email,
            code,
            newPassword,
            confirmPassword,
        });
        return response.data;
    },

    register: async (fullName, email, password) => {
        const response = await api.post('/auth/register', { fullName, email, password });
        return response.data;
    },

    googleLogin: async (googleToken) => {
        const response = await api.post('/auth/oauth2/google', { token: googleToken });
        return response.data;
    },

    facebookLogin: async (facebookToken) => {
        const response = await api.post('/auth/oauth2/facebook', { token: facebookToken });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    verifyToken: async () => {
        const response = await api.post('/auth/verify-token');
        return response.data;
    },

    getUserInfo: async () => {
        const response = await api.get('/auth/user-info');
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    logoutAllDevices: async () => {
        try {
            await api.post('/auth/logout-all');
        } catch (error) {
            console.error('Logout all devices error:', error);
        }
    },

    checkAuth: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data.code === 1000 ? response.data.result : null;
        } catch {
            return null;
        }
    },
};

export default authService;
