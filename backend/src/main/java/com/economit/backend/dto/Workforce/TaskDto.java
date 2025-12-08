package com.economit.backend.dto.Workforce;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

import com.economit.backend.model.Workforce.TaskStatus;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskDto {
    private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private TaskStatus status;
    private Integer rating;

    private Long assignedToId;
    private String assignedToName;

    // List of full attachment details
    private List<AttachmentDto> attachments;

}