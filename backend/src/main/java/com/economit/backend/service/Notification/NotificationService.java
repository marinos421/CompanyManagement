package com.economit.backend.service.Notification;

import com.economit.backend.model.Notification;
import com.economit.backend.repository.Notification.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void send(String recipientEmail, String message, String type) {
        // 1. Save to Database
        Notification notification = Notification.builder()
                .recipientEmail(recipientEmail)
                .message(message)
                .type(type)
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .build();
        
        Notification saved = notificationRepository.save(notification);


        messagingTemplate.convertAndSend("/topic/notifications/" + recipientEmail, saved);
    }

    public List<Notification> getMyNotifications(String email) {
        return notificationRepository.findByRecipientEmailOrderByTimestampDesc(email);
    }

    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        n.setRead(true);
        notificationRepository.save(n);
    }
}
