package com.apurv.environment.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariableResponse {

    private UUID id;
    private String key;
    private String value;
    private UUID environmentId;

}
