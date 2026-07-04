package com.apurv.collection.service;

import java.util.List;
import java.util.UUID;

import com.apurv.auth.entity.User;
import com.apurv.collection.dto.CollectionRequest;
import com.apurv.collection.dto.CollectionResponse;
import com.apurv.collection.entity.Collection;
import com.apurv.common.exception.DuplicateResourceException;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.workspace.entity.Workspace;
import com.apurv.workspace.entity.WorkspaceRole;
import com.apurv.workspace.repository.WorkspaceRepository;
import com.apurv.workspace.service.WorkspaceAuthorizationService;
import com.apurv.collection.repository.CollectionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceAuthorizationService workspaceAuthorizationService;

    @Transactional
    public CollectionResponse createCollection(UUID workspaceId, CollectionRequest request, User currentUser) {
        Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

        workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN);

        if (collectionRepository.existsByNameAndWorkspace(request.getName(), workspace)) {
            throw new DuplicateResourceException("Collection with this name already exists in the workspace");
        }

        Collection collection = Collection.builder()
                .name(request.getName())
                .description(request.getDescription())
                .workspace(workspace)
                .build();
        Collection savedCollection = collectionRepository.saveAndFlush(collection);

        log.info("Created new collection with ID: {} in workspace: {}", savedCollection.getId(), workspace.getId());
        return toCollectionResponse(savedCollection);
    }

    @Transactional(readOnly = true)
    public List<CollectionResponse> getAllCollections(UUID workspaceId, User currentUser) {
        Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

        workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN,
                WorkspaceRole.MEMBER, WorkspaceRole.VIEWER);

        return collectionRepository.findByWorkspace(workspace)
                .stream()
                .map(this::toCollectionResponse)
                .toList();
    }

    @Transactional
    public CollectionResponse updateCollection(UUID workspaceId, UUID collectionId, CollectionRequest request,
            User currentUser) {
        Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

        workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN);

        Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");

        if (!collection.getName().equals(request.getName())
                && collectionRepository.existsByNameAndWorkspace(request.getName(), workspace)) {
            throw new DuplicateResourceException("Collection with this name already exists in the workspace");
        }

        collection.setName(request.getName());
        collection.setDescription(request.getDescription());
        Collection updatedCollection = collectionRepository.saveAndFlush(collection);

        log.info("Updated collection with ID: {} in workspace: {}", updatedCollection.getId(), workspace.getId());
        return toCollectionResponse(updatedCollection);
    }

    @Transactional
    public void deleteCollection(UUID workspaceId, UUID collectionId, User currentUser) {
        Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

        workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN);

        Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");
        collectionRepository.delete(collection);

        log.info("Deleted collection with ID: {} in workspace: {}", collection.getId(), workspace.getId());
    }

    @Transactional(readOnly = true)
    protected Workspace findWorkspaceById(UUID workspaceId, String errorMessage) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(errorMessage));
    }

    @Transactional(readOnly = true)
    protected Collection findCollectionByIdAndWorkspace(UUID collectionId, Workspace workspace, String errorMessage) {
        return collectionRepository.findByIdAndWorkspace(collectionId, workspace)
                .orElseThrow(() -> new ResourceNotFoundException(errorMessage));
    }

    protected CollectionResponse toCollectionResponse(Collection collection) {
        return CollectionResponse.builder()
                .id(collection.getId())
                .name(collection.getName())
                .description(collection.getDescription())
                .createdAt(collection.getCreatedAt())
                .updatedAt(collection.getUpdatedAt())
                .build();
    }

}
