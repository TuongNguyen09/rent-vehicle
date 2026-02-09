package com.rent_vehicle.controller;

import com.rent_vehicle.dto.response.ApiResponse;
import com.rent_vehicle.dto.response.UserResponse;
import com.rent_vehicle.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMyProfile() {
        return ApiResponse.<UserResponse>builder()
                .message("User profile retrieved successfully!")
                .result(userService.getCurrentUserProfile())
                .build();
    }

    @PutMapping("/me")
    public ApiResponse<UserResponse> updateMyProfile(@RequestParam String fullName) {
        return ApiResponse.<UserResponse>builder()
                .message("User profile updated successfully!")
                .result(userService.updateCurrentUserProfile(fullName))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUser(@PathVariable Long id) {
        return ApiResponse.<UserResponse>builder()
                .message("User retrieved successfully!")
                .result(userService.getUserById(id))
                .build();
    }

    @GetMapping("/email/{email}")
    public ApiResponse<UserResponse> getUserByEmail(@PathVariable String email) {
        return ApiResponse.<UserResponse>builder()
                .message("User retrieved successfully!")
                .result(userService.getUserByEmail(email))
                .build();
    }

    @GetMapping
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .message("Users retrieved successfully!")
                .result(userService.getAllUsers())
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<List<UserResponse>> searchUsers(@RequestParam("keyword") String keyword) {
        return ApiResponse.<List<UserResponse>>builder()
                .message("Search results retrieved successfully!")
                .result(userService.searchUsers(keyword))
                .build();
    }

    @PutMapping("/{id}/ban")
    public ApiResponse<UserResponse> banUser(@PathVariable Long id) {
        return ApiResponse.<UserResponse>builder()
                .message("User banned successfully!")
                .result(userService.banUser(id))
                .build();
    }

    @PutMapping("/{id}/unban")
    public ApiResponse<UserResponse> unbanUser(@PathVariable Long id) {
        return ApiResponse.<UserResponse>builder()
                .message("User unbanned successfully!")
                .result(userService.unbanUser(id))
                .build();
    }

    @GetMapping("/role/{role}")
    public ApiResponse<List<UserResponse>> getUsersByRole(@PathVariable String role) {
        return ApiResponse.<List<UserResponse>>builder()
                .message("Users retrieved successfully!")
                .result(userService.getUsersByRole(role))
                .build();
    }
}
