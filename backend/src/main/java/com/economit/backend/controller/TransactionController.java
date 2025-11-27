package com.economit.backend.controller;

import com.economit.backend.dto.TransactionDto;
import com.economit.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.economit.backend.service.PayrollService;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final PayrollService payrollService;

    @GetMapping
    public ResponseEntity<List<TransactionDto>> getAll() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
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
}