import api from './api';

export const createBooking = async (data) => {
    const response = await api.post('/bookings', data);
    return response.data;
};

export const getMyBookings = async (params = {}) => {
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
};

export const getAllBookings = async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
};

export const approveBooking = async (id) => {
    const response = await api.put(`/bookings/${id}/approve`);
    return response.data;
};

export const cancelBooking = async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
};

export const getBookingById = async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
};

export default {
    createBooking,
    getMyBookings,
    getAllBookings,
    approveBooking,
    cancelBooking,
    getBookingById,
};
