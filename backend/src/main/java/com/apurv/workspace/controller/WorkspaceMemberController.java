package com.apurv.workspace.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apurv.auth.entity.User;
import com.apurv.common.dto.ApiResponse;
import com.apurv.workspace.dto.InviteMemberRequest;
import com.apurv.workspace.dto.MemberResponse;
import com.apurv.workspace.service.WorkspaceMemberService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/members")
@RequiredArgsConstructor
public class WorkspaceMemberController {

        private final WorkspaceMemberService workspaceMemberService;

        @PostMapping
        public ResponseEntity<ApiResponse<MemberResponse>> inviteMember(
                        @PathVariable UUID workspaceId,
                        @Valid @RequestBody InviteMemberRequest request,
                        @AuthenticationPrincipal User currentUser) {

                MemberResponse response = workspaceMemberService.inviteMember(
                                workspaceId,
                                request,
                                currentUser);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Member invited", response));
        }

        @GetMapping
        public ResponseEntity<ApiResponse<List<MemberResponse>>> getMembers(
                        @PathVariable UUID workspaceId,
                        @AuthenticationPrincipal User currentUser) {

                List<MemberResponse> response = workspaceMemberService.getMembers(
                                workspaceId,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Members fetched", response));
        }

        @DeleteMapping("/{userId}")
        public ResponseEntity<ApiResponse<Void>> removeMember(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID userId,
                        @AuthenticationPrincipal User currentUser) {

                workspaceMemberService.removeMember(
                                workspaceId,
                                userId,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Member removed", null));
        }

        @DeleteMapping("/leave")
        public ResponseEntity<ApiResponse<Void>> leaveWorkspace(
                        @PathVariable UUID workspaceId,
                        @AuthenticationPrincipal User currentUser) {

                workspaceMemberService.removeMember(
                                workspaceId,
                                currentUser.getId(),
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Left workspace successfully", null));
        }

}
