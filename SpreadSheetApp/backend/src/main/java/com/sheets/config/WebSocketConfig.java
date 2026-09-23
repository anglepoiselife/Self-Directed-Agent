package com.sheets.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new CellWebSocketHandler(), "/ws/cells")
                .setAllowedOrigins("*");
    }

    public static class CellWebSocketHandler extends TextWebSocketHandler {

        private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
        private final ObjectMapper objectMapper = new ObjectMapper();

        @Override
        public void afterConnectionEstablished(WebSocketSession session) {
            sessions.put(session.getId(), session);
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) {
            sessions.remove(session.getId());
        }

        public void broadcast(Object message) {
            try {
                String json = objectMapper.writeValueAsString(message);
                for (WebSocketSession session : sessions.values()) {
                    if (session.isOpen()) {
                        session.sendMessage(new org.springframework.web.socket.TextMessage(json));
                    }
                }
            } catch (IOException e) {
                // Log and continue - don't let one bad session break the broadcast
            }
        }

        public int getConnectedClients() {
            return sessions.size();
        }
    }
}