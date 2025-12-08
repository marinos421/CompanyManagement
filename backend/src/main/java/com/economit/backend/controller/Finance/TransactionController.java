package com.economit.backend.controller.Finance;

import com.economit.backend.dto.Finance.TransactionDto;
import com.economit.backend.model.TransactionCategory;
import com.economit.backend.model.TransactionType;
import com.economit.backend.service.Finance.TransactionService;

import com.economit.backend.service.Workforce.PayrollService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final PayrollService payrollService;

    @GetMapping
    public ResponseEntity<List<TransactionDto>> getAll(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionCategory category,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        // Αν δεν στείλει τίποτα, θα φέρει τα πάντα (όπως πριν)
        return ResponseEntity.ok(transactionService.searchTransactions(type, category, startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<TransactionDto> create(@RequestBody TransactionDto request) {
        return ResponseEntity.ok(transactionService.createTransaction(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TransactionDto> completeTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.markAsCompleted(id));
    }

    @PostMapping("/payroll")
    public ResponseEntity<Void> runPayroll() {
        payrollService.createPayrollTransactions();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/batch")
    public ResponseEntity<List<TransactionDto>> createBatch(@RequestBody List<TransactionDto> requests) {
        return ResponseEntity.ok(transactionService.createBatch(requests));
    }


}