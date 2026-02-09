import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaStar, FaUser, FaGasPump, FaCogs, FaMapMarkerAlt, FaCalendarAlt, FaCheck, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import { getVehicleModelById, getVehiclesByModel } from '../../services/vehicleService';

const VehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [vehicle, setVehicle] = useState(null);
    const [modelVehicles, setModelVehicles] = useState([]);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const defaultImage = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop';

    useEffect(() => {
        const fetchVehicle = async () => {
            setLoading(true);
            try {
                const [modelResponse, vehiclesResponse] = await Promise.all([
                    getVehicleModelById(id),
                    getVehiclesByModel(id),
                ]);

                if (modelResponse.code === 1000 && modelResponse.result) {
                    setVehicle(modelResponse.result);
                    const images = modelResponse.result.images;
                    setActiveImage(images && images.length > 0 ? images[0] : defaultImage);
                } else {
                    setError('Không tìm thấy thông tin xe');
                }

                const allVehicles = vehiclesResponse?.result || [];
                setModelVehicles(allVehicles);
                setAvailableVehicles(allVehicles.filter((item) => item.status === 'available'));
            } catch (err) {
                console.error('Error fetching vehicle:', err);
                setError('Có lỗi xảy ra khi tải thông tin xe');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchVehicle();
        }
    }, [id]);

    const allLocations = useMemo(() => {
        return [...new Set(
            modelVehicles
                .map((item) => (item.location || '').trim())
                .filter(Boolean)
        )];
    }, [modelVehicles]);

    const availableLocationSet = useMemo(() => {
        return new Set(
            availableVehicles
                .map((item) => (item.location || '').trim())
                .filter(Boolean)
        );
    }, [availableVehicles]);

    useEffect(() => {
        setSelectedLocation((prev) => {
            if (allLocations.length > 0) {
                if (prev && allLocations.includes(prev)) {
                    return prev;
                }

                const firstAvailableLocation = allLocations.find((item) => availableLocationSet.has(item));
                return firstAvailableLocation || allLocations[0];
            }

            if (prev) {
                return prev;
            }

            return vehicle?.location || '';
        });
    }, [allLocations, availableLocationSet, vehicle?.location]);

    const calculateTotal = () => {
        if (!startDate || !endDate || !vehicle) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 0;
        return vehicle.pricePerDay * diffDays;
    };

    const calculateDays = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleBooking = () => {
        if (!startDate || !endDate) {
            alert('Vui lòng chọn ngày nhận và trả xe');
            return;
        }

        if (!selectedLocation) {
            alert('Vui lòng chọn chi nhánh nhận xe');
            return;
        }

        if (!availableLocationSet.has(selectedLocation)) {
            alert('Chi nhánh này hiện unavailable, vui lòng chọn chi nhánh khác');
            return;
        }

        const days = calculateDays();
        if (days <= 0) {
            alert('Ngày trả xe phải sau ngày nhận xe');
            return;
        }

        const preselectedVehicle = availableVehicles.find((item) => {
            const itemLocation = (item.location || '').trim().toLowerCase();
            return itemLocation === selectedLocation.trim().toLowerCase();
        });

        navigate('/checkout', {
            state: {
                vehicleModelId: vehicle.id,
                vehicleName: vehicle.name,
                location: selectedLocation,
                selectedLocation,
                selectedVehicleId: preselectedVehicle?.id,
                pricePerDay: vehicle.pricePerDay,
                startDate,
                endDate,
                totalDays: days,
                totalPrice: calculateTotal(),
            },
        });
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <FaSpinner className="animate-spin text-4xl text-primary" />
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                <p className="text-gray-500 text-lg mb-4">{error || 'Không tìm thấy xe'}</p>
                <Link to="/vehicles" className="text-primary hover:underline">Quay lại danh sách xe</Link>
            </div>
        );
    }

    const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [defaultImage];
    const features = vehicle.features || [];
    const selectedLocationAvailable = availableLocationSet.has(selectedLocation);

    return (
        <div className="bg-gray-50 min-h-screen pb-12 pt-20">
            <div className="container mx-auto px-4 md:px-6 py-6">
                <div className="text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-primary">Trang chủ</Link>
                    <span className="mx-2">/</span>
                    <Link to="/vehicles" className="hover:text-primary">Danh sách xe</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">{vehicle.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                            <div className="h-[400px] w-full bg-gray-200 relative group">
                                <img src={activeImage} alt={vehicle.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={`w-2 h-2 rounded-full transition-all ${activeImage === img ? 'bg-white w-6' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 p-2 overflow-x-auto">
                                {images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-24 h-16 rounded cursor-pointer border-2 flex-shrink-0 ${activeImage === img ? 'border-primary' : 'border-transparent'}`}
                                        onClick={() => setActiveImage(img)}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{vehicle.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <FaStar />
                                    <span className="font-bold text-gray-900">{vehicle.averageRating ? vehicle.averageRating.toFixed(1) : 'N/A'}</span>
                                </div>
                                <span>•</span>
                                <span>{vehicle.totalTrips || 0} chuyến</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <FaMapMarkerAlt />
                                    <span>{selectedLocation || vehicle.location || 'Hồ Chí Minh'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <FaUser className="mx-auto text-gray-400 mb-1" />
                                    <span className="block text-sm font-medium text-gray-900">{vehicle.seats || 4} chỗ</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <FaCogs className="mx-auto text-gray-400 mb-1" />
                                    <span className="block text-sm font-medium text-gray-900">{vehicle.transmission || 'Tự động'}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <FaGasPump className="mx-auto text-gray-400 mb-1" />
                                    <span className="block text-sm font-medium text-gray-900">{vehicle.fuel || 'Xăng'}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <FaExclamationCircle className="mx-auto text-gray-400 mb-1" />
                                    <span className="block text-sm font-medium text-gray-900">{vehicle.vehicleTypeName}</span>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-bold mb-4">Mô tả</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {vehicle.description || 'Không có mô tả'}
                                </p>
                            </div>

                            {features.length > 0 && (
                                <div className="border-t mt-6 pt-6">
                                    <h3 className="text-lg font-bold mb-4">Tính năng</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3">
                                        {features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-gray-600">
                                                <FaCheck className="text-green-500 text-sm" />
                                                <span>{feature.trim()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold mb-6">Đánh giá ({vehicle.reviewCount || 0})</h3>
                            {vehicle.reviewCount > 0 ? (
                                <div className="text-center py-6 text-gray-500">
                                    <p>Xem đánh giá từ khách hàng</p>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    <p>Chưa có đánh giá nào</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-primary/10">
                            <div className="flex justify-between items-baseline mb-6">
                                <span className="text-3xl font-bold text-primary">{vehicle.pricePerDay?.toLocaleString()}₫</span>
                                <span className="text-gray-500 text-sm"> / ngày</span>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Chi nhánh nhận xe</label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select
                                            className="w-full border-gray-200 rounded-lg pl-10 focus:ring-primary focus:border-primary py-2.5 text-sm bg-gray-50"
                                            value={selectedLocation}
                                            onChange={(e) => setSelectedLocation(e.target.value)}
                                        >
                                            {allLocations.length > 0 ? (
                                                allLocations.map((location) => {
                                                    const unavailable = !availableLocationSet.has(location);
                                                    return (
                                                        <option key={location} value={location} disabled={unavailable}>
                                                            {unavailable ? `${location} (Unavailable)` : location}
                                                        </option>
                                                    );
                                                })
                                            ) : (
                                                <option value={vehicle.location || ''}>
                                                    {vehicle.location ? `${vehicle.location} (Unavailable)` : 'Chưa có chi nhánh'}
                                                </option>
                                            )}
                                        </select>
                                    </div>
                                    {!selectedLocationAvailable && allLocations.length > 0 && (
                                        <p className="text-xs text-red-500 mt-1">Chi nhánh đã chọn hiện unavailable</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nhận xe</label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="datetime-local"
                                            className="w-full border-gray-200 rounded-lg pl-10 focus:ring-primary focus:border-primary py-2.5 text-sm bg-gray-50"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Trả xe</label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="datetime-local"
                                            className="w-full border-gray-200 rounded-lg pl-10 focus:ring-primary focus:border-primary py-2.5 text-sm bg-gray-50"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-dashed my-4 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Đơn giá thuê</span>
                                    <span className="font-medium text-gray-900">{vehicle.pricePerDay?.toLocaleString()}₫ / ngày</span>
                                </div>
                                {calculateDays() > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Số ngày thuê</span>
                                        <span className="font-medium text-gray-900">{calculateDays()} ngày</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí dịch vụ</span>
                                    <span className="font-medium text-gray-900">0₫</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Bảo hiểm</span>
                                    <span className="font-medium text-gray-900">Đã bao gồm</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t font-bold text-lg text-gray-900">
                                    <span>Tổng cộng</span>
                                    <span>{calculateTotal().toLocaleString()}₫</span>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={!selectedLocationAvailable}
                                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/30 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                ĐẶT XE NGAY
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-4">
                                Bạn sẽ chưa bị trừ tiền cho đến khi chủ xe đồng ý.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetail;
