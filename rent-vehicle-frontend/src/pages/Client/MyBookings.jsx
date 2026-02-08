import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaCar, FaStar, FaEye, FaHistory } from 'react-icons/fa';
import { getMyBookings, cancelBooking } from '../../services/bookingService';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cancellingId, setCancellingId] = useState(null);
    const bookingsPerPage = 5;

    const placeholderImage = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError('');
            try {
                const params = {
                    page: currentPage,
                    size: bookingsPerPage,
                };
                if (statusFilter !== 'all') {
                    params.status = statusFilter;
                }
                const res = await getMyBookings(params);
                const result = res.result || {};
                setBookings(result.data || []);
                setTotalPages(result.totalPages || 1);
            } catch (err) {
                setBookings([]);
                setTotalPages(1);
                setError('Không thể tải danh sách đặt xe.');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [statusFilter, currentPage]);

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn này?')) return;
        setCancellingId(bookingId);
        try {
            await cancelBooking(bookingId);
            const res = await getMyBookings({
                page: currentPage,
                size: bookingsPerPage,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            });
            const result = res.result || {};
            setBookings(result.data || []);
            setTotalPages(result.totalPages || 1);
        } catch (_) {
            setError('Không thể hủy đơn. Vui lòng thử lại.');
        } finally {
            setCancellingId(null);
        }
    };

    const normalizeStatus = (status) => (status || '').toLowerCase();

    const getStatusBadge = (status) => {
        switch (normalizeStatus(status)) {
            case 'pending': 
                return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Chờ duyệt</span>;
            case 'approved': 
                return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Đã duyệt</span>;
            case 'completed': 
                return <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Hoàn thành</span>;
            case 'canceled': 
                return <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Đã hủy</span>;
            default:
                return null;
        }
    };

    const formatDate = (value) => {
        if (!value) return '---';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-full text-primary">
                            <FaHistory className="text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Lịch sử đặt xe</h1>
                            <p className="text-gray-500 text-sm">Quản lý các chuyến đi của bạn</p>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {[
                            { key: 'all', label: 'Tất cả' },
                            { key: 'pending', label: 'Chờ duyệt' },
                            { key: 'approved', label: 'Đã duyệt' },
                            { key: 'completed', label: 'Hoàn thành' },
                            { key: 'canceled', label: 'Đã hủy' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${statusFilter === item.key ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                onClick={() => { setStatusFilter(item.key); setCurrentPage(1); }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
                    ) : bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="md:w-64 h-48 md:h-auto relative">
                                    <img src={placeholderImage} alt={booking.vehicleModelName} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 left-2">
                                        {getStatusBadge(booking.status)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{booking.vehicleModelName || '---'}</h3>
                                            <span className="text-primary font-bold text-lg">{Number(booking.totalPrice || 0).toLocaleString()}₫</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-gray-400" />
                                                <span>---</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-gray-400" />
                                                <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaCar className="text-gray-400" />
                                                <span>Mã đơn: #{booking.id?.toString().padStart(6, '0')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-dashed">
                                        {booking.vehicleModelId && (
                                            <Link to={`/vehicles/${booking.vehicleModelId}`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm flex items-center gap-2 transition-colors">
                                                <FaEye /> Xem chi tiết
                                            </Link>
                                        )}
                                        
                                        {normalizeStatus(booking.status) === 'completed' && (
                                            <button className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 font-medium text-sm flex items-center gap-2 transition-colors shadow-sm">
                                                <FaStar /> Viết đánh giá
                                            </button>
                                        )}
                                        
                                        {(normalizeStatus(booking.status) === 'pending' || normalizeStatus(booking.status) === 'approved') && (
                                            <button
                                                onClick={() => handleCancel(booking.id)}
                                                disabled={cancellingId === booking.id}
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {cancellingId === booking.id ? 'Đang hủy...' : 'Hủy đặt xe'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {!loading && bookings.length === 0 && (
                    <div className="text-center py-12">
                         <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                             <FaCar className="text-4xl" />
                         </div>
                         <h3 className="text-lg font-medium text-gray-900">Không tìm thấy chuyến đi nào</h3>
                         <p className="text-gray-500 mb-6">Bạn chưa có chuyến đi nào thuộc trạng thái này.</p>
                         <button onClick={() => { setStatusFilter('all'); setCurrentPage(1); }} className="inline-block px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-orange-600">
                             Xem tất cả
                         </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <nav className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                «
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold shadow-sm transition-colors ${currentPage === i + 1 ? 'bg-primary text-white shadow-blue-500/30' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                »
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
