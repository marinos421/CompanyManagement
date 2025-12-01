package com.economit.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Εδώ συνδέεται το Frontend (Handshake)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Επιτρέπουμε σύνδεση από παντού (React)
                .withSockJS(); // Fallback αν ο browser δεν υποστηρίζει sockets
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefixes για δρομολόγηση μηνυμάτων
        registry.setApplicationDestinationPrefixes("/app"); // Όταν στέλνει ο Client
        registry.enableSimpleBroker("/user"); // Όταν στέλνει ο Server σε συγκεκριμένο χρήστη
        registry.setUserDestinationPrefix("/user"); // Για private messages
        registry.enableSimpleBroker("/topic"); 
    }
}