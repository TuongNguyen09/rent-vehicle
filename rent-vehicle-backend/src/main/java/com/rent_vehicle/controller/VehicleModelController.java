package com.rent_vehicle.controller;

import com.rent_vehicle.dto.response.ApiResponse;
import com.rent_vehicle.dto.request.CreateVehicleModelRequest;
import com.rent_vehicle.dto.response.VehicleModelResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.service.CloudinaryService;
import com.rent_vehicle.service.VehicleModelService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/vehicle-models")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VehicleModelController {

    VehicleModelService vehicleModelService;
    CloudinaryService cloudinaryService;
    ObjectMapper objectMapper;

    /**
     * Create vehicle model with image upload (multipart/form-data)
     * - data: JSON string of CreateVehicleModelRequest
     * - images: image files (optional)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<VehicleModelResponse> createVehicleModelWithImages(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) throws Exception {
        // Parse JSON to request object
        CreateVehicleModelRequest request = objectMapper.readValue(dataJson, CreateVehicleModelRequest.class);
        
        // Upload images if provided
        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = cloudinaryService.uploadImages(images, "vehicles");
            request.setImageUrls(imageUrls);
        }
        
        return ApiResponse.<VehicleModelResponse>builder()
                .message("Vehicle model created successfully!")
                .result(vehicleModelService.create(request))
                .build();
    }

    /**
     * Create vehicle model with existing image URLs (application/json)
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<VehicleModelResponse> createVehicleModel(@RequestBody CreateVehicleModelRequest request) {
        return ApiResponse.<VehicleModelResponse>builder()
                .message("Vehicle model created successfully!")
                .result(vehicleModelService.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<VehicleModelResponse> updateVehicleModel(
            @PathVariable Long id,
            @RequestBody CreateVehicleModelRequest request
    ) {
        return ApiResponse.<VehicleModelResponse>builder()
                .message("Vehicle model updated successfully!")
                .result(vehicleModelService.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteVehicleModel(@PathVariable Long id) {
        vehicleModelService.delete(id);
        return ApiResponse.<String>builder()
                .message("Vehicle model deleted successfully!")
                .result("Vehicle model has been deleted.")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<VehicleModelResponse> getVehicleModel(@PathVariable Long id) {
        return ApiResponse.<VehicleModelResponse>builder()
                .message("Vehicle model retrieved successfully!")
                .result(vehicleModelService.getById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<?> getAllVehicleModels(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long vehicleTypeId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        // If pagination params provided, use paginated endpoint
        if (page != null && size != null) {
            return ApiResponse.<PageResponse<VehicleModelResponse>>builder()
                    .message("Vehicle models retrieved successfully!")
                    .result(vehicleModelService.getAllOrSearchPaginated(keyword, vehicleTypeId, brand, minPrice, maxPrice, page, size))
                    .build();
        } else {
            // Otherwise use non-paginated endpoint
            return ApiResponse.<List<VehicleModelResponse>>builder()
                    .message("Vehicle models retrieved successfully!")
                    .result(vehicleModelService.getAllOrSearch(keyword, vehicleTypeId, brand, minPrice, maxPrice))
                    .build();
        }
    }

    @GetMapping("/type/{vehicleTypeId}")
    public ApiResponse<List<VehicleModelResponse>> getVehicleModelsByType(@PathVariable Long vehicleTypeId) {
        return ApiResponse.<List<VehicleModelResponse>>builder()
                .message("Vehicle models retrieved successfully!")
                .result(vehicleModelService.getByVehicleType(vehicleTypeId))
                .build();
    }
}
