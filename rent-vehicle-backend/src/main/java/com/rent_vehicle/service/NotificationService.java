package com.rent_vehicle.service;

import com.rent_vehicle.dto.response.NotificationResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.model.Booking;
import com.rent_vehicle.model.Notification;
import com.rent_vehicle.model.User;
import com.rent_vehicle.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationResponse create(User user, String title, String message, Notification.NotificationType type, String linkUrl) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .status(Notification.NotificationStatus.unread)
                .linkUrl(linkUrl)
                .build();
        return toResponse(notificationRepository.save(notification));
    }

    public void createBookingApprovedNotification(Booking booking, String linkUrl) {
        String title = "Đơn đặt xe đã được duyệt";
        String message = "Đơn #" + booking.getId() + " đã được duyệt. Vui lòng thanh toán để hoàn tất.";
        create(booking.getUser(), title, message, Notification.NotificationType.booking, linkUrl);
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Notification> pageData = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<NotificationResponse> content = pageData.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<NotificationResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(content)
                .build();
    }

    public NotificationResponse markAsRead(Long id, Long userId) {
        Notification notification = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notification.setStatus(Notification.NotificationStatus.read);
        return toResponse(notificationRepository.save(notification));
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndStatus(userId, Notification.NotificationStatus.unread);
        if (!unread.isEmpty()) {
            unread.forEach(n -> n.setStatus(Notification.NotificationStatus.read));
            notificationRepository.saveAll(unread);
        }
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType().name())
                .status(notification.getStatus().name())
                .linkUrl(notification.getLinkUrl())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
