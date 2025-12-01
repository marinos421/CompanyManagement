package com.economit.backend.service.Calendar;

import com.economit.backend.dto.Calendar.CompanyEventDto;
import com.economit.backend.model.*;
import com.economit.backend.repository.Calendar.CompanyEventRepository;
import com.economit.backend.repository.Auth.UserRepository; // Τσέκαρε αν το UserRepository είναι στο Auth
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyEventService {

    private final CompanyEventRepository eventRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public List<CompanyEventDto> getAllEvents() {
        User user = getCurrentUser();
        return eventRepository.findByCompanyIdOrderByStartTimeAsc(user.getCompany().getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CompanyEventDto createEvent(CompanyEventDto request) {
        User user = getCurrentUser();

        if (user.getRole() != Role.COMPANY_ADMIN) {
            throw new RuntimeException("Only Admins can create company events");
        }

        CompanyEvent event = CompanyEvent.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .type(request.getType())
                .company(user.getCompany())
                .build();

        return mapToDto(eventRepository.save(event));
    }

    public void deleteEvent(Long id) {
        User user = getCurrentUser();
        CompanyEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (user.getRole() != Role.COMPANY_ADMIN || !event.getCompany().getId().equals(user.getCompany().getId())) {
            throw new RuntimeException("Not authorized to delete this event");
        }

        eventRepository.delete(event);
    }

    private CompanyEventDto mapToDto(CompanyEvent e) {
        return CompanyEventDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .location(e.getLocation())
                .type(e.getType())
                .build();
    }
}