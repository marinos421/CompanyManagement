package com.economit.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity implements UserDetails {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    // --- New Employee Fields ---
    private String firstName;
    private String lastName;
    
    private String jobTitle; // e.g. "Software Engineer"
    
    private Double salary; // e.g. 1500.00

    // --- Personal Details (Employee Editable) ---
    private String phoneNumber;
    private String personalTaxId; // AFM
    private String idNumber;      // Arithmos Taftotitas
    private String address;       // Place of Origin / Address

    @Lob
    @Column(length = 1000000)
    private byte[] avatar;        // Profile Picture
    
    private String avatarContentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() { return email; }
    @Override
    public String getPassword() { return password; }
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}