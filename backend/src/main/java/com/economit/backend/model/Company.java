package com.economit.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "companies")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company extends BaseEntity {

    @Column(nullable = false)
    private String name; // Business Name

    @Column(nullable = false, unique = true)
    private String email;

    // --- New Profile Fields ---
    
    private String taxId;       // AFM
    private String phone;
    private String website;

    // --- Address Fields ---
    private String street;
    private String city;
    private String zipCode;
    private String country;

    // --- Logo Storage (Option A: In Database) ---
    @Lob // Large Object for binary data
    @Column(length = 1000000) // Allow up to 1MB approx
    private byte[] logoData;

    private String logoContentType; // e.g., "image/png"

    // --- Relationships ---
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    private List<User> users;
}