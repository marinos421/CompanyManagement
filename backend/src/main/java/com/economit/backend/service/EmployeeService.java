package com.economit.backend.service;

import com.economit.backend.dto.EmployeeDto;
import com.economit.backend.dto.RegisterRequest; // We can reuse this or create a specific one
import com.economit.backend.model.Role;
import com.economit.backend.model.User;
import com.economit.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Helper to get current Admin
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public List<EmployeeDto> getAllEmployees() {
        User admin = getCurrentUser();
        
        // Find all users belonging to the same company, excluding the admin themselves if needed
        // Or simply filter by Role.EMPLOYEE
        return admin.getCompany().getUsers().stream()
                .filter(u -> u.getRole() == Role.EMPLOYEE)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public EmployeeDto createEmployee(EmployeeDto request) {
        User admin = getCurrentUser();

        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User employee = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .jobTitle(request.getJobTitle())
                .salary(request.getSalary())
                .role(Role.EMPLOYEE)
                .company(admin.getCompany()) // Link to Admin's Company
                .password(passwordEncoder.encode("password123")) // Default password
                .build();

        User savedEmployee = userRepository.save(employee);
        return mapToDto(savedEmployee);
    }
    
    // Add logic for Delete later

    private EmployeeDto mapToDto(User user) {
        return EmployeeDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .jobTitle(user.getJobTitle())
                .salary(user.getSalary())
                .build();
    }
    public EmployeeDto updateEmployee(Long id, EmployeeDto request) {
        User admin = getCurrentUser();
        User employee = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Security Check: 
        if (!employee.getCompany().getId().equals(admin.getCompany().getId())) {
            throw new RuntimeException("You are not authorized to edit this employee");
        }

        
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setJobTitle(request.getJobTitle());
        employee.setSalary(request.getSalary());

        User updatedEmployee = userRepository.save(employee);
        return mapToDto(updatedEmployee);
    }

    public void deleteEmployee(Long id) {
        User admin = getCurrentUser();
        User employee = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Security Check
        if (!employee.getCompany().getId().equals(admin.getCompany().getId())) {
            throw new RuntimeException("You are not authorized to delete this employee");
        }

        userRepository.delete(employee);
    }
}