package com.apurv.environment.service;

import java.util.UUID;
import java.util.List;

import org.springframework.stereotype.Service;

import com.apurv.auth.entity.User;
import com.apurv.collection.entity.Collection;
import com.apurv.common.exception.DuplicateResourceException;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.environment.dto.VariableRequest;
import com.apurv.environment.dto.VariableResponse;
import com.apurv.environment.entity.Environment;
import com.apurv.environment.entity.EnvironmentVariable;
import com.apurv.environment.repository.EnvironmentVariableRepository;
import com.apurv.workspace.entity.Workspace;
import com.apurv.workspace.entity.WorkspaceRole;
import com.apurv.workspace.service.WorkspaceAuthorizationService;

import org.springframework.context.ApplicationEventPublisher;
import com.apurv.collaboration.event.EntityMutatedEvent;
import com.apurv.collaboration.dto.EntityType;
import com.apurv.collaboration.dto.ActionType;
import com.apurv.collaboration.dto.DeletedPayload;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnvironmentVariableService {

        private final EnvironmentService environmentService;
        private final EnvironmentVariableRepository environmentVariableRepository;
        private final WorkspaceAuthorizationService workspaceAuthorizationService;
        private final ApplicationEventPublisher eventPublisher;

        @Transactional
        public VariableResponse addVariable(UUID workspaceId, UUID collectionId, UUID environmentId,
                        VariableRequest request,
                        User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(),
                                WorkspaceRole.ADMIN, WorkspaceRole.MEMBER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace,
                                "Collection not found");

                Environment environment = findEnvironmentByIdAndCollection(environmentId, collection,
                                "Environment not found");

                if (environmentVariableRepository.existsByKeyAndEnvironment(request.getKey(), environment)) {
                        throw new DuplicateResourceException(
                                        "Variable with this key already exists in the environment");
                }

                EnvironmentVariable variable = EnvironmentVariable.builder()
                                .key(request.getKey())
                                .value(request.getValue())
                                .environment(environment)
                                .build();
                EnvironmentVariable savedVariable = environmentVariableRepository.saveAndFlush(variable);

                log.info("Added variable with Id: {} in Environment: {} in Collection: {} in Workspace: {}",
                                savedVariable.getId(),
                                environmentId,
                                collectionId,
                                workspaceId);

                VariableResponse response = toVariableResponse(savedVariable);
                eventPublisher.publishEvent(
                                new EntityMutatedEvent(this, workspaceId.toString(), EntityType.ENVIRONMENT_VARIABLE,
                                                ActionType.CREATED, response, currentUser.getId().toString()));
                return response;
        }

        @Transactional
        public VariableResponse updateVariable(UUID workspaceId, UUID collectionId, UUID environmentId, UUID variableId,
                        VariableRequest request,
                        User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(),
                                WorkspaceRole.ADMIN, WorkspaceRole.MEMBER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace,
                                "Collection not found");

                Environment environment = findEnvironmentByIdAndCollection(environmentId, collection,
                                "Environment not found");

                EnvironmentVariable variable = findVariableByIdAndEnvironment(variableId, environment,
                                "Variable not found");

                if (!variable.getKey().equals(request.getKey()) && environmentVariableRepository
                                .existsByKeyAndEnvironment(request.getKey(), environment)) {
                        throw new DuplicateResourceException(
                                        "Variable with this key already exists in the environment");
                }

                variable.setKey(request.getKey());
                variable.setValue(request.getValue());
                EnvironmentVariable updatedVariable = environmentVariableRepository.saveAndFlush(variable);

                log.info("Updated variable with Id: {} in Environment: {} in Collection: {} in Workspace: {}",
                                updatedVariable.getId(),
                                environmentId,
                                collectionId,
                                workspaceId);
                VariableResponse response = toVariableResponse(updatedVariable);
                eventPublisher.publishEvent(
                                new EntityMutatedEvent(this, workspaceId.toString(), EntityType.ENVIRONMENT_VARIABLE,
                                                ActionType.UPDATED, response, currentUser.getId().toString()));
                return response;
        }

        @Transactional
        public void deleteVariable(UUID workspaceId, UUID collectionId, UUID environmentId, UUID variableId,
                        User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(),
                                WorkspaceRole.ADMIN, WorkspaceRole.MEMBER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace,
                                "Collection not found");

                Environment environment = findEnvironmentByIdAndCollection(environmentId, collection,
                                "Environment not found");

                EnvironmentVariable variable = findVariableByIdAndEnvironment(variableId, environment,
                                "Variable not found");

                environmentVariableRepository.delete(variable);
                log.info("Deleted variable with Id: {} from Environment: {} in Collection: {} in Workspace: {}",
                                variableId,
                                environmentId,
                                collectionId,
                                workspaceId);
                eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(),
                                EntityType.ENVIRONMENT_VARIABLE, ActionType.DELETED, new DeletedPayload(variableId),
                                currentUser.getId().toString()));
        }

        protected Workspace findWorkspaceById(UUID workspaceId, String notFoundMessage) {
                return environmentService.findWorkspaceById(workspaceId, notFoundMessage);
        }

        protected Collection findCollectionByIdAndWorkspace(UUID collectionId, Workspace workspace,
                        String notFoundMessage) {
                return environmentService.findCollectionByIdAndWorkspace(collectionId, workspace, notFoundMessage);
        }

        protected Environment findEnvironmentByIdAndCollection(UUID environmentId, Collection collection,
                        String notFoundMessage) {
                return environmentService.findEnvironmentByIdAndCollection(environmentId, collection, notFoundMessage);
        }

        @Transactional
        public List<VariableResponse> getVariables(UUID workspaceId, UUID collectionId, UUID environmentId,
                        User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");
                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(),
                                WorkspaceRole.ADMIN, WorkspaceRole.MEMBER, WorkspaceRole.VIEWER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");
                Environment environment = findEnvironmentByIdAndCollection(environmentId, collection,
                                "Environment not found");

                return environmentVariableRepository.findByEnvironment(environment).stream()
                                .map(this::toVariableResponse)
                                .toList();
        }

        protected EnvironmentVariable findVariableByIdAndEnvironment(UUID variableId, Environment environment,
                        String notFoundMessage) {
                return environmentVariableRepository.findByIdAndEnvironment(variableId, environment)
                                .orElseThrow(() -> new ResourceNotFoundException(notFoundMessage));
        }

        private VariableResponse toVariableResponse(EnvironmentVariable variable) {
                return VariableResponse.builder()
                                .id(variable.getId())
                                .key(variable.getKey())
                                .value(variable.getValue())
                                .environmentId(variable.getEnvironment().getId())
                                .build();
        }

}
