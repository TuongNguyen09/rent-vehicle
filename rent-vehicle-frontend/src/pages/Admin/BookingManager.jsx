import { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaEye, FaCheck, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { getAllBookings, approveBooking, cancelBooking } from '../../services/bookingService';

const BookingManager = () => {
    const [bookings, setBookings] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const itemsPerPage = 5;

    const [filterStatus, setFilterStatus] = useState('all');
    const [filterFromDate, setFilterFromDate] = useState('');
    const [filterToDate, setFilterToDate] = useState('');
    const [filterError, setFilterError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async () => {
        if (filterFromDate && filterToDate && filterFromDate > filterToDate) {
            setFilterError('From date cannot be greater than to date.');
            setBookings([]);
            setTotalPages(1);
            setTotalElements(0);
            return;
        }

        setFilterError('');
        setLoading(true);
        try {
            const params = { page: currentPage, size: itemsPerPage };
            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }
            if (filterFromDate) {
                params.fromDate = filterFromDate;
            }
            if (filterToDate) {
                params.toDate = filterToDate;
            }

            const response = await getAllBookings(params);
            const result = response.result || {};
            setBookings(result.data || []);
            setTotalPages(result.totalPages || 1);
            setTotalElements(result.totalElements || 0);
        } catch (_) {
            setBookings([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [currentPage, filterStatus, filterFromDate, filterToDate]);

    const normalizeStatus = (status) => (status || '').toLowerCase();

    const getStatusColor = (status) => {
        switch (normalizeStatus(status)) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'canceled':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (normalizeStatus(status)) {
            case 'pending':
                return 'Chờ duyệt';
            case 'approved':
                return 'Đã duyệt';
            case 'completed':
                return 'Hoàn thành';
            case 'canceled':
                return 'Đã hủy';
            default:
                return status || '---';
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Xac nhan duyet don dat xe nay?')) return;
        setActionLoadingId(id);
        try {
            await approveBooking(id);
            await fetchBookings();
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Xac nhan huy don dat xe nay?')) return;
        setActionLoadingId(id);
        try {
            await cancelBooking(id);
            await fetchBookings();
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const formatDate = (value) => {
        if (!value) return '---';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString('vi-VN');
    };

    const formatMoney = (value) => Number(value || 0).toLocaleString('vi-VN');

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Quan ly Dat xe</h1>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tim kiem don hang..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-full sm:w-64"
                                disabled
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="canceled">Đã hủy</option>
                        </select>
                        <input
                            type="date"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            value={filterFromDate}
                            onChange={(e) => {
                                setFilterFromDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            title="From date"
                        />
                        <input
                            type="date"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            value={filterToDate}
                            onChange={(e) => {
                                setFilterToDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            title="To date"
                        />
                    </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">Tổng đơn: {totalElements}</div>
                {filterError && <div className="text-sm text-red-600 mt-2">{filterError}</div>}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ma don</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khach hang</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Xe thue</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thoi gian</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tong tien</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trang thai</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hanh dong</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-8">Dang tai du lieu...</td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-medium text-blue-600">{booking.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                                                <FaUser />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{booking.userEmail || '---'}</div>
                                                <div className="text-sm text-gray-500">ID: {booking.userId || '---'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{booking.vehicleModelName || '---'}</div>
                                        <div className="text-xs text-gray-500">
                                            {booking.vehicleLicensePlate ? `Bien so: ${booking.vehicleLicensePlate}` : 'Chua gan xe'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDate(booking.startDate)}</div>
                                        <div className="text-sm text-gray-500">den {formatDate(booking.endDate)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{formatMoney(booking.totalPrice)}d</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(booking.status)}`}>
                                            {getStatusText(booking.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleViewDetail(booking)}
                                                className="text-gray-600 hover:text-gray-900 bg-gray-50 p-2 rounded hover:bg-gray-100"
                                                title="Xem chi tiet"
                                            >
                                                <FaEye />
                                            </button>
                                            {normalizeStatus(booking.status) === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(booking.id)}
                                                        disabled={actionLoadingId === booking.id}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded hover:bg-green-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                                        title="Duyet don"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(booking.id)}
                                                        disabled={actionLoadingId === booking.id}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                                        title="Huy don"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}
                                            {normalizeStatus(booking.status) === 'approved' && (
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    disabled={actionLoadingId === booking.id}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    title="Huy don"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center p-4 border-t border-gray-100 bg-white">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md mr-2 ${
                            currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                        Quay lai
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-md mx-1 ${
                                currentPage === i + 1
                                    ? 'bg-primary text-white'
                                    : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md ml-2 ${
                            currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                        Tiep theo
                    </button>
                </div>
            )}

            {!loading && bookings.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-5xl mb-4">
                        <FaCalendarAlt className="mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg">Khong tim thay don dat xe nao.</p>
                </div>
            )}

            {showDetailModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Chi tiet don dat xe</h2>
                            <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-500">Ma don hang</p>
                                    <p className="font-bold text-blue-600 text-lg">{selectedBooking.id}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedBooking.status)}`}>
                                    {getStatusText(selectedBooking.status)}
                                </span>
                            </div>

                            <div className="border-t border-b py-4 space-y-3">
                                <h3 className="font-bold text-gray-800 mb-2">Thong tin khach hang</h3>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium text-gray-900">{selectedBooking.userEmail || '---'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">User ID:</span>
                                    <span className="font-medium text-gray-900">{selectedBooking.userId || '---'}</span>
                                </div>
                            </div>

                            <div className="border-b py-4 space-y-3">
                                <h3 className="font-bold text-gray-800 mb-2">Thong tin xe</h3>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-bold text-gray-900">{selectedBooking.vehicleModelName || '---'}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Bien so: {selectedBooking.vehicleLicensePlate || 'Chua gan'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Dia diem: {selectedBooking.vehicleLocation || 'Chua gan'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Vehicle ID: {selectedBooking.vehicleId || 'Chua gan'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <h3 className="font-bold text-gray-800 mb-2">Chi tiet dat xe</h3>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Thoi gian thue:</span>
                                    <span className="font-medium text-gray-900">
                                        {formatDate(selectedBooking.startDate)} - {formatDate(selectedBooking.endDate)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t mt-2">
                                    <span>Tong tien:</span>
                                    <span>{formatMoney(selectedBooking.totalPrice)}d</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Dong
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManager;