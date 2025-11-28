package com.economit.backend.controller.Workforce;

import com.economit.backend.dto.Workforce.EmployeeDto;
import com.economit.backend.service.Workforce.EmployeeService;

import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<List<EmployeeDto>> getEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PostMapping
    public ResponseEntity<EmployeeDto> createEmployee(@RequestBody EmployeeDto request) {
        return ResponseEntity.ok(employeeService.createEmployee(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDto> updateEmployee(@PathVariable Long id, @RequestBody EmployeeDto request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<EmployeeDto> getMyProfile() {
        return ResponseEntity.ok(employeeService.getMe());
    }

    @PostMapping("/me")
    public ResponseEntity<EmployeeDto> updateMyProfile(
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "personalTaxId", required = false) String personalTaxId,
            @RequestParam(value = "idNumber", required = false) String idNumber,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "newPassword", required = false) String newPassword,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar
    ) throws IOException, java.io.IOException {
        EmployeeDto updatedProfile = employeeService.updateMe(phoneNumber, personalTaxId, idNumber, address, newPassword, avatar);
        return ResponseEntity.ok(updatedProfile);
    }
}