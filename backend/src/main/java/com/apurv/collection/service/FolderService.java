package com.apurv.collection.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apurv.auth.entity.User;
import com.apurv.collection.dto.FolderRequest;
import com.apurv.collection.dto.FolderResponse;
import com.apurv.collection.entity.Collection;
import com.apurv.collection.entity.Folder;
import com.apurv.collection.repository.FolderRepository;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.workspace.entity.Workspace;
import com.apurv.workspace.entity.WorkspaceRole;
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
public class FolderService {

        private final CollectionService collectionService;
        private final FolderRepository folderRepository;
        private final WorkspaceAuthorizationService workspaceAuthorizationService;
        private final ApplicationEventPublisher eventPublisher;

        @Transactional
        public FolderResponse createFolder(UUID workspaceId, UUID collectionId, FolderRequest request,
                        User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");

                Folder folder = Folder.builder()
                                .collection(collection)
                                .name(request.getName())
                                .parentFolder(null)
                                .build();
                Folder savedFolder = folderRepository.saveAndFlush(folder);

                log.info("Created new root folder with ID: {} in collection ID: {}", savedFolder.getId(),
                                collection.getId());
                FolderResponse response = toFolderResponse(savedFolder);
                eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.FOLDER,
                                ActionType.CREATED, response, currentUser.getId().toString()));
                return response;
        }

        @Transactional
        public FolderResponse createSubFolder(UUID workspaceId, UUID collectionId, UUID parentFolderId,
                        FolderRequest request, User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");

                Folder parent = findFolderByIdAndCollection(parentFolderId, collection, "Parent folder not found");

                Folder folder = Folder.builder()
                                .collection(collection)
                                .name(request.getName())
                                .parentFolder(parent)
                                .build();
                Folder savedFolder = folderRepository.saveAndFlush(folder);

                log.info("Created new subfolder with ID: {} under parent folder ID: {} in collection ID: {}",
                                savedFolder.getId(), parent.getId(), collection.getId());
                FolderResponse response = toFolderResponse(savedFolder);
                eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.FOLDER,
                                ActionType.CREATED, response, currentUser.getId().toString()));
                return response;
        }

        @Transactional(readOnly = true)
        public List<FolderResponse> getParentFolders(UUID workspaceId, UUID collectionId, User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN,
                                WorkspaceRole.MEMBER, WorkspaceRole.VIEWER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");

                return folderRepository.findByCollectionAndParentFolderIsNull(collection)
                                .stream()
                                .map(this::toFolderResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<FolderResponse> getSubFolders(UUID workspaceId, UUID collectionId, UUID folderId,
                        User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN,
                                WorkspaceRole.MEMBER, WorkspaceRole.VIEWER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");

                Folder folder = findFolderByIdAndCollection(folderId, collection, "Folder not found");

                return folderRepository.findByParentFolder(folder)
                                .stream()
                                .map(this::toFolderResponse)
                                .toList();
        }

        @Transactional
        public void deleteFolder(UUID workspaceId, UUID collectionId, UUID folderId, User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspaceId, currentUser.getId(), WorkspaceRole.ADMIN);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");
                Folder folder = findFolderByIdAndCollection(folderId, collection, "Folder not found");

                folderRepository.delete(folder);
                log.info("Deleted folder with ID: {} in collection ID: {}", folder.getId(),
                                collection.getId());
                eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.FOLDER,
                                ActionType.DELETED, new DeletedPayload(folderId), currentUser.getId().toString()));
        }

        @Transactional(readOnly = true)
        protected Workspace findWorkspaceById(UUID workspaceId, String errorMessage) {
                return collectionService.findWorkspaceById(workspaceId, errorMessage);
        }

        @Transactional(readOnly = true)
        protected Collection findCollectionByIdAndWorkspace(UUID collectionId, Workspace workspace,
                        String errorMessage) {
                return collectionService.findCollectionByIdAndWorkspace(collectionId, workspace, errorMessage);
        }

        @Transactional(readOnly = true)
        protected Folder findFolderByIdAndCollection(UUID folderId, Collection collection, String errorMessage) {
                return folderRepository.findByIdAndCollection(folderId, collection)
                                .orElseThrow(() -> new ResourceNotFoundException(errorMessage));
        }

        protected FolderResponse toFolderResponse(Folder savedFolder) {
                return FolderResponse.builder()
                                .id(savedFolder.getId())
                                .name(savedFolder.getName())
                                .createdAt(savedFolder.getCreatedAt())
                                .collectionId(savedFolder.getCollection().getId())
                                .parentFolderId(savedFolder.getParentFolder() != null
                                                ? savedFolder.getParentFolder().getId()
                                                : null)
                                .build();
        }

}
