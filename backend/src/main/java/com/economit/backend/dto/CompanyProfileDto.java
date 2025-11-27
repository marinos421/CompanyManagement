package com.economit.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyProfileDto {
    private String name;
    private String email;
    private String taxId;
    private String phone;
    private String website;
    private String street;
    private String city;
    private String zipCode;
    private String country;
    
    // We will handle the logo separately (as a Base64 string for display)
    private String logoBase64; 
    private String logoContentType;
}