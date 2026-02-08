import { useState, useEffect } from 'react';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { 
    getVehicleModels, 
    createVehicleModel, 
    updateVehicleModel, 
    deleteVehicleModel,
    getVehicleTypes,
    getVehicles,
    createVehicle,
    updateVehicleStatus,
    uploadVehicleImages
} from '../../../services/vehicleService';
import VehicleModelsTable from './VehicleModelsTable';
import VehiclesPanel from './VehiclesPanel';
import ModelModal from './modals/ModelModal';
import VehicleModal from './modals/VehicleModal';

const VehicleManager = () => {
    // Data State
    const [vehicleModels, setVehicleModels] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Modal State
    const [showModelModal, setShowModelModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showVehiclesPanel, setShowVehiclesPanel] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [vehicleSearchTerm, setVehicleSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [vehicleCurrentPage, setVehicleCurrentPage] = useState(1);    const [totalModelPages, setTotalModelPages] = useState(1);    const itemsPerPage = 5;

    // Model Form State
    const [modelFormData, setModelFormData] = useState({
        name: '',
        brand: '',
        vehicleTypeId: '',
        pricePerDay: '',
        description: '',
        seats: 4,
        fuel: 'Xăng',
        transmission: 'Tự động',
        features: [],
        images: [],
        imageFiles: [],
        imagePreviews: []
    });

    // Vehicle Form State
    const [vehicleFormData, setVehicleFormData] = useState({
        licensePlate: '',
        location: '',
        status: 'available'
    });

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    // Refetch when search term or page changes for vehicle models
    useEffect(() => {
        if (!showVehiclesPanel) {
            fetchModelsOnly();
        }
    }, [searchTerm, currentPage]);

    // Refetch vehicles only when search term changes
    useEffect(() => {
        if (showVehiclesPanel && vehicleSearchTerm) {
            fetchVehiclesOnly();
        }
    }, [vehicleSearchTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [modelsRes, vehiclesRes, typesRes] = await Promise.all([
                getVehicleModels({ keyword: searchTerm || null, page: currentPage, size: itemsPerPage }),
                getVehicles({ keyword: vehicleSearchTerm || null, status: filterStatus }),
                getVehicleTypes()
            ]);
            
            // Handle paginated response for models
            if (modelsRes.result && modelsRes.result.data) {
                setVehicleModels(modelsRes.result.data || []);
                setTotalModelPages(modelsRes.result.totalPages || 1);
            } else {
                setVehicleModels(modelsRes.result || []);
                setTotalModelPages(1);
            }
            if (vehiclesRes.result && vehiclesRes.result.data) {
                setVehicles(vehiclesRes.result.data || []);
            } else {
                setVehicles(vehiclesRes.result || []);
            }
            setVehicleTypes(typesRes.result || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch models only (without triggering page loading state)
    const fetchModelsOnly = async () => {
        try {
            const modelsRes = await getVehicleModels({ keyword: searchTerm || null, page: currentPage, size: itemsPerPage });
            
            // Handle paginated response for models
            if (modelsRes.result && modelsRes.result.data) {
                setVehicleModels(modelsRes.result.data || []);
                setTotalModelPages(modelsRes.result.totalPages || 1);
            } else {
                setVehicleModels(modelsRes.result || []);
                setTotalModelPages(1);
            }
        } catch (err) {
            console.error('Error fetching models:', err);
        }
    };

    // Fetch vehicles only (without triggering page loading state)
    const fetchVehiclesOnly = async () => {
        try {
            const vehiclesRes = await getVehicles({ keyword: vehicleSearchTerm || null, status: filterStatus });
            if (vehiclesRes.result && vehiclesRes.result.data) {
                setVehicles(vehiclesRes.result.data || []);
            } else {
                setVehicles(vehiclesRes.result || []);
            }
        } catch (err) {
            console.error('Error fetching vehicles:', err);
        }
    };

    // Get vehicle count for each model
    const getVehicleCountForModel = (modelId) => {
        return vehicles.filter(v => v.vehicleModelId === modelId && v.status !== 'deleted').length;
    };

    // Handlers for Model Modal
    const handleOpenModelModal = (model = null) => {
        if (model) {
            setIsEditing(true);
            setCurrentItem(model);
            setModelFormData({
                name: model.name || '',
                brand: model.brand || '',
                vehicleTypeId: model.vehicleTypeId || '',
                pricePerDay: model.pricePerDay || '',
                description: model.description || '',
                seats: model.seats || 4,
                fuel: model.fuel || 'Xăng',
                transmission: model.transmission || 'Tự động',
                features: model.features || [],
                images: model.images || [],
                imageFiles: [],
                imagePreviews: []
            });
        } else {
            setIsEditing(false);
            setCurrentItem(null);
            setModelFormData({
                name: '',
                brand: '',
                vehicleTypeId: vehicleTypes.length > 0 ? vehicleTypes[0].id : '',
                pricePerDay: '',
                description: '',
                seats: 4,
                fuel: 'Xăng',
                transmission: 'Tự động',
                features: [],
                images: [],
                imageFiles: [],
                imagePreviews: []
            });
        }
        setShowModelModal(true);
    };

    // Handler to view vehicles of a model
    const handleViewVehicles = (model) => {
        setSelectedModel(model);
        setVehicleCurrentPage(1);
        setVehicleSearchTerm('');
        setFilterStatus('All');
        setShowVehiclesPanel(true);
    };

    // Handler to add vehicle to selected model
    const handleOpenVehicleModal = () => {
        setVehicleFormData({
            licensePlate: '',
            location: '',
            status: 'available'
        });
        setShowVehicleModal(true);
    };

    const handleDeleteVehicle = async (vehicleId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
        
        try {
            await updateVehicleStatus(vehicleId, 'deleted');
            await fetchData();
        } catch (err) {
            console.error('Error deleting vehicle:', err);
            alert('Không thể xóa xe. Vui lòng thử lại.');
        }
    };

    const handleDeleteModel = async (modelId) => {
        const vehicleCount = getVehicleCountForModel(modelId);
        if (vehicleCount > 0) {
            alert(`Không thể xóa dòng xe này vì còn ${vehicleCount} xe đang hoạt động!`);
            return;
        }
        if (!window.confirm('Bạn có chắc chắn muốn xóa dòng xe này?')) return;
        
        try {
            await deleteVehicleModel(modelId);
            await fetchData();
        } catch (err) {
            console.error('Error deleting model:', err);
            alert('Không thể xóa dòng xe. Vui lòng thử lại.');
        }
    };

    // Submit Model Form
    const handleSubmitModel = async (e) => {
        e.preventDefault();
        
        if (!modelFormData.name || !modelFormData.brand || !modelFormData.pricePerDay) {
            alert('Vui lòng điền đầy đủ các thông tin bắt buộc!');
            return;
        }
        if (!modelFormData.vehicleTypeId) {
            alert('Vui lòng chọn loại xe!');
            return;
        }
        
        try {
            setSubmitting(true);

            let imageUrls = modelFormData.images || [];

            if (isEditing && modelFormData.imageFiles.length > 0) {
                const uploadResponse = await uploadVehicleImages(modelFormData.imageFiles);
                const uploadedUrls = uploadResponse?.result || [];
                imageUrls = [...imageUrls, ...uploadedUrls];
            }

            const modelData = {
                name: modelFormData.name,
                brand: modelFormData.brand,
                vehicleTypeId: parseInt(modelFormData.vehicleTypeId),
                pricePerDay: parseFloat(modelFormData.pricePerDay),
                description: modelFormData.description,
                seats: parseInt(modelFormData.seats),
                fuel: modelFormData.fuel,
                transmission: modelFormData.transmission,
                features: modelFormData.features,
                imageUrls
            };
            
            if (isEditing) {
                await updateVehicleModel(currentItem.id, modelData);
            } else {
                await createVehicleModel(modelData, modelFormData.imageFiles);
            }
            
            setShowModelModal(false);
            await fetchData();
            
        } catch (err) {
            console.error('Error saving model:', err);
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    // Submit Vehicle Form
    const handleSubmitVehicle = async (e) => {
        e.preventDefault();
        
        if (!vehicleFormData.licensePlate) {
            alert('Vui lòng nhập biển số xe!');
            return;
        }

        if (!vehicleFormData.location?.trim()) {
            alert('Vui lòng nhập địa điểm của xe!');
            return;
        }
        
        try {
            setSubmitting(true);
            
            await createVehicle({
                vehicleModelId: selectedModel.id,
                licensePlate: vehicleFormData.licensePlate,
                location: vehicleFormData.location.trim()
            });
            
            setShowVehicleModal(false);
            await fetchData();
            
        } catch (err) {
            console.error('Error creating vehicle:', err);
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    // Models already filtered by backend, no need to filter again
    const filteredModels = vehicleModels;
    
    // Pagination for models (backend handles, frontend just displays)
    const currentModels = filteredModels;

    // Filtered vehicles for selected model
    const modelVehicles = selectedModel ? vehicles.filter(v => v.vehicleModelId === selectedModel.id && v.status !== 'deleted') : [];
    const filteredModelVehicles = modelVehicles.filter(v => {
        const matchesSearch = v.licensePlate?.toLowerCase().includes(vehicleSearchTerm.toLowerCase());
        return matchesSearch;
    });

    // Pagination for vehicles
    const indexOfLastVehicle = vehicleCurrentPage * itemsPerPage;
    const indexOfFirstVehicle = indexOfLastVehicle - itemsPerPage;
    const currentVehicles = filteredModelVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
    const totalVehiclePages = Math.ceil(filteredModelVehicles.length / itemsPerPage);

    // All images for preview (existing + new)
    const allImages = [...modelFormData.images, ...modelFormData.imagePreviews];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                    onClick={fetchData}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Vehicle Models Panel - Main View */}
            {!showVehiclesPanel ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý dòng xe</h1>
                        <button 
                            onClick={() => handleOpenModelModal()}
                            className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
                        >
                            <FaPlus /> Thêm dòng xe mới
                        </button>
                    </div>

                    <VehicleModelsTable
                        currentModels={currentModels}
                        totalModelPages={totalModelPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        onViewVehicles={handleViewVehicles}
                        onEdit={handleOpenModelModal}
                        onDelete={handleDeleteModel}
                        filteredModels={filteredModels}
                        vehicleModels={vehicleModels}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        getVehicleCountForModel={getVehicleCountForModel}
                    />
                </>
            ) : (
                /* Vehicles Panel - View vehicles of selected model */
                <VehiclesPanel
                    selectedModel={selectedModel}
                    currentVehicles={currentVehicles}
                    vehicleCurrentPage={vehicleCurrentPage}
                    setVehicleCurrentPage={setVehicleCurrentPage}
                    totalVehiclePages={totalVehiclePages}
                    filteredModelVehicles={filteredModelVehicles}
                    vehicleSearchTerm={vehicleSearchTerm}
                    setVehicleSearchTerm={setVehicleSearchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    indexOfFirstVehicle={indexOfFirstVehicle}
                    onBack={() => setShowVehiclesPanel(false)}
                    onAddVehicle={handleOpenVehicleModal}
                    onDeleteVehicle={handleDeleteVehicle}
                    onUpdateStatus={updateVehicleStatus}
                    modelVehicles={modelVehicles}
                    submitting={submitting}
                    fetchData={fetchData}
                    fetchVehiclesOnly={fetchVehiclesOnly}
                />
            )}

            {/* Modals */}
            <ModelModal
                show={showModelModal}
                onClose={() => setShowModelModal(false)}
                isEditing={isEditing}
                modelFormData={modelFormData}
                setModelFormData={setModelFormData}
                vehicleTypes={vehicleTypes}
                submitting={submitting}
                onSubmit={handleSubmitModel}
                allImages={allImages}
            />

            <VehicleModal
                show={showVehicleModal}
                onClose={() => setShowVehicleModal(false)}
                selectedModel={selectedModel}
                vehicleFormData={vehicleFormData}
                setVehicleFormData={setVehicleFormData}
                submitting={submitting}
                onSubmit={handleSubmitVehicle}
            /> 
        </div>
    );
};

export default VehicleManager;
