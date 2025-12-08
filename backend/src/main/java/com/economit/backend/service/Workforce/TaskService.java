package com.economit.backend.service.Workforce;

import com.economit.backend.dto.Workforce.AttachmentDto;
import com.economit.backend.dto.Workforce.TaskDto;
import com.economit.backend.model.*;
import com.economit.backend.model.Workforce.Task;
import com.economit.backend.model.Workforce.TaskAttachment;
import com.economit.backend.model.Workforce.TaskStatus;
import com.economit.backend.repository.Workforce.TaskRepository;
import com.economit.backend.repository.Auth.UserRepository;
import com.economit.backend.service.Notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public List<TaskDto> getTasks() {
        User user = getCurrentUser();
        List<Task> tasks;
        if (user.getRole() == Role.COMPANY_ADMIN) {
            tasks = taskRepository.findByCompanyIdOrderByDueDateAsc(user.getCompany().getId());
        } else {
            tasks = taskRepository.findByAssignedToIdOrderByDueDateAsc(user.getId());
        }
        return tasks.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // CREATE TASK WITH FILES
    public TaskDto createTask(TaskDto request, List<MultipartFile> files) throws IOException {
        User admin = getCurrentUser();
        User assignedEmp = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .status(TaskStatus.TODO)
                .rating(0) // Default rating
                .assignedTo(assignedEmp)
                .company(admin.getCompany())
                .attachments(new ArrayList<>()) // Init list
                .build();

        // Process Files
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                TaskAttachment attachment = TaskAttachment.builder()
                        .fileName(file.getOriginalFilename())
                        .fileType(file.getContentType())
                        .data(file.getBytes())
                        .task(task)
                        .build();
                task.getAttachments().add(attachment);
            }
        }

        Task savedTask = taskRepository.save(task);

        notificationService.send(assignedEmp.getEmail(), "New Task: " + savedTask.getTitle(), "TASK");
        return mapToDto(savedTask);
    }

    // UPDATE STATUS & RATING
    public TaskDto updateTask(Long taskId, TaskStatus status, Integer rating) {
        Task task = taskRepository.findById(taskId).orElseThrow();

        if (status != null)
            task.setStatus(status);
        if (rating != null)
            task.setRating(rating);

        return mapToDto(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    private TaskDto mapToDto(Task t) {
        List<AttachmentDto> attachmentDtos = t.getAttachments() != null
                ? t.getAttachments().stream()
                        .map(att -> AttachmentDto.builder()
                                .id(att.getId())
                                .fileName(att.getFileName())
                                .fileType(att.getFileType())
                                .build())
                        .collect(Collectors.toList())
                : new ArrayList<>();

        return TaskDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .dueDate(t.getDueDate())
                .status(t.getStatus())
                .rating(t.getRating())
                .assignedToId(t.getAssignedTo().getId())
                .assignedToName(t.getAssignedTo().getFirstName() + " " + t.getAssignedTo().getLastName())
                .attachments(attachmentDtos)
                .build();
    }
}