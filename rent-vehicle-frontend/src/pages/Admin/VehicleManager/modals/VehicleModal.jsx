import { FaTimes, FaSpinner } from 'react-icons/fa';

const VehicleModal = ({ show, onClose, selectedModel, vehicleFormData, setVehicleFormData, submitting, onSubmit }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Thêm xe mới</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={onSubmit} className="p-6 space-y-5">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Dòng xe</p>
                        <p className="font-bold text-gray-800">{selectedModel?.brand} {selectedModel?.name}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Biển số xe *</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary uppercase font-mono text-lg"
                            placeholder="VD: 51K-123.45"
                            value={vehicleFormData.licensePlate}
                            onChange={(e) => setVehicleFormData({...vehicleFormData, licensePlate: e.target.value.toUpperCase()})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm xe *</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary"
                            placeholder="VD: TP. Hồ Chí Minh"
                            value={vehicleFormData.location || ''}
                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, location: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={submitting}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 shadow-lg shadow-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting && <FaSpinner className="animate-spin" />}
                            Thêm xe
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleModal;
