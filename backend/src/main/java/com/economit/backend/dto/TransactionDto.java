package com.economit.backend.dto;

import com.economit.backend.model.TransactionCategory;
import com.economit.backend.model.TransactionStatus;
import com.economit.backend.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionDto {
    private Long id;
    private TransactionType type;
    private BigDecimal amount;
    private LocalDate date;
    private TransactionCategory category;
    private String description;
    private TransactionStatus status;
}