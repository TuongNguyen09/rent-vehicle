import { FaImage, FaEdit, FaTrash, FaCar, FaSearch } from 'react-icons/fa';

const VehicleModelsTable = ({
    currentModels,
    totalModelPages,
    currentPage,
    setCurrentPage,
    onViewVehicles,
    onEdit,
    onDelete,
    filteredModels,
    vehicleModels,
    searchTerm,
    setSearchTerm,
    getVehicleCountForModel
}) => {
    return (
        <>
            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="relative w-full md:w-96">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên hoặc hãng xe..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                                <th className="p-4 font-bold">Hình ảnh</th>
                                <th className="p-4 font-bold">Tên dòng xe</th>
                                <th className="p-4 font-bold">Thông số</th>
                                <th className="p-4 font-bold">Giá thuê (ngày)</th>
                                <th className="p-4 font-bold text-center">Số xe</th>
                                <th className="p-4 font-bold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentModels.map((model) => (
                                <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        {model.images?.[0] ? (
                                            <img src={model.images[0]} alt="" className="w-24 h-16 object-cover rounded-md border" />
                                        ) : (
                                            <div className="w-24 h-16 bg-gray-100 rounded-md border flex items-center justify-center">
                                                <FaImage className="text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{model.name}</div>
                                        <div className="text-sm text-gray-500">{model.brand}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-600">
                                            {model.seats} chỗ • {model.transmission} • {model.fuel}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">{model.vehicleTypeName || 'N/A'}</div>
                                    </td>
                                    <td className="p-4 font-bold text-primary">
                                        {Number(model.pricePerDay).toLocaleString()}₫
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => onViewVehicles(model)}
                                            className="inline-flex items-center justify-center bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors cursor-pointer"
                                            title="Xem danh sách xe"
                                        >
                                            <FaCar className="mr-1" /> {getVehicleCountForModel(model.id)}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => onEdit(model)}
                                            className="text-blue-600 hover:text-blue-800 mx-1 p-2 hover:bg-blue-50 rounded-full transition-colors" 
                                            title="Sửa"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(model.id)}
                                            className="text-red-500 hover:text-red-700 mx-1 p-2 hover:bg-red-50 rounded-full transition-colors" 
                                            title="Xóa"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredModels.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        {vehicleModels.length === 0 ? 'Chưa có dòng xe nào trong hệ thống.' : 'Không tìm thấy dòng xe phù hợp.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalModelPages > 1 && (
                    <div className="flex justify-center items-center gap-2 py-4 border-t">
                        <button 
                            onClick={() => setCurrentPage(currentPage - 1)} 
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                            &lt;
                        </button>
                        {[...Array(totalModelPages)].map((_, i) => (
                            <button 
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-primary text-white' : 'border hover:bg-gray-100'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            onClick={() => setCurrentPage(currentPage + 1)} 
                            disabled={currentPage === totalModelPages}
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

export default VehicleModelsTable;
