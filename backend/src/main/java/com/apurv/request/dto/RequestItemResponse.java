package com.apurv.request.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import com.apurv.request.entity.HttpMethod;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RequestItemResponse {

    private UUID id;
    private String name;
    private HttpMethod method;
    private String url;
    private Map<String, String> headers;
    private String body;
    private String authType;
    private Map<String, String> authValue;
    private Integer timeoutMs;
    private String createdBy;
    private String updatedBy;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID collectionId;
    private UUID folderId;

}
