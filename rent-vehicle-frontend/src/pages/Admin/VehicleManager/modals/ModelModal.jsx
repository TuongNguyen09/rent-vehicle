import { useState } from 'react';
import { FaTimes, FaImage, FaSpinner } from 'react-icons/fa';

const ModelModal = ({ 
    show, 
    onClose, 
    isEditing, 
    modelFormData, 
    setModelFormData, 
    vehicleTypes, 
    submitting, 
    onSubmit,
    allImages
}) => {
    const [featureInput, setFeatureInput] = useState('');

    const handleAddFeature = () => {
        if (featureInput.trim() && !modelFormData.features.includes(featureInput.trim())) {
            setModelFormData({
                ...modelFormData,
                features: [...modelFormData.features, featureInput.trim()]
            });
            setFeatureInput('');
        }
    };

    const handleRemoveFeature = (index) => {
        setModelFormData({
            ...modelFormData,
            features: modelFormData.features.filter((_, i) => i !== index)
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert('File quá lớn (tối đa 5MB)');
                return;
            }

            validFiles.push(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                if (!modelFormData.imagePreviews.includes(base64)) {
                    setModelFormData(prev => ({
                        ...prev,
                        imagePreviews: [...prev.imagePreviews, base64]
                    }));
                }
            };
            reader.readAsDataURL(file);
        });

        if (validFiles.length > 0) {
            setModelFormData(prev => ({
                ...prev,
                imageFiles: [...prev.imageFiles, ...validFiles]
            }));
        }

        e.target.value = '';
    };

    const handleRemoveExistingImage = (index) => {
        setModelFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleRemoveNewImage = (index) => {
        setModelFormData(prev => ({
            ...prev,
            imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
            imageFiles: prev.imageFiles.filter((_, i) => i !== index)
        }));
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditing ? 'Chỉnh sửa dòng xe' : 'Thêm dòng xe mới'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={onSubmit} className="p-6 space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên xe *</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary"
                                placeholder="VD: Camry 2024"
                                value={modelFormData.name}
                                onChange={(e) => setModelFormData({...modelFormData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hãng xe *</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary"
                                placeholder="VD: Toyota"
                                value={modelFormData.brand}
                                onChange={(e) => setModelFormData({...modelFormData, brand: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại xe *</label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary bg-white"
                                value={modelFormData.vehicleTypeId}
                                onChange={(e) => setModelFormData({...modelFormData, vehicleTypeId: e.target.value})}
                                required
                            >
                                <option value="">-- Chọn loại xe --</option>
                                {vehicleTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá thuê/ngày (VNĐ) *</label>
                            <input 
                                type="number" 
                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary"
                                placeholder="VD: 1000000"
                                value={modelFormData.pricePerDay}
                                onChange={(e) => setModelFormData({...modelFormData, pricePerDay: e.target.value})}
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ ngồi</label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary bg-white"
                                value={modelFormData.seats}
                                onChange={(e) => setModelFormData({...modelFormData, seats: e.target.value})}
                            >
                                {[2, 4, 5, 7, 9, 16].map(num => (
                                    <option key={num} value={num}>{num} chỗ</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nhiên liệu</label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary bg-white"
                                value={modelFormData.fuel}
                                onChange={(e) => setModelFormData({...modelFormData, fuel: e.target.value})}
                            >
                                <option value="Xăng">Xăng</option>
                                <option value="Dầu">Dầu</option>
                                <option value="Điện">Điện</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hộp số</label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary bg-white"
                                value={modelFormData.transmission}
                                onChange={(e) => setModelFormData({...modelFormData, transmission: e.target.value})}
                            >
                                <option value="Tự động">Tự động</option>
                                <option value="Số sàn">Số sàn</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary resize-none"
                            rows="3"
                            placeholder="Mô tả về xe..."
                            value={modelFormData.description}
                            onChange={(e) => setModelFormData({...modelFormData, description: e.target.value})}
                        />
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tính năng</label>
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="text" 
                                className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary"
                                placeholder="VD: Camera lùi, GPS, Bluetooth..."
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                            />
                            <button 
                                type="button"
                                onClick={handleAddFeature}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Thêm
                            </button>
                        </div>
                        {modelFormData.features.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {modelFormData.features.map((feature, index) => (
                                    <span 
                                        key={index}
                                        className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                                    >
                                        {feature}
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveFeature(index)}
                                            className="hover:text-red-500"
                                        >
                                            <FaTimes className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh xe</label>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer relative bg-gray-50"
                             onClick={() => document.getElementById('modelFileInput').click()}
                        >
                            <input 
                                type="file" 
                                id="modelFileInput"
                                multiple 
                                accept="image/*"
                                className="hidden" 
                                onChange={handleImageUpload}
                            />
                            <div className="space-y-2">
                                <div className="mx-auto w-12 h-12 text-gray-400">
                                    <FaImage className="w-full h-full" />
                                </div>
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <span className="relative cursor-pointer font-medium text-primary hover:text-orange-600">
                                        Tải ảnh lên
                                    </span>
                                    <p className="pl-1">hoặc kéo thả vào đây</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG tối đa 5MB mỗi ảnh</p>
                            </div>
                        </div>

                        {/* Image Previews */}
                        {allImages.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {modelFormData.images.map((img, index) => (
                                    <div key={`existing-${index}`} className="relative group aspect-video border rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                                        <img src={img} alt={`Image ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveExistingImage(index); }}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            title="Xóa ảnh"
                                        >
                                            <FaTimes className="w-3 h-3" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {index === 0 && modelFormData.imagePreviews.length === 0 ? 'Ảnh chính' : `Ảnh ${index + 1}`}
                                        </div>
                                    </div>
                                ))}
                                
                                {modelFormData.imagePreviews.map((img, index) => (
                                    <div key={`new-${index}`} className="relative group aspect-video border-2 border-dashed border-green-400 rounded-lg overflow-hidden bg-green-50 shadow-sm">
                                        <img src={img} alt={`New ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveNewImage(index); }}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            title="Xóa ảnh"
                                        >
                                            <FaTimes className="w-3 h-3" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-[10px] px-2 py-1">
                                            Ảnh mới {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            {isEditing ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModelModal;
