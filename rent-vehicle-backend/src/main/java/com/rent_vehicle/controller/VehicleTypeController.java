package com.rent_vehicle.controller;

import com.rent_vehicle.dto.response.ApiResponse;
import com.rent_vehicle.dto.request.CreateVehicleTypeRequest;
import com.rent_vehicle.dto.response.VehicleTypeResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.service.VehicleTypeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicle-types")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VehicleTypeController {

    VehicleTypeService vehicleTypeService;

    @PostMapping
    public ApiResponse<VehicleTypeResponse> createVehicleType(@RequestBody CreateVehicleTypeRequest request) {
        return ApiResponse.<VehicleTypeResponse>builder()
                .message("Vehicle type created successfully!")
                .result(vehicleTypeService.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<VehicleTypeResponse> updateVehicleType(
            @PathVariable Long id,
            @RequestBody CreateVehicleTypeRequest request
    ) {
        return ApiResponse.<VehicleTypeResponse>builder()
                .message("Vehicle type updated successfully!")
                .result(vehicleTypeService.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteVehicleType(@PathVariable Long id) {
        vehicleTypeService.delete(id);
        return ApiResponse.<String>builder()
                .message("Vehicle type deleted successfully!")
                .result("Vehicle type has been deleted.")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<VehicleTypeResponse> getVehicleType(@PathVariable Long id) {
        return ApiResponse.<VehicleTypeResponse>builder()
                .message("Vehicle type retrieved successfully!")
                .result(vehicleTypeService.getById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<List<VehicleTypeResponse>> getAllVehicleTypes() {
        return ApiResponse.<List<VehicleTypeResponse>>builder()
                .message("Vehicle types retrieved successfully!")
                .result(vehicleTypeService.getAll())
                .build();
    }

    @GetMapping("/paginated")
    public ApiResponse<PageResponse<VehicleTypeResponse>> getAllVehicleTypesPaginated(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<PageResponse<VehicleTypeResponse>>builder()
                .message("Vehicle types retrieved successfully!")
                .result(vehicleTypeService.getAllPaginated(page, size))
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<List<VehicleTypeResponse>> searchVehicleTypes(@RequestParam("keyword") String keyword) {
        return ApiResponse.<List<VehicleTypeResponse>>builder()
                .message("Search results retrieved successfully!")
                .result(vehicleTypeService.search(keyword))
                .build();
    }
}
