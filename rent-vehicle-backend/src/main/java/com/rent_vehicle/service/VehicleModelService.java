package com.rent_vehicle.service;

import com.rent_vehicle.dto.request.CreateVehicleModelRequest;
import com.rent_vehicle.dto.response.VehicleModelResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.model.Booking;
import com.rent_vehicle.model.Vehicle;
import com.rent_vehicle.model.VehicleModel;
import com.rent_vehicle.model.VehicleType;
import com.rent_vehicle.model.VehicleImage;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.repository.BookingRepository;
import com.rent_vehicle.repository.ReviewRepository;
import com.rent_vehicle.repository.VehicleModelRepository;
import com.rent_vehicle.repository.VehicleTypeRepository;
import com.rent_vehicle.repository.VehicleImageRepository;
import com.rent_vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleModelService {
    private final VehicleModelRepository vehicleModelRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final VehicleImageRepository vehicleImageRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;

    public VehicleModelResponse create(CreateVehicleModelRequest request) {
        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_TYPE_NOT_FOUND));

        // Convert features list to comma-separated string
        String featuresStr = request.getFeatures() != null 
                ? String.join(",", request.getFeatures()) 
                : null;

        VehicleModel vehicleModel = VehicleModel.builder()
                .name(request.getName())
                .vehicleType(vehicleType)
                .brand(request.getBrand())
                .pricePerDay(request.getPricePerDay())
                .description(request.getDescription())
                .seats(request.getSeats() != null ? request.getSeats() : 5)
                .transmission(request.getTransmission() != null ? request.getTransmission() : "Tự động")
                .fuel(request.getFuel() != null ? request.getFuel() : "Xăng")
                .features(featuresStr)
                .build();

        VehicleModel saved = vehicleModelRepository.save(vehicleModel);

        // Save images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            request.getImageUrls().forEach(imageUrl -> {
                VehicleImage image = VehicleImage.builder()
                        .vehicleModel(saved)
                        .imageUrl(imageUrl)
                        .build();
                vehicleImageRepository.save(image);
            });
        }

        return toResponse(saved);
    }

    public VehicleModelResponse update(Long id, CreateVehicleModelRequest request) {
        VehicleModel vehicleModel = vehicleModelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));

        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_TYPE_NOT_FOUND));

        // Convert features list to comma-separated string
        String featuresStr = request.getFeatures() != null 
                ? String.join(",", request.getFeatures()) 
                : null;

        vehicleModel.setName(request.getName());
        vehicleModel.setVehicleType(vehicleType);
        vehicleModel.setBrand(request.getBrand());
        vehicleModel.setPricePerDay(request.getPricePerDay());
        vehicleModel.setDescription(request.getDescription());
        if (request.getSeats() != null) vehicleModel.setSeats(request.getSeats());
        if (request.getTransmission() != null) vehicleModel.setTransmission(request.getTransmission());
        if (request.getFuel() != null) vehicleModel.setFuel(request.getFuel());
        if (featuresStr != null) vehicleModel.setFeatures(featuresStr);

        VehicleModel updated = vehicleModelRepository.save(vehicleModel);

        // Update images if provided (delete old ones and create new ones)
        if (request.getImageUrls() != null) {
            vehicleImageRepository.deleteByVehicleModelId(id);
            
            if (!request.getImageUrls().isEmpty()) {
                request.getImageUrls().forEach(imageUrl -> {
                    VehicleImage image = VehicleImage.builder()
                            .vehicleModel(updated)
                            .imageUrl(imageUrl)
                            .build();
                    vehicleImageRepository.save(image);
                });
            }
        }

        return toResponse(updated);
    }

    public void delete(Long id) {
        VehicleModel vehicleModel = vehicleModelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));
        vehicleModelRepository.delete(vehicleModel);
    }

    @Transactional(readOnly = true)
    public VehicleModelResponse getById(Long id) {
        VehicleModel vehicleModel = vehicleModelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));
        return toResponse(vehicleModel);
    }

    @Transactional(readOnly = true)
    public List<VehicleModelResponse> getAll() {
        return vehicleModelRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleModelResponse> getAllOrSearch(String keyword, Long vehicleTypeId, String brand, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice) {
        List<VehicleModel> models = vehicleModelRepository.findAll();
        
        // Apply filters
        if (keyword != null && !keyword.trim().isEmpty()) {
            models = models.stream()
                    .filter(m -> m.getName().toLowerCase().contains(keyword.toLowerCase()) || 
                                 m.getBrand().toLowerCase().contains(keyword.toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        if (vehicleTypeId != null) {
            models = models.stream()
                    .filter(m -> m.getVehicleType().getId().equals(vehicleTypeId))
                    .collect(Collectors.toList());
        }
        
        if (brand != null && !brand.trim().isEmpty()) {
            models = models.stream()
                    .filter(m -> m.getBrand().equalsIgnoreCase(brand))
                    .collect(Collectors.toList());
        }
        
        if (minPrice != null) {
            models = models.stream()
                    .filter(m -> m.getPricePerDay().compareTo(minPrice) >= 0)
                    .collect(Collectors.toList());
        }
        
        if (maxPrice != null) {
            models = models.stream()
                    .filter(m -> m.getPricePerDay().compareTo(maxPrice) <= 0)
                    .collect(Collectors.toList());
        }
        
        return models.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<VehicleModelResponse> getAllOrSearchPaginated(String keyword, Long vehicleTypeId, String brand, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<VehicleModel> pageData;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            pageData = vehicleModelRepository.findByNameLikeIgnoreCaseOrBrandLikeIgnoreCase(keyword, keyword, pageable);
        } else {
            pageData = vehicleModelRepository.findAll(pageable);
        }
        
        List<VehicleModel> filteredModels = pageData.getContent().stream()
                .filter(m -> vehicleTypeId == null || m.getVehicleType().getId().equals(vehicleTypeId))
                .filter(m -> brand == null || brand.trim().isEmpty() || m.getBrand().equalsIgnoreCase(brand))
                .filter(m -> minPrice == null || m.getPricePerDay().compareTo(minPrice) >= 0)
                .filter(m -> maxPrice == null || m.getPricePerDay().compareTo(maxPrice) <= 0)
                .collect(Collectors.toList());
        
        List<VehicleModelResponse> content = filteredModels.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<VehicleModelResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages((int) Math.ceil((double) filteredModels.size() / size))
                .totalElements((long) filteredModels.size())
                .data(content)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<VehicleModelResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<VehicleModel> pageData = vehicleModelRepository.findAll(pageable);
        
        List<VehicleModelResponse> content = pageData.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<VehicleModelResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(content)
                .build();
    }

    @Transactional(readOnly = true)
    public List<VehicleModelResponse> getByVehicleType(Long vehicleTypeId) {
        vehicleTypeRepository.findById(vehicleTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_TYPE_NOT_FOUND));

        return vehicleModelRepository.findByVehicleTypeId(vehicleTypeId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleModelResponse> search(String keyword) {
        return vehicleModelRepository.searchByNameOrBrand(keyword).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private VehicleModelResponse toResponse(VehicleModel vehicleModel) {
        Double averageRating = reviewRepository.getAverageRatingByVehicleModelId(vehicleModel.getId());
        Long reviewCount = reviewRepository.countByBookingVehicleModelId(vehicleModel.getId());
        Long totalTrips = bookingRepository.countByVehicleModelIdAndStatus(
                vehicleModel.getId(), 
                Booking.BookingStatus.completed
        );
        
        // Get images
        List<String> images = vehicleImageRepository.findByVehicleModelId(vehicleModel.getId())
                .stream()
                .map(VehicleImage::getImageUrl)
                .collect(Collectors.toList());
        
        // Convert features string to list
        List<String> features = vehicleModel.getFeatures() != null && !vehicleModel.getFeatures().isEmpty()
                ? Arrays.asList(vehicleModel.getFeatures().split(","))
                : Collections.emptyList();

        return VehicleModelResponse.builder()
                .id(vehicleModel.getId())
                .name(vehicleModel.getName())
                .vehicleTypeId(vehicleModel.getVehicleType().getId())
                .vehicleTypeName(vehicleModel.getVehicleType().getName())
                .brand(vehicleModel.getBrand())
                .pricePerDay(vehicleModel.getPricePerDay())
                .description(vehicleModel.getDescription())
                .seats(vehicleModel.getSeats())
                .transmission(vehicleModel.getTransmission())
                .fuel(vehicleModel.getFuel())
                .location(resolveModelLocation(vehicleModel.getId()))
                .features(features)
                .images(images)
                .createdAt(vehicleModel.getCreatedAt())
                .averageRating(averageRating)
                .totalTrips(totalTrips)
                .reviewCount(reviewCount)
                .build();
    }

    private String resolveModelLocation(Long vehicleModelId) {
        return vehicleRepository.findByVehicleModelId(vehicleModelId).stream()
                .map(Vehicle::getLocation)
                .filter(location -> location != null && !location.isBlank())
                .findFirst()
                .orElse(null);
    }
}
