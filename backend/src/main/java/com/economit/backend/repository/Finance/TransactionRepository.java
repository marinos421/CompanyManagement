package com.economit.backend.repository.Finance;

import com.economit.backend.model.Transaction;
import com.economit.backend.model.TransactionCategory;
import com.economit.backend.model.TransactionType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByCompanyIdOrderByDateDesc(Long companyId);

    @Query("SELECT t FROM Transaction t WHERE t.company.id = :companyId " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:startDate IS NULL OR t.date >= :startDate) " +
           "AND (:endDate IS NULL OR t.date <= :endDate) " +
           "ORDER BY t.date DESC")
    List<Transaction> search(
            @Param("companyId") Long companyId,
            @Param("type") TransactionType type,
            @Param("category") TransactionCategory category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}