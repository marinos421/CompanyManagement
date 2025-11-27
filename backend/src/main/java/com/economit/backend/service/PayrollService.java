package com.economit.backend.service;

import com.economit.backend.model.*;
import com.economit.backend.repository.TransactionRepository;
import com.economit.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    // Automation: Runs on the 1st of every month at 09:00 AM
    @Scheduled(cron = "0 0 9 1 * ?")
    @Transactional
    public void generateMonthlyPayroll() {
        createPayrollTransactions();
    }

    @Transactional
    public void createPayrollTransactions() {
        // 1. Find all employees
        List<User> employees = userRepository.findAllByRole(Role.EMPLOYEE);

        LocalDate today = LocalDate.now();

        for (User emp : employees) {
            // Skip if salary is missing or zero
            if (emp.getSalary() == null || emp.getSalary() == 0) continue;

            // 2. Create Transaction
            Transaction payroll = Transaction.builder()
                    .type(TransactionType.EXPENSE)
                    .category(TransactionCategory.SALARIES)
                    .amount(BigDecimal.valueOf(emp.getSalary()))
                    .date(today)
                    .description("Salary: " + emp.getFirstName() + " " + emp.getLastName())
                    .status(TransactionStatus.PENDING)
                    .company(emp.getCompany())
                    .build();

            transactionRepository.save(payroll);
        }
    }
}