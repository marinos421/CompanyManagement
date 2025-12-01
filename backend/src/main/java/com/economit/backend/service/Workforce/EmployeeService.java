package com.economit.backend.service.Workforce;

import com.economit.backend.dto.Auth.RegisterRequest;
import com.economit.backend.dto.Workforce.EmployeeDto;
import com.economit.backend.model.Role;
import com.economit.backend.model.User;
import com.economit.backend.repository.Auth.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Base64;

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

    public EmployeeDto getMe() {
        User user = getCurrentUser();
        return mapToDto(user);
    }

    public EmployeeDto updateMe(
            String phoneNumber, String personalTaxId, String idNumber, String address,
            String newPassword, MultipartFile avatarFile
    ) throws IOException { // <--- Πρέπει να υπάρχει και εδώ
        
        User user = getCurrentUser();

        if (phoneNumber != null) user.setPhoneNumber(phoneNumber);
        if (personalTaxId != null) user.setPersonalTaxId(personalTaxId);
        if (idNumber != null) user.setIdNumber(idNumber);
        if (address != null) user.setAddress(address);

        if (newPassword != null && !newPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        if (avatarFile != null && !avatarFile.isEmpty()) {
            user.setAvatar(avatarFile.getBytes());
            user.setAvatarContentType(avatarFile.getContentType());
        }

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    public List<EmployeeDto> getAllCompanyUsers() {
        User user = getCurrentUser();
        return user.getCompany().getUsers().stream()
                .map(this::mapToDto) // Δεν κάνουμε φίλτρο ρόλου, τους θέλουμε όλους
                .collect(Collectors.toList());
    }    
    
    

    private EmployeeDto mapToDto(User user) {
        String avatarBase64 = null;
        if (user.getAvatar() != null) {
            avatarBase64 = Base64.getEncoder().encodeToString(user.getAvatar());
        }

        return EmployeeDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .jobTitle(user.getJobTitle())
                .salary(user.getSalary())
                .companyName(user.getCompany().getName())
                // New fields
                .phoneNumber(user.getPhoneNumber())
                .personalTaxId(user.getPersonalTaxId())
                .idNumber(user.getIdNumber())
                .address(user.getAddress())
                .avatarBase64(avatarBase64)
                .avatarContentType(user.getAvatarContentType())
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