package com.rent_vehicle.controller;

import com.rent_vehicle.dto.response.ApiResponse;
import com.rent_vehicle.dto.request.CreateVehicleRequest;
import com.rent_vehicle.dto.response.VehicleResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.service.VehicleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VehicleController {

    VehicleService vehicleService;

    @PostMapping
    public ApiResponse<VehicleResponse> createVehicle(@RequestBody CreateVehicleRequest request) {
        return ApiResponse.<VehicleResponse>builder()
                .message("Vehicle created successfully!")
                .result(vehicleService.create(request))
                .build();
    }

    @PutMapping("/{id}/status")
    public ApiResponse<VehicleResponse> updateVehicleStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ApiResponse.<VehicleResponse>builder()
                .message("Vehicle status updated successfully!")
                .result(vehicleService.updateStatus(id, status))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<VehicleResponse> getVehicle(@PathVariable Long id) {
        return ApiResponse.<VehicleResponse>builder()
                .message("Vehicle retrieved successfully!")
                .result(vehicleService.getById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<PageResponse<VehicleResponse>> getAllVehicles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PageResponse<VehicleResponse>>builder()
                .message("Vehicles retrieved successfully!")
                .result(vehicleService.getAllOrSearchWithStatus(keyword, status, page, size))
                .build();
    }

    @GetMapping("/status/{status}")
    public ApiResponse<List<VehicleResponse>> getVehiclesByStatus(@PathVariable String status) {
        return ApiResponse.<List<VehicleResponse>>builder()
                .message("Vehicles retrieved successfully!")
                .result(vehicleService.getByStatus(status))
                .build();
    }

    @GetMapping("/model/{modelId}/available")
    public ApiResponse<List<VehicleResponse>> getAvailableVehicles(@PathVariable Long modelId) {
        return ApiResponse.<List<VehicleResponse>>builder()
                .message("Available vehicles retrieved successfully!")
                .result(vehicleService.getAvailableByModelId(modelId))
                .build();
    }

    @GetMapping("/model/{modelId}")
    public ApiResponse<List<VehicleResponse>> getVehiclesByModel(@PathVariable Long modelId) {
        return ApiResponse.<List<VehicleResponse>>builder()
                .message("Vehicles by model retrieved successfully!")
                .result(vehicleService.getByModelId(modelId))
                .build();
    }
}
