package com.apurv.environment.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apurv.auth.entity.User;
import com.apurv.collection.entity.Collection;
import com.apurv.collection.repository.CollectionRepository;
import com.apurv.common.exception.DuplicateResourceException;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.environment.dto.EnvironmentRequest;
import com.apurv.environment.dto.EnvironmentResponse;
import com.apurv.environment.entity.Environment;
import com.apurv.environment.repository.EnvironmentRepository;
import com.apurv.workspace.entity.Workspace;
import com.apurv.workspace.entity.WorkspaceRole;
import com.apurv.workspace.repository.WorkspaceRepository;
import com.apurv.workspace.service.WorkspaceAuthorizationService;

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
public class EnvironmentService {

        private final EnvironmentRepository environmentRepository;
        private final WorkspaceAuthorizationService workspaceAuthorizationService;
        private final CollectionRepository collectionRepository;
        private final WorkspaceRepository workspaceRepository;
        private final ApplicationEventPublisher eventPublisher;

        @Transactional
        public EnvironmentResponse createEnvironment(UUID workspaceId, UUID collectionId, EnvironmentRequest request,
                        User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(),
                                WorkspaceRole.ADMIN,
                                WorkspaceRole.MEMBER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");
                if (environmentRepository.existsByNameAndCollection(request.getName(), collection)) {
                        throw new DuplicateResourceException(
                                        "Environment with this name already exists");
                }

                Environment environment = Environment.builder()
                                .name(request.getName())
                                .environmentColor(request.getEnvironmentColor())
                                .collection(collection)
                                .build();
                Environment savedEnvironment = environmentRepository.saveAndFlush(environment);

                log.info("Created environment with Id: {} in Collection: {} in Workspace: {}", savedEnvironment.getId(),
                                collectionId,
                                workspaceId);
                EnvironmentResponse response = toEnvironmentResponse(savedEnvironment);
                eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.ENVIRONMENT,
                                ActionType.CREATED, response, currentUser.getId().toString()));
                return response;
        }

        @Transactional(readOnly = true)
        public List<EnvironmentResponse> getAllEnvironments(UUID workspaceId, UUID collectionId, User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(),
                                WorkspaceRole.ADMIN,
                                WorkspaceRole.MEMBER, WorkspaceRole.VIEWER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");
                return environmentRepository.findByCollection(collection)
                                .stream()
                                .map(this::toEnvironmentResponse)
                                .toList();
        }

        @Transactional
        public EnvironmentResponse updateEnvironment(UUID workspaceId, UUID collectionId, UUID environmentId,
                        EnvironmentRequest request,
                        User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(),
                                WorkspaceRole.ADMIN,
                                WorkspaceRole.MEMBER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");
                Environment environment = findEnvironmentByIdAndCollection(environmentId, collection,
                                "Environment not found");

                if (!environment.getName().equals(request.getName())
                                && environmentRepository.existsByNameAndCollection(request.getName(), collection)) {
                        throw new DuplicateResourceException(
                                        "Environment with this name already exists");
                }

                environment.setName(request.getName());
                environment.setEnvironmentColor(request.getEnvironmentColor());
                Environment updatedEnvironment = environmentRepository.saveAndFlush(environment);

                log.info("Updated environment with Id: {} in Collection: {} in Workspace: {}",
                                updatedEnvironment.getId(),
                                collectionId,
                                workspaceId);
                EnvironmentResponse response = toEnvironmentResponse(updatedEnvironment);
                eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.ENVIRONMENT,
                                ActionType.UPDATED, response, currentUser.getId().toString()));
                return response;
        }

        @Transactional
        public void deleteEnvironment(UUID workspaceId, UUID collectionId, UUID environmentId, User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(),
                                WorkspaceRole.ADMIN,
                                WorkspaceRole.MEMBER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");
                Environment environment = findEnvironmentByIdAndCollection(environmentId, collection,
                                "Environment not found");
                environmentRepository.delete(environment);
                log.info("Deleted environment with Id: {} in Collection: {} in Workspace: {}", environmentId,
                                collectionId, workspaceId);
                eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.ENVIRONMENT,
                                ActionType.DELETED, new DeletedPayload(environmentId), currentUser.getId().toString()));
        }

        @Transactional(readOnly = true)
        protected Workspace findWorkspaceById(UUID workspaceId, String notFoundMessage) {
                return workspaceRepository.findById(workspaceId)
                                .orElseThrow(() -> new ResourceNotFoundException(notFoundMessage));
        }

        @Transactional(readOnly = true)
        protected Collection findCollectionByIdAndWorkspace(UUID collectionId, Workspace workspace,
                        String notFoundMessage) {
                return collectionRepository.findByIdAndWorkspace(collectionId, workspace)
                                .orElseThrow(() -> new ResourceNotFoundException(notFoundMessage));
        }

        @Transactional(readOnly = true)
        protected Environment findEnvironmentByIdAndCollection(UUID environmentId, Collection collection,
                        String notFoundMessage) {
                return environmentRepository.findByIdAndCollection(environmentId, collection)
                                .orElseThrow(() -> new ResourceNotFoundException(notFoundMessage));
        }

        protected EnvironmentResponse toEnvironmentResponse(Environment environment) {
                return EnvironmentResponse.builder()
                                .id(environment.getId())
                                .name(environment.getName())
                                .environmentColor(environment.getEnvironmentColor())
                                .createdAt(environment.getCreatedAt())
                                .updatedAt(environment.getUpdatedAt())
                                .collectionId(environment.getCollection().getId())
                                .build();
        }

}
