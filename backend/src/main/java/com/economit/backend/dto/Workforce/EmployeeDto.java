package com.economit.backend.dto.Workforce;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String jobTitle;
    private Double salary;
    private String companyName;
    private String phoneNumber;
    private String personalTaxId;
    private String idNumber;
    private String address;
    
    // Image for display
    private String avatarBase64;
    private String avatarContentType;
    
    // Only for update (never sent back to UI for security)
    private String newPassword; 
}