import api from './api';

export const createVnPayPaymentUrl = async (bookingId) => {
    const response = await api.post('/payments/vnpay/create', null, {
        params: { bookingId },
    });
    return response.data;
};

export default {
    createVnPayPaymentUrl,
};
