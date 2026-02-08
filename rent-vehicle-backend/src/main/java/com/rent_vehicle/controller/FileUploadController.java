package com.rent_vehicle.controller;

import com.rent_vehicle.dto.response.ApiResponse;
import com.rent_vehicle.service.CloudinaryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileUploadController {

    CloudinaryService cloudinaryService;

    /**
     * Upload a single image for vehicles
     */
    @PostMapping("/vehicle-image")
    public ApiResponse<String> uploadVehicleImage(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadImage(file, "vehicles");
        return ApiResponse.<String>builder()
                .message("Image uploaded successfully")
                .result(url)
                .build();
    }

    /**
     * Upload multiple images for vehicles
     */
    @PostMapping("/vehicle-images")
    public ApiResponse<List<String>> uploadVehicleImages(@RequestParam("files") List<MultipartFile> files) {
        List<String> urls = cloudinaryService.uploadImages(files, "vehicles");
        return ApiResponse.<List<String>>builder()
                .message("Images uploaded successfully")
                .result(urls)
                .build();
    }

    /**
     * Upload user avatar
     */
    @PostMapping("/avatar")
    public ApiResponse<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadImage(file, "avatars");
        return ApiResponse.<String>builder()
                .message("Avatar uploaded successfully")
                .result(url)
                .build();
    }

    /**
     * Delete an image by URL
     */
    @DeleteMapping("/image")
    public ApiResponse<String> deleteImage(@RequestParam("url") String url) {
        cloudinaryService.deleteImage(url);
        return ApiResponse.<String>builder()
                .message("Image deleted successfully")
                .result("Deleted")
                .build();
    }
}
