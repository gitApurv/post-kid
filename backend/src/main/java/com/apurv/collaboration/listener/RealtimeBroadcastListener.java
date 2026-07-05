package com.apurv.collaboration.listener;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.apurv.collaboration.event.EntityMutatedEvent;
import com.apurv.collaboration.service.RealtimeEventPublisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class RealtimeBroadcastListener {

    private final RealtimeEventPublisher realtimeEventPublisher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEntityMutated(EntityMutatedEvent event) {
        try {
            realtimeEventPublisher.publish(
                    event.getWorkspaceId(),
                    event.getEntityType(),
                    event.getAction(),
                    event.getPayload(),
                    event.getActorId());
        } catch (Exception e) {
            log.error("Failed to broadcast realtime event for workspace {}: {}", event.getWorkspaceId(), e.getMessage(),
                    e);
        }
    }
}
