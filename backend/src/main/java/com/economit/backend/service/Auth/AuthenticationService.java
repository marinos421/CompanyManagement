package com.economit.backend.service.Auth;

import com.economit.backend.config.JwtService;
import com.economit.backend.dto.Auth.AuthResponse;
import com.economit.backend.dto.Auth.LoginRequest;
import com.economit.backend.dto.Auth.RegisterRequest;
import com.economit.backend.model.Company;
import com.economit.backend.model.Role;
import com.economit.backend.model.User;
import com.economit.backend.repository.Auth.UserRepository;
import com.economit.backend.repository.Company.CompanyRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        
        
        var company = Company.builder()
                .name(request.getEmail()) 
                .email(request.getEmail())
                .build();
        
        var savedCompany = companyRepository.save(company);

        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.COMPANY_ADMIN)
                .company(savedCompany)
                .build();

        userRepository.save(user);

  
        var jwtToken = jwtService.generateToken(user);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .companyName(savedCompany.getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        
        var jwtToken = jwtService.generateToken(user);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .companyName(user.getCompany().getName())
                .build();
    }
}