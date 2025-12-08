package com.economit.backend.service.Finance;

import com.economit.backend.dto.Finance.TransactionDto;
import com.economit.backend.model.Company;
import com.economit.backend.model.Transaction;
import com.economit.backend.model.TransactionCategory;
import com.economit.backend.model.TransactionType;
import com.economit.backend.model.User;
import com.economit.backend.repository.Auth.UserRepository;
import com.economit.backend.repository.Finance.TransactionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import com.economit.backend.model.TransactionStatus;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public List<TransactionDto> getAllTransactions() {
        User user = getCurrentUser();
        return transactionRepository.findByCompanyIdOrderByDateDesc(user.getCompany().getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TransactionDto createTransaction(TransactionDto request) {
        User user = getCurrentUser();
        Company company = user.getCompany();

        Transaction transaction = Transaction.builder()
                .type(request.getType())
                .amount(request.getAmount())
                .date(request.getDate())
                .category(request.getCategory())
                .description(request.getDescription())
                .status(request.getStatus())
                .company(company)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToDto(saved);
    }

    public void deleteTransaction(Long id) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getCompany().getId().equals(user.getCompany().getId())) {
            throw new RuntimeException("Not authorized");
        }

        transactionRepository.delete(transaction);
    }

    private TransactionDto mapToDto(Transaction t) {
        return TransactionDto.builder()
                .id(t.getId())
                .type(t.getType())
                .amount(t.getAmount())
                .date(t.getDate())
                .category(t.getCategory())
                .description(t.getDescription())
                .status(t.getStatus())
                .build();
    }

        public TransactionDto markAsCompleted(Long id) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getCompany().getId().equals(user.getCompany().getId())) {
            throw new RuntimeException("Not authorized");
        }

        transaction.setStatus(com.economit.backend.model.TransactionStatus.COMPLETED);
        Transaction saved = transactionRepository.save(transaction);
        return mapToDto(saved);
    }


    public List<TransactionDto> searchTransactions(
            TransactionType type, 
            TransactionCategory category, 
            LocalDate startDate, 
            LocalDate endDate
    ) {
        User user = getCurrentUser();
        
        // Καλούμε το Search Query του Repository
        List<Transaction> transactions = transactionRepository.search(
                user.getCompany().getId(),
                type,
                category,
                startDate,
                endDate
        );

        return transactions.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional // Σημαντικό: Ή όλα ή τίποτα
    public List<TransactionDto> createBatch(List<TransactionDto> requests) {
        User user = getCurrentUser();
        Company company = user.getCompany();

        List<Transaction> transactions = requests.stream().map(req -> Transaction.builder()
                .type(req.getType())
                .amount(req.getAmount())
                .date(req.getDate())
                .category(req.getCategory())
                .description(req.getDescription())
                .status(req.getStatus() != null ? req.getStatus() : TransactionStatus.COMPLETED)
                .company(company)
                .build()
        ).collect(Collectors.toList());

        List<Transaction> saved = transactionRepository.saveAll(transactions);
        
        return saved.stream().map(this::mapToDto).collect(Collectors.toList());
    }
}