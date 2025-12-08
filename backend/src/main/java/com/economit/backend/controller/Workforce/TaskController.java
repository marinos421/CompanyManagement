package com.economit.backend.controller.Workforce;

import com.economit.backend.dto.Workforce.TaskDto;
import com.economit.backend.model.Workforce.TaskStatus;
import com.economit.backend.service.Workforce.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDate; // Import this
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDto>> getAll() {
        return ResponseEntity.ok(taskService.getTasks());
    }

    // UPDATED CREATE (With Files)
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<TaskDto> create(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("dueDate") LocalDate dueDate,
            @RequestParam("assignedToId") Long assignedToId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {
        
        TaskDto dto = TaskDto.builder()
                .title(title)
                .description(description)
                .dueDate(dueDate)
                .assignedToId(assignedToId)
                .build();

        return ResponseEntity.ok(taskService.createTask(dto, files));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskDto> update(
            @PathVariable Long id, 
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Integer rating
    ) {
        return ResponseEntity.ok(taskService.updateTask(id, status, rating));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}