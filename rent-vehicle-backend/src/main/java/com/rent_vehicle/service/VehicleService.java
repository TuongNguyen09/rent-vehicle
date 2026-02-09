package com.rent_vehicle.service;

import com.rent_vehicle.dto.request.CreateVehicleRequest;
import com.rent_vehicle.dto.response.VehicleResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.model.Vehicle;
import com.rent_vehicle.model.VehicleModel;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.repository.VehicleModelRepository;
import com.rent_vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final VehicleModelRepository vehicleModelRepository;

    @PreAuthorize("hasAuthority('ADMIN')")
    public VehicleResponse create(CreateVehicleRequest request) {
        VehicleModel vehicleModel = vehicleModelRepository.findById(request.getVehicleModelId())
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));

        String normalizedLocation = normalizeLocation(request.getLocation());
        if (normalizedLocation == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        // Check duplicate license plate
        if (vehicleRepository.findByLicensePlate(request.getLicensePlate()).isPresent()) {
            throw new AppException(ErrorCode.INVALID_VEHICLE_LICENSE);
        }

        Vehicle vehicle = Vehicle.builder()
                .vehicleModel(vehicleModel)
                .licensePlate(request.getLicensePlate())
                .location(normalizedLocation)
                .status(Vehicle.VehicleStatus.available)
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        return toResponse(saved);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    public VehicleResponse updateStatus(Long id, String status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_NOT_FOUND));

        Vehicle.VehicleStatus vehicleStatus = Vehicle.VehicleStatus.valueOf(status);
        vehicle.setStatus(vehicleStatus);
        return toResponse(vehicleRepository.save(vehicle));
    }

    @Transactional(readOnly = true)
    public VehicleResponse getById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_NOT_FOUND));
        return toResponse(vehicle);
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getAll() {
        return vehicleRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllOrSearch(String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return search(keyword);
        }
        return getAll();
    }


    @Transactional(readOnly = true)
    public PageResponse<VehicleResponse> getAllOrSearchWithStatus(String keyword, String status, Integer page, Integer size) {
        int pageNum = (page != null && page > 0) ? page : 1;
        int pageSize = (size != null && size > 0) ? size : 1000;
        Pageable pageable = PageRequest.of(pageNum - 1, pageSize);

        Page<Vehicle> pageData;
        if (keyword != null && !keyword.trim().isEmpty()) {
            pageData = vehicleRepository.findByLicensePlateContainingIgnoreCase(keyword, pageable);
        } else {
            pageData = vehicleRepository.findAll(pageable);
        }

        List<VehicleResponse> filtered = pageData.getContent().stream()
                .filter(v -> status == null || status.equals("All") || v.getStatus().name().equalsIgnoreCase(status))
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<VehicleResponse>builder()
                .currentPage(pageNum)
                .pageSize(pageSize)
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(filtered)
                .build();
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getByStatus(String status) {
        Vehicle.VehicleStatus vehicleStatus = Vehicle.VehicleStatus.valueOf(status);
        return vehicleRepository.findByStatus(vehicleStatus).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getAvailableByModelId(Long vehicleModelId) {
        return vehicleRepository.findAvailableByModelId(vehicleModelId, Vehicle.VehicleStatus.available).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getByModelId(Long vehicleModelId) {
        vehicleModelRepository.findById(vehicleModelId)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));

        return vehicleRepository.findByVehicleModelId(vehicleModelId).stream()
                .filter(vehicle -> !vehicle.getStatus().equals(Vehicle.VehicleStatus.deleted))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> search(String keyword) {
        return vehicleRepository.findByLicensePlateLikeIgnoreCase(keyword).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private boolean isValidStatus(String status) {
        return status.equals("available") || status.equals("rented") || status.equals("maintenance") || status.equals("deleted");
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .vehicleModelId(vehicle.getVehicleModel().getId())
                .vehicleModelName(vehicle.getVehicleModel().getName())
                .licensePlate(vehicle.getLicensePlate())
                .location(vehicle.getLocation())
                .status(vehicle.getStatus().name())
                .createdAt(vehicle.getCreatedAt())
                .build();
    }

    private String normalizeLocation(String location) {
        if (location == null) {
            return null;
        }

        String trimmed = location.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
