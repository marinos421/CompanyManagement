package com.economit.backend.repository.Workforce;

import org.springframework.data.jpa.repository.JpaRepository;

import com.economit.backend.model.Workforce.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByCompanyIdOrderByDueDateAsc(Long companyId);
    

    List<Task> findByAssignedToIdOrderByDueDateAsc(Long userId);
}