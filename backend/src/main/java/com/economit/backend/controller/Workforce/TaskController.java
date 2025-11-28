package com.economit.backend.controller.Workforce;

import com.economit.backend.dto.Workforce.TaskDto;
import com.economit.backend.model.TaskStatus;
import com.economit.backend.service.Workforce.TaskService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public ResponseEntity<TaskDto> create(@RequestBody TaskDto request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateStatus(@PathVariable Long id, @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.updateStatus(id, status));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}