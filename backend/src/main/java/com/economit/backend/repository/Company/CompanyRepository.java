package com.economit.backend.repository.Company;

import com.economit.backend.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsByEmail(String email);
    boolean existsByName(String name);
}