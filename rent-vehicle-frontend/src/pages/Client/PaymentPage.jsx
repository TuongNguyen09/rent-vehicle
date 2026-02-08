import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaUniversity } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { createVnPayPaymentUrl } from '../../services/paymentService';

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    const parsedBookingId = useMemo(() => Number(bookingId), [bookingId]);
    const isBookingIdValid = Number.isFinite(parsedBookingId) && parsedBookingId > 0;

    const handlePayWithVnPay = async () => {
        if (!isAuthenticated) {
            sessionStorage.setItem('postLoginRedirect', `/payment/${bookingId}`);
            navigate('/login');
            return;
        }

        if (!isBookingIdValid) {
            setError('Mã booking không hợp lệ.');
            return;
        }

        setCreating(true);
        setError('');

        try {
            const response = await createVnPayPaymentUrl(parsedBookingId);
            if (response.code === 1000 && response.result?.paymentUrl) {
                window.location.href = response.result.paymentUrl;
                return;
            }
            setError(response.message || 'Không thể khởi tạo thanh toán VNPay.');
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể khởi tạo thanh toán VNPay.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                <Link
                    to="/my-bookings"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <FaArrowLeft />
                    Quay lại lịch sử booking
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <FaUniversity className="text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Thanh toán VNPay</h1>
                            <p className="text-sm text-gray-500">
                                Booking #{isBookingIdValid ? parsedBookingId : bookingId}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 mb-4">
                        Hệ thống sẽ chuyển bạn sang cổng thanh toán VNPay để hoàn tất giao dịch.
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {!isAuthenticated && (
                        <div className="mb-4 p-3 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                            Vui lòng đăng nhập trước khi thanh toán.
                        </div>
                    )}

                    <button
                        onClick={handlePayWithVnPay}
                        disabled={creating || !isBookingIdValid}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {creating ? (
                            <span className="inline-flex items-center gap-2">
                                <FaSpinner className="animate-spin" />
                                ĐANG CHUYỂN HƯỚNG...
                            </span>
                        ) : (
                            'THANH TOÁN NGAY'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
