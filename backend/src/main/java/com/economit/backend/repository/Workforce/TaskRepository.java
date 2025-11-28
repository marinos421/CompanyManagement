package com.economit.backend.repository.Workforce;

import com.economit.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByCompanyIdOrderByDueDateAsc(Long companyId);
    

    List<Task> findByAssignedToIdOrderByDueDateAsc(Long userId);
}