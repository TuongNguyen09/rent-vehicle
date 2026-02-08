import api from './api';

const authService = {
    // Đăng nhập bằng email/password
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

    // Đăng ký tài khoản mới
    register: async (fullName, email, password) => {
        const response = await api.post('/auth/register', { fullName, email, password });
        return response.data;
    },

    // Đăng nhập bằng Google
    googleLogin: async (googleToken) => {
        const response = await api.post('/auth/oauth2/google', { token: googleToken });
        return response.data;
    },

    // Đăng nhập bằng Facebook
    facebookLogin: async (facebookToken) => {
        const response = await api.post('/auth/oauth2/facebook', { token: facebookToken });
        return response.data;
    },

    // Lấy thông tin user hiện tại (sử dụng cookie)
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Xác thực token
    verifyToken: async () => {
        const response = await api.post('/auth/verify-token');
        return response.data;
    },

    // Lấy thông tin user hiện tại
    getUserInfo: async () => {
        const response = await api.get('/auth/user-info');
        return response.data;
    },

    // Refresh token
    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },

    // Đăng xuất
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    // Đăng xuất tất cả thiết bị
    logoutAllDevices: async () => {
        try {
            await api.post('/auth/logout-all');
        } catch (error) {
            console.error('Logout all devices error:', error);
        }
    },

    // Kiểm tra đã đăng nhập chưa (gọi API thay vì check localStorage)
    checkAuth: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data.code === 1000 ? response.data.result : null;
        } catch (error) {
            return null;
        }
    },
};

export default authService;
