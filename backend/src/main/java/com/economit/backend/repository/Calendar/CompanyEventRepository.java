package com.economit.backend.repository.Calendar;

import com.economit.backend.model.CompanyEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompanyEventRepository extends JpaRepository<CompanyEvent, Long> {
    List<CompanyEvent> findByCompanyIdOrderByStartTimeAsc(Long companyId);
}