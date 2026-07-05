package com.apurv.collaboration.service;

import java.time.Instant;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.apurv.collaboration.dto.ActionType;
import com.apurv.collaboration.dto.CollaborationEvent;
import com.apurv.collaboration.dto.EntityType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RealtimeEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public <T> void publish(String workspaceId, EntityType entityType, ActionType action, T payload, String actorId) {

        CollaborationEvent<T> event = CollaborationEvent.<T>builder()
                .entityType(entityType)
                .action(action)
                .workspaceId(workspaceId)
                .payload(payload)
                .timestamp(Instant.now().toString())
                .actorId(actorId)
                .build();

        messagingTemplate.convertAndSend("/topic/workspace/" + workspaceId, event);
    }
}
