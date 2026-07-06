package com.apurv.workspace.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apurv.auth.entity.User;
import com.apurv.auth.repository.UserRepository;
import com.apurv.common.exception.DuplicateResourceException;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.workspace.dto.InviteMemberRequest;
import com.apurv.workspace.dto.MemberResponse;
import com.apurv.workspace.entity.Workspace;
import com.apurv.workspace.entity.WorkspaceMember;
import com.apurv.workspace.entity.WorkspaceRole;
import com.apurv.workspace.repository.WorkspaceMemberRepository;

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
public class WorkspaceMemberService {

    private final WorkspaceService workspaceService;
    private final WorkspaceAuthorizationService workspaceAuthorizationService;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public MemberResponse inviteMember(UUID workspaceId, InviteMemberRequest request, User currentUser) {
        Workspace workspace = getWorkspace(workspaceId);

        workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN);

        User invitedUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, invitedUser.getId())) {
            throw new DuplicateResourceException("User is already a member of the workspace");
        }

        WorkspaceMember workspaceMember = new WorkspaceMember();
        workspaceMember.setWorkspace(workspace);
        workspaceMember.setUser(invitedUser);
        workspaceMember.setRole(request.getRole());
        workspaceMember.setInvitedBy(currentUser);
        WorkspaceMember savedWorkspaceMember = workspaceMemberRepository.save(workspaceMember);

        log.info("User with id {} invited to workspace {} by user {}", invitedUser.getId(), workspaceId,
                currentUser.getId());
        MemberResponse response = toMemberResponse(savedWorkspaceMember);
        eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.WORKSPACE_MEMBER,
                ActionType.CREATED, response, currentUser.getId().toString()));
        return response;
    }

    @Transactional
    public void removeMember(UUID workspaceId, UUID userId, User currentUser) {
        Workspace workspace = getWorkspace(workspaceId);

        if (workspace.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot remove the workspace owner from the workspace");
        }

        if (!currentUser.getId().equals(userId)) {
            workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN);
        }

        WorkspaceMember workspaceMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in the workspace"));

        workspaceMemberRepository.delete(workspaceMember);
        log.info("User with id {} removed from workspace {} by user {}", userId, workspaceId, currentUser.getId());
        eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.WORKSPACE_MEMBER,
                ActionType.DELETED, new DeletedPayload(userId), currentUser.getId().toString()));
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getMembers(UUID workspaceId, User currentUser) {
        getWorkspace(workspaceId);

        workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN);

        List<WorkspaceMember> workspaceMembers = workspaceMemberRepository
                .findAllByWorkspaceIdOrderByJoinedAt(workspaceId);
        return workspaceMembers.stream()
                .map(this::toMemberResponse)
                .collect(Collectors.toList());
    }

    private Workspace getWorkspace(UUID id) {
        return workspaceService.getWorkspace(id, "Workspace not found");
    }

    private MemberResponse toMemberResponse(WorkspaceMember workspaceMember) {
        return MemberResponse.builder()
                .userId(workspaceMember.getUser().getId())
                .username(workspaceMember.getUser().getUsername())
                .email(workspaceMember.getUser().getEmail())
                .role(workspaceMember.getRole())
                .joinedAt(workspaceMember.getJoinedAt())
                .workspaceId(workspaceMember.getWorkspace().getId())
                .build();
    }

}
