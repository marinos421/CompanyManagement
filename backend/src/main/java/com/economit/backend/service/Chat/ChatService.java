package com.economit.backend.service.Chat;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.economit.backend.model.ChatMessage;
import com.economit.backend.repository.Chat.ChatRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;

    public ChatMessage save(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return chatRepository.save(message);
    }

    // Επιστρέφει τη συνομιλία μεταξύ δύο χρηστών
    public List<ChatMessage> findChatMessages(String senderId, String recipientId) {
        // Φέρνουμε όλα τα μηνύματα που εμπλέκουν τον χρήστη A
        // Και μετά φιλτράρουμε αυτά που εμπλέκουν και τον χρήστη B
        // (Αυτός είναι απλοϊκός τρόπος, θα το βελτιώσουμε με SQL αν χρειαστεί)
        
        List<ChatMessage> allMessages = chatRepository.findBySenderIdOrRecipientIdOrderByTimestampAsc(senderId, senderId);
        
        return allMessages.stream()
                .filter(msg -> 
                    (msg.getSenderId().equals(senderId) && msg.getRecipientId().equals(recipientId)) ||
                    (msg.getSenderId().equals(recipientId) && msg.getRecipientId().equals(senderId))
                )
                .collect(Collectors.toList());
    }
}