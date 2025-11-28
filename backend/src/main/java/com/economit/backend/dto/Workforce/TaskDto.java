package com.economit.backend.dto.Workforce;

import com.economit.backend.model.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

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
    
    // Employee info
    private Long assignedToId;
    private String assignedToName; // "Giorgos Papadopoulos"
}