package com.economit.backend.service.Workforce;

import com.economit.backend.dto.Workforce.TaskDto;
import com.economit.backend.model.*;
import com.economit.backend.repository.Auth.UserRepository;
import com.economit.backend.repository.Workforce.TaskRepository;
import com.economit.backend.service.Notification.NotificationService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

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

    public TaskDto createTask(TaskDto request) {
        User admin = getCurrentUser(); // Should be admin creating tasks
        
        User assignedEmp = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .status(TaskStatus.TODO)
                .assignedTo(assignedEmp)
                .company(admin.getCompany())
                .build();

        taskRepository.save(task);
        notificationService.send(
            assignedEmp.getEmail(), 
            "New Task Assigned: " + task.getTitle(), 
            "TASK"
        );
        return mapToDto(task);
    }

    public TaskDto updateStatus(Long taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        task.setStatus(status);
        return mapToDto(taskRepository.save(task));
    }
    
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    private TaskDto mapToDto(Task t) {
        return TaskDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .dueDate(t.getDueDate())
                .status(t.getStatus())
                .assignedToId(t.getAssignedTo().getId())
                .assignedToName(t.getAssignedTo().getFirstName() + " " + t.getAssignedTo().getLastName())
                .build();
    }
}