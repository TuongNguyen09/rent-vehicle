import api from './api';

// ============ VEHICLE TYPE APIs ============

/**
 * Get all vehicle types
 */
export const getVehicleTypes = async () => {
    const response = await api.get('/vehicle-types');
    return response.data;
};

/**
 * Create vehicle type
 */
export const createVehicleType = async (data) => {
    const response = await api.post('/vehicle-types', data);
    return response.data;
};

/**
 * Update vehicle type
 */
export const updateVehicleType = async (id, data) => {
    const response = await api.put(`/vehicle-types/${id}`, data);
    return response.data;
};

/**
 * Delete vehicle type
 */
export const deleteVehicleType = async (id) => {
    const response = await api.delete(`/vehicle-types/${id}`);
    return response.data;
};

// ============ VEHICLE MODEL APIs ============

/**
 * Get vehicle models with optional pagination, search, and filters
 * @param {Object} params - Query parameters
 * @param {string} params.keyword - Search by name or brand
 * @param {number} params.vehicleTypeId - Filter by vehicle type
 * @param {string} params.brand - Filter by brand
 * @param {number} params.minPrice - Filter by minimum price
 * @param {number} params.maxPrice - Filter by maximum price
 * @param {number} params.page - Page number (1-indexed, optional for no pagination)
 * @param {number} params.size - Page size (optional for no pagination)
 */
export const getVehicleModels = async (params = {}) => {
    const queryParams = {};
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.vehicleTypeId) queryParams.vehicleTypeId = params.vehicleTypeId;
    if (params.brand) queryParams.brand = params.brand;
    if (params.minPrice) queryParams.minPrice = params.minPrice;
    if (params.maxPrice) queryParams.maxPrice = params.maxPrice;
    if (params.page) queryParams.page = params.page;
    if (params.size) queryParams.size = params.size;
    
    const response = await api.get('/vehicle-models', { params: queryParams });
    return response.data;
};

/**
 * Get vehicle model by ID
 */
export const getVehicleModelById = async (id) => {
    const response = await api.get(`/vehicle-models/${id}`);
    return response.data;
};

/**
 * Create vehicle model with images
 */
export const createVehicleModel = async (data, images = []) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    
    if (images && images.length > 0) {
        images.forEach((image) => {
            formData.append('images', image);
        });
    }
    
    const response = await api.post('/vehicle-models', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

/**
 * Update vehicle model
 */
export const updateVehicleModel = async (id, data) => {
    const response = await api.put(`/vehicle-models/${id}`, data);
    return response.data;
};

/**
 * Delete vehicle model
 */
export const deleteVehicleModel = async (id) => {
    const response = await api.delete(`/vehicle-models/${id}`);
    return response.data;
};

/**
 * Get all brands (unique)
 */
export const getBrands = async () => {
    const response = await api.get('/vehicle-models/brands');
    return response.data;
};

// ============ VEHICLE APIs ============

/**
 * Get all vehicles with optional pagination, search, and filtering
 * @param {Object} params - Query parameters
 * @param {string} params.keyword - Search by license plate
 * @param {string} params.status - Filter by status (available, rented, maintenance)
 * @param {number} params.page - Page number (1-indexed, optional for no pagination)
 * @param {number} params.size - Page size (optional for no pagination)
 */
export const getVehicles = async (params = {}) => {
    const queryParams = {};
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.status && params.status !== 'All') queryParams.status = params.status;
    if (params.page) queryParams.page = params.page;
    if (params.size) queryParams.size = params.size;
    
    const response = await api.get('/vehicles', { params: queryParams });
    return response.data;
};

/**
 * Create a new vehicle
 */
export const createVehicle = async (data) => {
    const response = await api.post('/vehicles', data);
    return response.data;
};

/**
 * Update vehicle status
 */
export const updateVehicleStatus = async (id, status) => {
    const response = await api.put(`/vehicles/${id}/status`, null, {
        params: { status }
    });
    return response.data;
};

/**
 * Get available vehicles for a model
 */
export const getAvailableVehicles = async (modelId) => {
    const response = await api.get(`/vehicles/model/${modelId}/available`);
    return response.data;
};

/**
 * Get all non-deleted vehicles for a model
 */
export const getVehiclesByModel = async (modelId) => {
    const response = await api.get(`/vehicles/model/${modelId}`);
    return response.data;
};

// ============ FILE UPLOAD APIs ============

/**
 * Upload single image for vehicle
 */
export const uploadVehicleImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/vehicle-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

/**
 * Upload multiple images for vehicle
 */
export const uploadVehicleImages = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });
    
    const response = await api.post('/upload/vehicle-images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export default {
    // Vehicle Types
    getVehicleTypes,
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,
    
    // Vehicle Models
    getVehicleModels,
    getVehicleModelById,
    createVehicleModel,
    updateVehicleModel,
    deleteVehicleModel,
    getBrands,
    
    // Vehicles
    getVehicles,
    createVehicle,
    updateVehicleStatus,
    getAvailableVehicles,
    getVehiclesByModel,
    
    // File Upload
    uploadVehicleImage,
    uploadVehicleImages
};
