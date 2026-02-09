import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaHome, FaHistory, FaRedo } from 'react-icons/fa';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();

    const status = (searchParams.get('status') || 'failed').toLowerCase();
    const bookingId = searchParams.get('bookingId');
    const paymentId = searchParams.get('paymentId');
    const reason = searchParams.get('reason');

    const isSuccess = status === 'success';

    const getReasonMessage = () => {
        if (isSuccess) {
            return 'Giao dịch đã được xác nhận thành công.';
        }

        switch ((reason || '').toLowerCase()) {
            case 'invalid_hash':
                return 'Chữ ký thanh toán không hợp lệ.';
            case 'payment_not_found':
                return 'Không tìm thấy thông tin giao dịch.';
            case 'invalid_txn_ref':
                return 'Mã giao dịch không hợp lệ.';
            case '24':
                return 'Giao dịch đã bị hủy bởi người dùng.';
            case '51':
                return 'Tài khoản không đủ số dư để thanh toán.';
            default:
                return 'Thanh toán không thành công. Vui lòng thử lại.';
        }
    };

    const retryUrl = bookingId ? `/payment/${bookingId}` : '/my-bookings';

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12 flex items-center justify-center">
            <div className="container mx-auto px-4">
                <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
                    {isSuccess ? (
                        <div>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCheckCircle className="text-green-500 text-5xl" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công</h1>
                            <p className="text-gray-500 mb-2">{getReasonMessage()}</p>
                            <p className="text-gray-500 mb-8 text-sm">
                                Booking #{bookingId || '---'}
                                {paymentId ? ` - Payment #${paymentId}` : ''}
                            </p>

                            <div className="space-y-3">
                                <Link
                                    to="/my-bookings"
                                    className="block w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                                >
                                    <FaHistory /> Xem lịch sử đặt xe
                                </Link>
                                <Link
                                    to="/"
                                    className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <FaHome /> Về trang chủ
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaTimesCircle className="text-red-500 text-5xl" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h1>
                            <p className="text-gray-500 mb-2">{getReasonMessage()}</p>
                            <p className="text-gray-500 mb-8 text-sm">
                                Booking #{bookingId || '---'}
                                {paymentId ? ` - Payment #${paymentId}` : ''}
                            </p>

                            <div className="space-y-3">
                                <Link
                                    to={retryUrl}
                                    className="block w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                                >
                                    <FaRedo /> Thử lại
                                </Link>
                                <Link
                                    to="/my-bookings"
                                    className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <FaHistory /> Quay về lịch sử booking
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentCallback;
