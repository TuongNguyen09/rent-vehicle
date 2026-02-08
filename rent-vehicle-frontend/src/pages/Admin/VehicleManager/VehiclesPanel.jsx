import { FaImage, FaTrash, FaArrowLeft, FaSearch, FaFilter, FaEye } from 'react-icons/fa';

const getStatusBadge = (status) => {
    switch(status) {
        case 'available': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Sẵn sàng</span>;
        case 'rented': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">Đang thuê</span>;
        case 'maintenance': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">Bảo trì</span>;
        default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold">{status}</span>;
    }
};

const VehiclesPanel = ({
    selectedModel,
    currentVehicles,
    vehicleCurrentPage,
    setVehicleCurrentPage,
    totalVehiclePages,
    filteredModelVehicles,
    vehicleSearchTerm,
    setVehicleSearchTerm,
    filterStatus,
    setFilterStatus,
    indexOfFirstVehicle,
    onBack,
    onAddVehicle,
    onDeleteVehicle,
    onUpdateStatus,
    submitting,
    fetchData,
    fetchVehiclesOnly
}) => {
    const handleStatusChange = async (vehicleId, newStatus) => {
        try {
            await onUpdateStatus(vehicleId, newStatus);
            await fetchData();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Quay lại"
                    >
                        <FaArrowLeft className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Danh sách xe</h1>
                        <p className="text-sm text-gray-500">
                            {selectedModel?.brand} {selectedModel?.name} - {Number(selectedModel?.pricePerDay).toLocaleString()}₫/ngày
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onAddVehicle}
                    className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
                >
                    <span>+</span> Thêm xe
                </button>
            </div>

            {/* Model Info Card */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4 items-center">
                {selectedModel?.images?.[0] ? (
                    <img src={selectedModel.images[0]} alt="" className="w-32 h-20 object-cover rounded-lg border" />
                ) : (
                    <div className="w-32 h-20 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <FaImage className="text-gray-400 text-2xl" />
                    </div>
                )}
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{selectedModel?.brand} {selectedModel?.name}</h3>
                    <p className="text-sm text-gray-500">
                        {selectedModel?.seats} chỗ • {selectedModel?.transmission} • {selectedModel?.fuel}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{Number(selectedModel?.pricePerDay).toLocaleString()}₫</div>
                    <div className="text-sm text-gray-500">mỗi ngày</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo biển số..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                        value={vehicleSearchTerm}
                        onChange={(e) => { setVehicleSearchTerm(e.target.value); setVehicleCurrentPage(1); }}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <FaFilter className="text-gray-400" />
                    <select 
                        className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-primary"
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setVehicleCurrentPage(1); fetchVehiclesOnly(); }}
                    >
                        <option value="All">Tất cả trạng thái</option>
                        <option value="available">Sẵn sàng</option>
                        <option value="rented">Đang thuê</option>
                        <option value="maintenance">Bảo trì</option>
                    </select>
                </div>
            </div>

            {/* Vehicles Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                                <th className="p-4 font-bold">#</th>
                                <th className="p-4 font-bold">Biển số</th>
                                <th className="p-4 font-bold">Địa điểm</th>
                                <th className="p-4 font-bold">Trạng thái</th>
                                <th className="p-4 font-bold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentVehicles.map((vehicle, index) => (
                                <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500">
                                        {indexOfFirstVehicle + index + 1}
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded uppercase">
                                            {vehicle.licensePlate}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-gray-700">
                                            {vehicle.location || '---'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={vehicle.status}
                                            onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-bold border-0 outline-none cursor-pointer ${
                                                vehicle.status === 'available' ? 'bg-green-100 text-green-700' :
                                                vehicle.status === 'rented' ? 'bg-blue-100 text-blue-700' :
                                                vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            <option value="available">Sẵn sàng</option>
                                            <option value="rented">Đang thuê</option>
                                            <option value="maintenance">Bảo trì</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => {}}
                                            className="text-blue-600 hover:text-blue-800 mx-1 p-2 hover:bg-blue-50 rounded-full transition-colors" 
                                            title="Xem chi tiết"
                                            disabled={submitting}
                                        >
                                            <FaEye />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteVehicle(vehicle.id)}
                                            className="text-red-500 hover:text-red-700 mx-1 p-2 hover:bg-red-50 rounded-full transition-colors" 
                                            title="Xóa"
                                            disabled={submitting}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredModelVehicles.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        Chưa có xe nào trong dòng xe này.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {totalVehiclePages > 1 && (
                    <div className="flex justify-center items-center gap-2 py-4 border-t">
                        <button 
                            onClick={() => setVehicleCurrentPage(vehicleCurrentPage - 1)} 
                            disabled={vehicleCurrentPage === 1}
                            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                            &lt;
                        </button>
                        {[...Array(totalVehiclePages)].map((_, i) => (
                            <button 
                                key={i + 1}
                                onClick={() => setVehicleCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded ${vehicleCurrentPage === i + 1 ? 'bg-primary text-white' : 'border hover:bg-gray-100'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            onClick={() => setVehicleCurrentPage(vehicleCurrentPage + 1)} 
                            disabled={vehicleCurrentPage === totalVehiclePages}
                            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default VehiclesPanel;
