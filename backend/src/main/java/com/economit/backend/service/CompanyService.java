package com.economit.backend.service;

import com.economit.backend.dto.CompanyProfileDto;
import com.economit.backend.model.Company;
import com.economit.backend.model.User;
import com.economit.backend.repository.CompanyRepository;
import com.economit.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    // Helper to get current authenticated user
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public CompanyProfileDto getCompanyProfile() {
        User user = getCurrentUser();
        Company company = user.getCompany();

        // Convert Logo bytes to Base64 string for Frontend display
        String logoBase64 = null;
        if (company.getLogoData() != null) {
            logoBase64 = Base64.getEncoder().encodeToString(company.getLogoData());
        }

        return CompanyProfileDto.builder()
                .name(company.getName())
                .email(company.getEmail())
                .taxId(company.getTaxId())
                .phone(company.getPhone())
                .website(company.getWebsite())
                .street(company.getStreet())
                .city(company.getCity())
                .zipCode(company.getZipCode())
                .country(company.getCountry())
                .logoBase64(logoBase64)
                .logoContentType(company.getLogoContentType())
                .build();
    }

    public CompanyProfileDto updateCompanyProfile(
            String name, String taxId, String phone, String website,
            String street, String city, String zipCode, String country,
            MultipartFile logoFile
    ) throws IOException {
        
        User user = getCurrentUser();
        Company company = user.getCompany();

        // Update Text Fields
        if (name != null && !name.isBlank()) company.setName(name);
        company.setTaxId(taxId);
        company.setPhone(phone);
        company.setWebsite(website);
        company.setStreet(street);
        company.setCity(city);
        company.setZipCode(zipCode);
        company.setCountry(country);

        // Update Logo if a new file is provided
        if (logoFile != null && !logoFile.isEmpty()) {
            company.setLogoData(logoFile.getBytes());
            company.setLogoContentType(logoFile.getContentType());
        }

        Company saved = companyRepository.save(company);

        // Return updated DTO
        return getCompanyProfile();
    }
}