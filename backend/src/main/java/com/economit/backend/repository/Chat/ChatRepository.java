package com.economit.backend.repository.Chat;

import org.springframework.data.jpa.repository.JpaRepository;

import com.economit.backend.model.ChatMessage;

import java.util.List;


public interface ChatRepository extends JpaRepository<ChatMessage, Long> {
 
    List<ChatMessage> findBySenderIdOrRecipientIdOrderByTimestampAsc(String senderId, String recipientId);
}