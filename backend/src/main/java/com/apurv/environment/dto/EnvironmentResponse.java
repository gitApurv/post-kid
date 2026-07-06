package com.apurv.environment.dto;

import java.util.UUID;

import com.apurv.environment.entity.EnvironmentColor;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentResponse {

    private UUID id;
    private String name;
    private EnvironmentColor environmentColor;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID collectionId;

}
