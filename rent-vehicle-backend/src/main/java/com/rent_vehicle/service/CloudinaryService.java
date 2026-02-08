package com.rent_vehicle.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CloudinaryService {

    Cloudinary cloudinary;

    /**
     * Upload a single image to Cloudinary
     * @param file MultipartFile to upload
     * @param folder Folder name in Cloudinary (e.g., "vehicles", "avatars")
     * @return URL of the uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "rent-vehicle/" + folder,
                            "resource_type", "image"
                    ));

            String url = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully: {}", url);
            return url;

        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    /**
     * Upload multiple images to Cloudinary
     * @param files List of MultipartFile to upload
     * @param folder Folder name in Cloudinary
     * @return List of URLs of uploaded images
     */
    public List<String> uploadImages(List<MultipartFile> files, String folder) {
        if (files == null || files.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                urls.add(uploadImage(file, folder));
            }
        }
        return urls;
    }

    /**
     * Delete an image from Cloudinary by URL
     * @param imageUrl The URL of the image to delete
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // Extract public_id from URL
            // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
            String publicId = extractPublicId(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Image deleted successfully: {}", publicId);
            }
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", imageUrl, e);
        }
    }

    /**
     * Delete multiple images from Cloudinary
     * @param imageUrls List of URLs to delete
     */
    public void deleteImages(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }
        imageUrls.forEach(this::deleteImage);
    }

    /**
     * Extract public_id from Cloudinary URL
     */
    private String extractPublicId(String url) {
        try {
            // Example URL: https://res.cloudinary.com/xxx/image/upload/v123456/rent-vehicle/vehicles/abc123.jpg
            String[] parts = url.split("/upload/");
            if (parts.length < 2) return null;
            
            String pathWithVersion = parts[1];
            // Remove version (v123456/)
            String path = pathWithVersion.replaceFirst("v\\d+/", "");
            // Remove file extension
            int lastDot = path.lastIndexOf('.');
            if (lastDot > 0) {
                path = path.substring(0, lastDot);
            }
            return path;
        } catch (Exception e) {
            log.error("Failed to extract public_id from URL: {}", url, e);
            return null;
        }
    }
}
