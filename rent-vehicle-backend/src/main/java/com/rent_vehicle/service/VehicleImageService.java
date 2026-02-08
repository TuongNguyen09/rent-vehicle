package com.rent_vehicle.service;

import com.rent_vehicle.dto.response.VehicleImageResponse;
import com.rent_vehicle.model.VehicleImage;
import com.rent_vehicle.model.VehicleModel;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.repository.VehicleImageRepository;
import com.rent_vehicle.repository.VehicleModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleImageService {
    private final VehicleImageRepository vehicleImageRepository;
    private final VehicleModelRepository vehicleModelRepository;

    // Add single image to vehicle model
    public VehicleImageResponse addImageToVehicleModel(Long vehicleModelId, String imageUrl) {
        VehicleModel vehicleModel = vehicleModelRepository.findById(vehicleModelId)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));

        VehicleImage image = VehicleImage.builder()
                .vehicleModel(vehicleModel)
                .imageUrl(imageUrl)
                .build();

        VehicleImage saved = vehicleImageRepository.save(image);
        return toResponse(saved);
    }

    // Get all images of a vehicle model
    @Transactional(readOnly = true)
    public List<VehicleImageResponse> getImagesByVehicleModel(Long vehicleModelId) {
        vehicleModelRepository.findById(vehicleModelId)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));

        return vehicleImageRepository.findByVehicleModelId(vehicleModelId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Delete single image
    public void deleteImage(Long imageId) {
        VehicleImage image = vehicleImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_IMAGE_NOT_FOUND));
        vehicleImageRepository.delete(image);
    }

    // Get single image
    @Transactional(readOnly = true)
    public VehicleImageResponse getImage(Long imageId) {
        VehicleImage image = vehicleImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_IMAGE_NOT_FOUND));
        return toResponse(image);
    }

    private VehicleImageResponse toResponse(VehicleImage image) {
        return VehicleImageResponse.builder()
                .id(image.getId())
                .vehicleModelId(image.getVehicleModel().getId())
                .imageUrl(image.getImageUrl())
                .build();
    }
}
