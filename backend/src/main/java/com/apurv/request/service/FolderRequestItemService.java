package com.apurv.request.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apurv.auth.entity.User;
import com.apurv.collection.entity.Collection;
import com.apurv.collection.entity.Folder;
import com.apurv.collection.repository.FolderRepository;
import com.apurv.common.exception.ResourceNotFoundException;
import com.apurv.request.dto.RequestItemRequest;
import com.apurv.request.dto.RequestItemResponse;
import com.apurv.request.entity.RequestItem;
import com.apurv.request.repository.RequestItemRepository;
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
public class FolderRequestItemService {

        private final FolderRepository folderRepository;
        private final RequestItemRepository requestItemRepository;
        private final WorkspaceAuthorizationService workspaceAuthorizationService;
        private final CollectionRequestItemService collectionRequestItemService;
        private final ApplicationEventPublisher eventPublisher;

        @Transactional
        public RequestItemResponse createRequestItem(UUID workspaceId, UUID collectionId, UUID folderId,
                        RequestItemRequest request,
                        User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(), WorkspaceRole.ADMIN,
                                WorkspaceRole.MEMBER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");

                Folder folder = findFolderByIdAndCollection(folderId, collection, "Folder not found");

                RequestItem requestItem = RequestItem.builder()
                                .collection(collection)
                                .folder(folder)
                                .createdBy(currentUser)
                                .name(request.getName())
                                .method(request.getMethod())
                                .url(request.getUrl())
                                .body(request.getBody())
                                .headers(request.getHeaders())
                                .authType(request.getAuthType())
                                .authValue(request.getAuthValue())
                                .timeoutMs(request.getTimeoutMs() != null ? request.getTimeoutMs() : 5000)
                                .build();
                RequestItem savedRequestItem = requestItemRepository.saveAndFlush(requestItem);

                log.info("Created request item with ID: {} in collection ID: {} in workspace ID: {}",
                                savedRequestItem.getId(),
                                collectionId, workspaceId);
                RequestItemResponse response = toRequestItemResponse(savedRequestItem);
                eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.REQUEST,
                                ActionType.CREATED, response, currentUser.getId().toString()));
                return response;
        }

        @Transactional(readOnly = true)
        public List<RequestItemResponse> getRequestsByFolder(UUID workspaceId, UUID collectionId, UUID folderId,
                        User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(), WorkspaceRole.ADMIN,
                                WorkspaceRole.MEMBER, WorkspaceRole.VIEWER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");

                Folder folder = findFolderByIdAndCollection(folderId, collection, "Folder not found");

                return requestItemRepository.findByFolder(folder)
                                .stream()
                                .map(this::toRequestItemResponse)
                                .toList();
        }

        @Transactional
        public RequestItemResponse updateRequestItem(UUID workspaceId, UUID collectionId, UUID folderId, UUID requestId,
                        RequestItemRequest request, User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(), WorkspaceRole.ADMIN,
                                WorkspaceRole.MEMBER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");

                Folder folder = findFolderByIdAndCollection(folderId, collection, "Folder not found");

                RequestItem requestItem = findRequestItemByIdAndFolder(requestId, folder, "Request item not found");
                requestItem.setUpdatedBy(currentUser);
                requestItem.setName(request.getName());
                requestItem.setMethod(request.getMethod());
                requestItem.setUrl(request.getUrl());
                requestItem.setHeaders(request.getHeaders());
                requestItem.setBody(request.getBody());
                requestItem.setAuthType(request.getAuthType());
                requestItem.setAuthValue(request.getAuthValue());
                requestItem.setTimeoutMs(request.getTimeoutMs() != null ? request.getTimeoutMs() : 5000);
                RequestItem updatedRequestItem = requestItemRepository.saveAndFlush(requestItem);

                log.info("Updated request item with ID: {} in collection ID: {} in workspace ID: {}",
                                updatedRequestItem.getId(),
                                collectionId, workspaceId);
                RequestItemResponse response = toRequestItemResponse(updatedRequestItem);
                eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.REQUEST,
                                ActionType.UPDATED, response, currentUser.getId().toString()));
                return response;
        }

        @Transactional
        public void deleteRequestItem(UUID workspaceId, UUID collectionId, UUID folderId, UUID requestId,
                        User currentUser) {
                Workspace workspace = findWorkspaceById(workspaceId, "Workspace not found");

                workspaceAuthorizationService.requireRole(workspace.getId(), currentUser.getId(), WorkspaceRole.ADMIN,
                                WorkspaceRole.MEMBER);

                Collection collection = findCollectionByIdAndWorkspace(collectionId, workspace, "Collection not found");

                Folder folder = findFolderByIdAndCollection(folderId, collection, "Folder not found");

                RequestItem requestItem = findRequestItemByIdAndFolder(requestId, folder, "Request item not found");
                requestItemRepository.delete(requestItem);

                log.info("Deleted request item with ID: {} in folder ID: {} in collection ID: {} in workspace ID: {}",
                                requestItem.getId(),
                                folderId, collectionId, workspaceId);
                eventPublisher.publishEvent(new EntityMutatedEvent(this, workspaceId.toString(), EntityType.REQUEST,
                                ActionType.DELETED, new DeletedPayload(requestId), currentUser.getId().toString()));
        }

        @Transactional(readOnly = true)
        protected Workspace findWorkspaceById(UUID workspaceId, String errorMessage) {
                return collectionRequestItemService.findWorkspaceById(workspaceId, errorMessage);
        }

        @Transactional(readOnly = true)
        protected Collection findCollectionByIdAndWorkspace(UUID collectionId, Workspace workspace,
                        String errorMessage) {
                return collectionRequestItemService.findCollectionByIdAndWorkspace(collectionId, workspace,
                                errorMessage);
        }

        @Transactional(readOnly = true)
        protected Folder findFolderByIdAndCollection(UUID folderId, Collection collection, String errorMessage) {
                return folderRepository.findByIdAndCollection(folderId, collection)
                                .orElseThrow(() -> new ResourceNotFoundException(errorMessage));
        }

        @Transactional(readOnly = true)
        protected RequestItem findRequestItemByIdAndFolder(UUID requestId, Folder folder, String errorMessage) {
                return requestItemRepository.findByIdAndFolder(requestId, folder)
                                .orElseThrow(() -> new ResourceNotFoundException(errorMessage));
        }

        protected RequestItemResponse toRequestItemResponse(RequestItem requestItem) {
                return collectionRequestItemService.toRequestItemResponse(requestItem);
        }

}
