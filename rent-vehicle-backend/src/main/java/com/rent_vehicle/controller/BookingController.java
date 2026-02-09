package com.rent_vehicle.controller;

import com.rent_vehicle.dto.request.CreateBookingRequest;
import com.rent_vehicle.dto.response.ApiResponse;
import com.rent_vehicle.dto.response.BookingResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.service.BookingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {

    BookingService bookingService;

    @PostMapping
    public ApiResponse<BookingResponse> createBooking(@RequestBody CreateBookingRequest request) {
        return ApiResponse.<BookingResponse>builder()
                .message("Booking created successfully!")
                .result(bookingService.createBooking(request))
                .build();
    }

    @PutMapping("/{id}/approve")
    public ApiResponse<BookingResponse> approveBooking(@PathVariable Long id) {
        return ApiResponse.<BookingResponse>builder()
                .message("Booking approved successfully!")
                .result(bookingService.approveBooking(id))
                .build();
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<BookingResponse> cancelBooking(@PathVariable Long id) {
        return ApiResponse.<BookingResponse>builder()
                .message("Booking canceled successfully!")
                .result(bookingService.cancelBooking(id))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BookingResponse> getBooking(@PathVariable Long id) {
        return ApiResponse.<BookingResponse>builder()
                .message("Booking retrieved successfully!")
                .result(bookingService.getBookingById(id))
                .build();
    }

    @GetMapping("/my-bookings")
    public ApiResponse<PageResponse<BookingResponse>> getMyBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PageResponse<BookingResponse>>builder()
                .message("Your bookings retrieved successfully!")
                .result(bookingService.getMyBookings(status, fromDate, toDate, page, size))
                .build();
    }

    @GetMapping
    public ApiResponse<PageResponse<BookingResponse>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ApiResponse.<PageResponse<BookingResponse>>builder()
                .message("Bookings retrieved successfully!")
                .result(bookingService.getAllBookings(status, fromDate, toDate, userId, page, size))
                .build();
    }
}
