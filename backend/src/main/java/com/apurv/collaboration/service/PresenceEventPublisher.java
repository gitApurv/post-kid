package com.apurv.collaboration.service;

import java.time.Instant;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.apurv.collaboration.dto.PresenceEvent;
import com.apurv.collaboration.dto.PresenceEventStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publish(String workspaceId, String userId, PresenceEventStatus status) {
        PresenceEvent event = PresenceEvent.builder()
                .userId(userId)
                .status(status)
                .timestamp(Instant.now().toString())
                .build();

        try {
            messagingTemplate.convertAndSend("/topic/workspace/" + workspaceId + "/presence", event);
        } catch (Exception e) {
            log.error("Failed to broadcast presence event for workspace {}: {}", workspaceId, e.getMessage(), e);
        }
    }
}