package com.economit.backend.controller;

import com.economit.backend.dto.CompanyProfileDto;
import com.economit.backend.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/profile")
    public ResponseEntity<CompanyProfileDto> getProfile() {
        return ResponseEntity.ok(companyService.getCompanyProfile());
    }

     @PostMapping("/profile")
    public ResponseEntity<CompanyProfileDto> updateProfile(
            @RequestParam("name") String name,
            @RequestParam(value = "taxId", required = false) String taxId,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "website", required = false) String website,
            @RequestParam(value = "street", required = false) String street,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "zipCode", required = false) String zipCode,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "logo", required = false) MultipartFile logo
    ) throws IOException {
        
        return ResponseEntity.ok(companyService.updateCompanyProfile(
                name, taxId, phone, website, street, city, zipCode, country, logo
        ));
    }
}