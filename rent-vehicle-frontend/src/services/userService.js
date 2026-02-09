import api from './api';

const userService = {

    getMyProfile: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    updateMyProfile: async (fullName) => {
        const response = await api.put('/users/me', null, {
            params: { fullName },
        });
        return response.data;
    },
};

export default userService;
