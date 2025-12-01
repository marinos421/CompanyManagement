package com.economit.backend.model;

import com.economit.backend.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage extends BaseEntity {

    @Column(nullable = false)
    private String senderId; // Email του αποστολέα (User email)

    @Column(nullable = false)
    private String recipientId; // Email του παραλήπτη

    @Column(nullable = false)
    private String content; // Το κείμενο

    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    // Status (π.χ. αν διαβάστηκε) - θα το δούμε αργότερα
    // private boolean read; 
}