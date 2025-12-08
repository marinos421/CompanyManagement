package com.economit.backend.controller.Workforce;

import com.economit.backend.model.Workforce.TaskAttachment;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8080")  
public class AttachmentController {

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> getAttachment(@PathVariable Long id) {

        TaskAttachment attachment = entityManager.find(TaskAttachment.class, id);

        if (attachment == null) {
            return ResponseEntity.notFound().build();
        }

        // Προσπάθησε να χρησιμοποιήσεις το πραγματικό MIME type (image/png, image/jpeg κλπ)
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (attachment.getFileType() != null && !attachment.getFileType().isBlank()) {
            try {
                mediaType = MediaType.parseMediaType(attachment.getFileType());
            } catch (Exception ignored) {
                // αν είναι χαλασμένο mime type, μένουμε στο octet-stream
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                // inline για να μπορεί ο browser να το κάνει preview
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + attachment.getFileName() + "\""
                )
                .body(attachment.getData());
    }
}
