package com.apurv.environment.controller;

import java.util.UUID;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apurv.auth.entity.User;
import com.apurv.common.dto.ApiResponse;
import com.apurv.environment.dto.VariableRequest;
import com.apurv.environment.dto.VariableResponse;
import com.apurv.environment.service.EnvironmentVariableService;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/collections/{collectionId}/environments/{environmentId}/variables")
@RequiredArgsConstructor
public class EnvironmentVariableController {

        private final EnvironmentVariableService environmentVariableService;

        @PostMapping()
        public ResponseEntity<ApiResponse<VariableResponse>> addVariable(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @PathVariable UUID environmentId,
                        @Valid @RequestBody VariableRequest request,
                        @AuthenticationPrincipal User currentUser) {

                VariableResponse response = environmentVariableService.addVariable(workspaceId, collectionId,
                                environmentId, request,
                                currentUser);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Variable created successfully", response));
        }

        @PutMapping("/{variableId}")
        public ResponseEntity<ApiResponse<VariableResponse>> updateVariable(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @PathVariable UUID environmentId,
                        @PathVariable UUID variableId,
                        @Valid @RequestBody VariableRequest request,
                        @AuthenticationPrincipal User currentUser) {

                VariableResponse response = environmentVariableService.updateVariable(workspaceId, collectionId,
                                environmentId,
                                variableId,
                                request,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Variable updated successfully", response));
        }

        @DeleteMapping("/{variableId}")
        public ResponseEntity<ApiResponse<Void>> deleteVariable(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @PathVariable UUID environmentId,
                        @PathVariable UUID variableId,
                        @AuthenticationPrincipal User currentUser) {

                environmentVariableService.deleteVariable(workspaceId, collectionId, environmentId, variableId,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Variable deleted successfully", null));
        }

        @GetMapping
        public ResponseEntity<ApiResponse<List<VariableResponse>>> getVariables(
                        @PathVariable UUID workspaceId,
                        @PathVariable UUID collectionId,
                        @PathVariable UUID environmentId,
                        @AuthenticationPrincipal User currentUser) {

                List<VariableResponse> response = environmentVariableService.getVariables(
                                workspaceId,
                                collectionId,
                                environmentId,
                                currentUser);
                return ResponseEntity.ok(ApiResponse.success("Variables fetched successfully", response));
        }
}
