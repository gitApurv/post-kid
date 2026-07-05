package com.apurv.collaboration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollaborationEvent<T> {

    private EntityType entityType;
    private ActionType action;
    private String workspaceId;
    private T payload;
    private String timestamp;
    private String actorId;

}
