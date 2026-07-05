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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apurv.auth.entity.User;
import com.apurv.common.dto.ApiResponse;
import com.apurv.workspace.dto.WorkspaceRequest;
import com.apurv.workspace.dto.WorkspaceResponse;
import com.apurv.workspace.service.WorkspaceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

        private final WorkspaceService workspaceService;

        @PostMapping
        public ResponseEntity<ApiResponse<WorkspaceResponse>> createWorkspace(
                        @Valid @RequestBody WorkspaceRequest request,
                        @AuthenticationPrincipal User currentUser) {

                WorkspaceResponse response = workspaceService.createWorkspace(
                                request,
                                currentUser);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Workspace created", response));
        }

        @GetMapping
        public ResponseEntity<ApiResponse<List<WorkspaceResponse>>> getAllWorkspaces(
                        @AuthenticationPrincipal User currentUser) {

                List<WorkspaceResponse> response = workspaceService.getAllWorkspaces(
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Workspaces fetched", response));
        }

        @GetMapping("/{workspaceId}")
        public ResponseEntity<ApiResponse<WorkspaceResponse>> getWorkspaceById(
                        @PathVariable UUID workspaceId,
                        @AuthenticationPrincipal User currentUser) {

                WorkspaceResponse response = workspaceService.getWorkspaceById(
                                workspaceId,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Workspace fetched", response));
        }

        @PutMapping("/{workspaceId}")
        public ResponseEntity<ApiResponse<WorkspaceResponse>> updateWorkspace(
                        @PathVariable UUID workspaceId,
                        @Valid @RequestBody WorkspaceRequest request,
                        @AuthenticationPrincipal User currentUser) {

                WorkspaceResponse response = workspaceService.updateWorkspace(
                                workspaceId,
                                request,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Workspace updated", response));
        }

        @DeleteMapping("/{workspaceId}")
        public ResponseEntity<ApiResponse<Void>> deleteWorkspace(
                        @PathVariable UUID workspaceId,
                        @AuthenticationPrincipal User currentUser) {

                workspaceService.deleteWorkspace(
                                workspaceId,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Workspace deleted", null));
        }

}
