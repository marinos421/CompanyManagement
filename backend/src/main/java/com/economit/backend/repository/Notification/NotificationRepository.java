package com.economit.backend.repository.Notification;
import com.economit.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Φέρε τα μη διαβασμένα του χρήστη, ταξινομημένα από το πιο πρόσφατο
    List<Notification> findByRecipientEmailAndIsReadFalseOrderByTimestampDesc(String email);
    
    // Φέρε όλα (ιστορικό)
    List<Notification> findByRecipientEmailOrderByTimestampDesc(String email);
}