package com.apurv.workspace.dto;

import java.time.Instant;
import java.util.UUID;

import com.apurv.workspace.entity.WorkspaceRole;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberResponse {

    private UUID userId;
    private String username;
    private String email;
    private WorkspaceRole role;
    private Instant joinedAt;
    private UUID workspaceId;

}
