import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaUniversity, FaCheckCircle } from 'react-icons/fa';
import { createBooking } from '../../services/bookingService';
import { getAvailableVehicles, getVehicleModelById } from '../../services/vehicleService';
import { useAuth } from '../../contexts/AuthContext';

const Checkout = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [vehicleModel, setVehicleModel] = useState(null);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(state?.selectedLocation || state?.location || '');
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [loadingModel, setLoadingModel] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [bookingCreated, setBookingCreated] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const submitLockRef = useRef(false);
    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        phone: '',
        email: '',
        note: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('bank');

    const vehicleModelId = state?.vehicleModelId || state?.vehicleId || null;
    const preselectedVehicleId = state?.selectedVehicleId || null;
    const startDate = state?.startDate;
    const endDate = state?.endDate;

    const defaultImage = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop';

    useEffect(() => {
        setCustomerInfo({
            fullName: user?.fullName || '',
            phone: '',
            email: user?.email || '',
            note: '',
        });
    }, [user]);

    useEffect(() => {
        const fetchModelAndVehicles = async () => {
            if (!vehicleModelId) return;
            setLoadingModel(true);
            try {
                const [modelRes, availableVehiclesRes] = await Promise.all([
                    getVehicleModelById(vehicleModelId),
                    getAvailableVehicles(vehicleModelId),
                ]);

                if (modelRes.code === 1000 && modelRes.result) {
                    setVehicleModel(modelRes.result);
                }

                setAvailableVehicles(availableVehiclesRes?.result || []);
            } catch (_) {
                // ignore
            } finally {
                setLoadingModel(false);
            }
        };
        fetchModelAndVehicles();
    }, [vehicleModelId]);

    const availableLocations = useMemo(() => {
        return [...new Set(
            availableVehicles
                .map((item) => (item.location || '').trim())
                .filter(Boolean)
        )];
    }, [availableVehicles]);

    useEffect(() => {
        if (availableLocations.length === 0) {
            setSelectedLocation('');
            return;
        }

        setSelectedLocation((prev) => {
            if (prev && availableLocations.includes(prev)) {
                return prev;
            }
            return availableLocations[0];
        });
    }, [availableLocations]);

    const filteredAvailableVehicles = useMemo(() => {
        if (!selectedLocation) {
            return availableVehicles;
        }

        const normalizedLocation = selectedLocation.trim().toLowerCase();
        return availableVehicles.filter((item) => (item.location || '').trim().toLowerCase() === normalizedLocation);
    }, [availableVehicles, selectedLocation]);

    useEffect(() => {
        setSelectedVehicleId((prev) => {
            if (prev && filteredAvailableVehicles.some((item) => String(item.id) === String(prev))) {
                return prev;
            }

            if (preselectedVehicleId && filteredAvailableVehicles.some((item) => String(item.id) === String(preselectedVehicleId))) {
                return String(preselectedVehicleId);
            }

            return filteredAvailableVehicles[0] ? String(filteredAvailableVehicles[0].id) : '';
        });
    }, [filteredAvailableVehicles, preselectedVehicleId]);

    const totalDays = useMemo(() => {
        if (state?.totalDays) return state.totalDays;
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [state, startDate, endDate]);

    const pricePerDay = state?.pricePerDay || vehicleModel?.pricePerDay || 0;
    const totalPrice = state?.totalPrice || (pricePerDay && totalDays ? pricePerDay * totalDays : 0);

    const displayName = state?.vehicleName || vehicleModel?.name || '---';
    const displayImage = (vehicleModel?.images && vehicleModel.images.length > 0 ? vehicleModel.images[0] : null) || state?.vehicleImage || defaultImage;
    const selectedVehicle = filteredAvailableVehicles.find((item) => String(item.id) === String(selectedVehicleId));
    const displayLocation = selectedLocation || selectedVehicle?.location || vehicleModel?.location || state?.location || '---';

    const formatDateTime = (value) => {
        if (!value) return '---';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString('vi-VN');
    };

    const toDateOnly = (value) => {
        if (!value) return value;
        return value.split('T')[0];
    };

    const handleConfirmBooking = async () => {
        if (submitLockRef.current || submitting || bookingCreated) {
            return;
        }

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!vehicleModelId || !startDate || !endDate) {
            setError('Thiếu thông tin đặt xe. Vui lòng quay lại chọn xe.');
            return;
        }
        if (!selectedVehicleId) {
            setError('Hiện chưa có xe trống tại chi nhánh này. Vui lòng chọn chi nhánh hoặc thời gian khác.');
            return;
        }
        submitLockRef.current = true;
        setSubmitting(true);
        setError('');
        setSuccess('');
        let created = false;
        try {
            const payload = {
                vehicleModelId,
                vehicleId: Number(selectedVehicleId),
                paymentMethod,
                startDate: toDateOnly(startDate),
                endDate: toDateOnly(endDate),
            };
            const res = await createBooking(payload);
            if (res.code === 1000 && res.result) {
                setSuccess(`Đặt xe thành công. Mã đơn #${res.result.id}. Vui lòng chờ admin duyệt để thanh toán.`);
                setBookingCreated(true);
                created = true;
            } else {
                setError(res.message || 'Không thể tạo đơn đặt xe.');
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể tạo đơn đặt xe.');
        } finally {
            setSubmitting(false);
            if (!created) {
                submitLockRef.current = false;
            }
        }
    };

    if (!vehicleModelId || !startDate || !endDate) {
        return (
            <div className="bg-gray-50 min-h-screen pt-24 pb-12 flex items-center justify-center">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                    <p className="text-gray-700 mb-4">Không có thông tin đặt xe. Vui lòng chọn xe trước.</p>
                    <Link to="/vehicles" className="text-primary hover:underline">Quay lại danh sách xe</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-20 pb-12">
            <div className="container mx-auto px-4 md:px-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Xác nhận đặt xe</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Thông tin khách hàng
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={customerInfo.fullName}
                                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2.5 outline-none border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={customerInfo.phone}
                                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2.5 outline-none border"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={customerInfo.email}
                                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2.5 outline-none border"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                    <textarea
                                        rows="2"
                                        value={customerInfo.note}
                                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, note: e.target.value }))}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2.5 placeholder-gray-400 outline-none border"
                                        placeholder="Yêu cầu đặc biệt..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Chọn xe nhận
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Chi nhánh</label>
                                    <select
                                        className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary"
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        disabled={loadingModel || availableLocations.length === 0}
                                    >
                                        {availableLocations.length === 0 ? (
                                            <option value="">Không có chi nhánh khả dụng</option>
                                        ) : (
                                            availableLocations.map((location) => (
                                                <option key={location} value={location}>{location}</option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Xe trống tại chi nhánh</label>
                                    <select
                                        className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary"
                                        value={selectedVehicleId}
                                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                                        disabled={loadingModel || filteredAvailableVehicles.length === 0}
                                    >
                                        {filteredAvailableVehicles.length === 0 ? (
                                            <option value="">Không có xe trống</option>
                                        ) : (
                                            filteredAvailableVehicles.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.licensePlate} - {item.location || '---'}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                {selectedVehicle && (
                                    <p className="text-sm text-gray-500">
                                        Xe đã chọn: <span className="font-medium text-gray-800">{selectedVehicle.licensePlate}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                Phương thức thanh toán (sau khi được duyệt)
                            </h2>
                            <div className="space-y-3">
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                    <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="text-primary focus:ring-primary w-4 h-4" />
                                    <div className="ml-3 flex items-center gap-3 flex-1">
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FaUniversity size={20} /></div>
                                        <div>
                                            <span className="block font-medium text-gray-900">Chuyển khoản ngân hàng</span>
                                            <span className="block text-xs text-gray-500">Xác nhận sau khi admin duyệt</span>
                                        </div>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                    <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="text-primary focus:ring-primary w-4 h-4" />
                                    <div className="ml-3 flex items-center gap-3 flex-1">
                                        <div className="bg-green-100 p-2 rounded-lg text-green-600"><FaMoneyBillWave size={20} /></div>
                                        <div>
                                            <span className="block font-medium text-gray-900">Thanh toán khi nhận xe</span>
                                            <span className="block text-xs text-gray-500">Sẽ xác nhận sau khi admin duyệt</span>
                                        </div>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} disabled className="text-primary focus:ring-primary w-4 h-4" />
                                    <div className="ml-3 flex items-center gap-3 flex-1">
                                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><FaCreditCard size={20} /></div>
                                        <div>
                                            <span className="block font-medium text-gray-900">Thẻ quốc tế (Visa/Mastercard) - Tạm khóa</span>
                                            <span className="block text-xs text-gray-500">Sẽ mở ở phiên bản tiếp theo</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-bold mb-4">Chi tiết đặt xe</h2>

                            <div className="flex gap-4 mb-4 pb-4 border-b">
                                <img src={displayImage} alt="" className="w-20 h-14 object-cover rounded-md" />
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{displayName}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <FaMapMarkerAlt /> {displayLocation}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Biển số: {selectedVehicle?.licensePlate || 'Chưa chọn'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4 pb-4 border-b">
                                <div className="flex items-start gap-3">
                                    <FaCalendarAlt className="text-primary mt-1" />
                                    <div>
                                        <span className="block text-xs text-gray-500">Nhận xe</span>
                                        <span className="block text-sm font-medium text-gray-900">{formatDateTime(startDate)}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaCalendarAlt className="text-primary mt-1" />
                                    <div>
                                        <span className="block text-xs text-gray-500">Trả xe</span>
                                        <span className="block text-sm font-medium text-gray-900">{formatDateTime(endDate)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Đơn giá thuê</span>
                                    <span>{Number(pricePerDay || 0).toLocaleString()}₫ / ngày</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Thời gian</span>
                                    <span>{totalDays} ngày</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí dịch vụ</span>
                                    <span>0₫</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t">
                                    <span>Tổng cộng</span>
                                    <span className="text-primary">{Number(totalPrice || 0).toLocaleString()}₫</span>
                                </div>
                            </div>

                            {success && (
                                <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm flex items-start gap-2">
                                    <FaCheckCircle className="mt-0.5" />
                                    <span>{success}</span>
                                </div>
                            )}
                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}
                            <button
                                onClick={handleConfirmBooking}
                                disabled={submitting || bookingCreated || loadingModel || !selectedVehicleId}
                                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/30 text-center block disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {bookingCreated ? 'ĐÃ ĐẶT XE' : (submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT XE')}
                            </button>
                            <Link to={`/vehicles/${vehicleModelId}`} className="block text-center mt-3 text-sm text-gray-500 hover:text-gray-900">
                                Quay lại
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

