package com.apurv.collaboration.event;

import org.springframework.context.ApplicationEvent;

import com.apurv.collaboration.dto.ActionType;
import com.apurv.collaboration.dto.EntityType;

import lombok.Getter;

@Getter
public class EntityMutatedEvent extends ApplicationEvent {
    private final String workspaceId;
    private final EntityType entityType;
    private final ActionType action;
    private final Object payload;
    private final String actorId;

    public EntityMutatedEvent(Object source, String workspaceId, EntityType entityType, ActionType action,
            Object payload, String actorId) {
        super(source);
        this.workspaceId = workspaceId;
        this.entityType = entityType;
        this.action = action;
        this.payload = payload;
        this.actorId = actorId;
    }
}
