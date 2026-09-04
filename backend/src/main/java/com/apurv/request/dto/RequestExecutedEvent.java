package com.apurv.request.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestExecutedEvent {

    private UUID eventId;
    private String executionId;
    private Instant executedAt;

    private UUID workspaceId;
    private UUID userId;

    private String method;
    private String url;
    private String targetHost;

    private int statusCode;
    private long durationMs;
    private boolean success;
    private String errorType;
    private String errorMessage;

    private Long responseSizeBytes;

}
