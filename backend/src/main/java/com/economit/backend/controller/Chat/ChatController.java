package com.economit.backend.controller.Chat;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.economit.backend.model.ChatMessage;
import com.economit.backend.service.Chat.ChatService;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    // WebSocket Endpoint: Λαμβάνει μήνυμα από τον Client
    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        ChatMessage saved = chatService.save(chatMessage);
        messagingTemplate.convertAndSend("/topic/messages/" + chatMessage.getRecipientId(), saved);
        messagingTemplate.convertAndSend("/topic/messages/" + chatMessage.getSenderId(), saved);
    }

    // REST Endpoint: Φέρνει το ιστορικό μηνυμάτων (για όταν ανοίγεις το chat)
    @GetMapping("/api/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessage>> findChatMessages(
            @PathVariable String senderId,
            @PathVariable String recipientId) {
        return ResponseEntity.ok(chatService.findChatMessages(senderId, recipientId));
    }
}