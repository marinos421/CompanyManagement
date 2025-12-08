package com.economit.backend.model.Workforce;
import com.economit.backend.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "task_attachments")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskAttachment extends BaseEntity {

    private String fileName;
    private String fileType;

    @Lob
    @Column(length = 5000000) // 5MB limit per file
    private byte[] data;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;
}