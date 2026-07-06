package com.apurv.workspace.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apurv.workspace.entity.WorkspaceRole;
import com.apurv.auth.entity.User;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.workspace.dto.WorkspaceRequest;
import com.apurv.workspace.dto.WorkspaceResponse;
import com.apurv.workspace.entity.Workspace;
import com.apurv.workspace.entity.WorkspaceMember;
import com.apurv.workspace.repository.WorkspaceMemberRepository;
import com.apurv.workspace.repository.WorkspaceRepository;

import org.springframework.context.ApplicationEventPublisher;
import com.apurv.collaboration.event.EntityMutatedEvent;
import com.apurv.collaboration.dto.EntityType;
import com.apurv.collaboration.dto.ActionType;
import com.apurv.collaboration.dto.DeletedPayload;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceAuthorizationService workspaceAuthorizationService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public WorkspaceResponse createWorkspace(WorkspaceRequest request, User currentUser) {
        Workspace workspace = new Workspace();
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setOwner(currentUser);
        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMember workspaceMember = new WorkspaceMember();
        workspaceMember.setWorkspace(savedWorkspace);
        workspaceMember.setUser(currentUser);
        workspaceMember.setRole(WorkspaceRole.ADMIN);
        workspaceMemberRepository.save(workspaceMember);

        log.info("Workspace with id {} created by user {}", savedWorkspace.getId(), currentUser.getId());
        return toWorkspaceResponse(savedWorkspace, 1);
    }

    @Transactional
    public WorkspaceResponse createDefaultWorkspace(User user) {
        Workspace workspace = new Workspace();
        workspace.setName(user.getUsername() + "'s workspace");
        workspace.setDescription("Default workspace for user " + user.getUsername());
        workspace.setOwner(user);
        workspace.setDefault(true);
        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMember workspaceMember = new WorkspaceMember();
        workspaceMember.setWorkspace(savedWorkspace);
        workspaceMember.setUser(user);
        workspaceMember.setRole(WorkspaceRole.ADMIN);
        workspaceMemberRepository.save(workspaceMember);

        log.info("Default workspace with id {} created for user {}", savedWorkspace.getId(), user.getId());
        return toWorkspaceResponse(savedWorkspace, 1);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> getAllWorkspaces(User currentUser) {
        List<Workspace> workspaces = workspaceRepository.findAllByMembersId(currentUser.getId());
        return workspaces.stream().map(workspace -> {
            int memberCount = workspaceMemberRepository.countByWorkspaceId(workspace.getId());
            return toWorkspaceResponse(workspace, memberCount);
        }).toList();
    }

    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspaceById(UUID workspaceId, User currentUser) {
        Workspace workspace = getWorkspace(workspaceId, "Workspace not found");

        workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN,
                WorkspaceRole.MEMBER, WorkspaceRole.VIEWER);

        int memberCount = workspaceMemberRepository.countByWorkspaceId(workspace.getId());
        return toWorkspaceResponse(workspace, memberCount);
    }

    @Transactional
    public WorkspaceResponse updateWorkspace(UUID workspaceId, WorkspaceRequest request, User currentUser) {
        Workspace workspace = getWorkspace(workspaceId, "Workspace not found");

        workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN);

        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        Workspace updatedWorkspace = workspaceRepository.save(workspace);

        log.info("Workspace with id {} updated by user {}", workspaceId, currentUser.getId());
        int memberCount = workspaceMemberRepository.countByWorkspaceId(updatedWorkspace.getId());
        WorkspaceResponse response = toWorkspaceResponse(updatedWorkspace, memberCount);
        eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.WORKSPACE,
                ActionType.UPDATED, response, currentUser.getId().toString()));
        return response;
    }

    @Transactional
    public void deleteWorkspace(UUID workspaceId, User currentUser) {
        Workspace workspace = getWorkspace(workspaceId, "Workspace not found");

        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only the workspace owner can delete the workspace");
        }

        if (workspace.isDefault()) {
            throw new IllegalArgumentException("Default workspace cannot be deleted");
        }

        workspaceRepository.delete(workspace);
        log.info("Workspace with id {} deleted by user {}", workspaceId, currentUser.getId());
        eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.WORKSPACE,
                ActionType.DELETED, new DeletedPayload(workspaceId), currentUser.getId().toString()));
    }

    protected Workspace getWorkspace(UUID id, String errorMessage) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(errorMessage));
    }

    private WorkspaceResponse toWorkspaceResponse(Workspace workspace, int memberCount) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .description(workspace.getDescription())
                .ownerUsername(workspace.getOwner().getUsername())
                .memberCount(memberCount)
                .isDefault(workspace.isDefault())
                .createdAt(workspace.getCreatedAt())
                .updatedAt(workspace.getUpdatedAt())
                .build();
    }

}
