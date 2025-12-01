package com.economit.backend.model;

import com.economit.backend.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Column(nullable = false)
    private String recipientEmail; // Σε ποιον πάει (User Email)

    @Column(nullable = false)
    private String message; // "You have a new task: Fix Printer"

    private String type; // TASK, PAYROLL, CHAT

    private boolean isRead; // false = δεν το είδε ακόμα

    private LocalDateTime timestamp;
}