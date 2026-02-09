package com.rent_vehicle.service;

import com.rent_vehicle.dto.request.CreateVehicleTypeRequest;
import com.rent_vehicle.dto.response.VehicleTypeResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.model.VehicleType;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.repository.VehicleTypeRepository;
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
public class VehicleTypeService {
    private final VehicleTypeRepository vehicleTypeRepository;

    @PreAuthorize("hasAuthority('ADMIN')")
    public VehicleTypeResponse create(CreateVehicleTypeRequest request) {
        // Check duplicate name
        if (vehicleTypeRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.VEHICLE_TYPE_ALREADY_EXISTS);
        }

        VehicleType vehicleType = VehicleType.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        VehicleType saved = vehicleTypeRepository.save(vehicleType);
        return toResponse(saved);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    public VehicleTypeResponse update(Long id, CreateVehicleTypeRequest request) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_TYPE_NOT_FOUND));

        if (!vehicleType.getName().equals(request.getName())) {
            if (vehicleTypeRepository.findByName(request.getName()).isPresent()) {
                throw new AppException(ErrorCode.VEHICLE_TYPE_ALREADY_EXISTS);
            }
        }

        vehicleType.setName(request.getName());
        vehicleType.setDescription(request.getDescription());
        return toResponse(vehicleTypeRepository.save(vehicleType));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    public void delete(Long id) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_TYPE_NOT_FOUND));
        vehicleTypeRepository.delete(vehicleType);
    }

    @Transactional(readOnly = true)
    public VehicleTypeResponse getById(Long id) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_TYPE_NOT_FOUND));
        return toResponse(vehicleType);
    }

    @Transactional(readOnly = true)
    public List<VehicleTypeResponse> getAll() {
        return vehicleTypeRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<VehicleTypeResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<VehicleType> pageData = vehicleTypeRepository.findAll(pageable);
        
        List<VehicleTypeResponse> content = pageData.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<VehicleTypeResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(content)
                .build();
    }

    @Transactional(readOnly = true)
    public List<VehicleTypeResponse> search(String keyword) {
        return vehicleTypeRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private VehicleTypeResponse toResponse(VehicleType vehicleType) {
        return VehicleTypeResponse.builder()
                .id(vehicleType.getId())
                .name(vehicleType.getName())
                .description(vehicleType.getDescription())
                .createdAt(vehicleType.getCreatedAt())
                .build();
    }
}
