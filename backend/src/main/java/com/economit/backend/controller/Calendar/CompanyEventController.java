package com.economit.backend.controller.Calendar;

import com.economit.backend.dto.Calendar.CompanyEventDto;
import com.economit.backend.service.Calendar.CompanyEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class CompanyEventController {

    private final CompanyEventService eventService;

    @GetMapping
    public ResponseEntity<List<CompanyEventDto>> getAll() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping
    public ResponseEntity<CompanyEventDto> create(@RequestBody CompanyEventDto request) {
        return ResponseEntity.ok(eventService.createEvent(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}