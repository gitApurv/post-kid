import useWorkspaceStore from "../../workspace/store/workspaceStore";
import useAuthStore from "../../auth/store/authStore";
import useCollectionStore from "../../collection/store/collectionStore";
import useFolderStore from "../../collection/store/FolderStore";
import useRequestStore, {
  mapResponseToRequestItem,
} from "../../request/store/requestStore";
import useWorkspaceMemberStore from "../../workspace/store/WorkspaceMemberStore";
import useEnvironmentStore from "../../environment/store/environmentStore";
import useNotificationStore from "../../common/store/NotificationStore";
import useWebsocketStore from "../store/useWebsocketStore";
import usePresenceStore from "../../workspace/store/PresenceStore";
import type CollaborationEvent from "../types/event/CollaborationEvent";
import useVariableStore from "../../environment/store/variableStore";
import type DeletedPayload from "../types/event/DeletedPayload";
import type CollectionResponse from "../../collection/types/response/CollectionResponse";
import type FolderResponse from "../../collection/types/response/FolderResponse";
import type RequestItemResponse from "../../request/types/response/RequestItemResponse";
import type Environment from "../../environment/types/items/Environment";
import type VariableResponse from "../../environment/types/response/VariableResponse";
import type WorkspaceItem from "../../workspace/types/items/WorkspaceItem";
import type WorkspaceMember from "../../workspace/types/items/WorkspaceMember";
import type PresenceInfo from "../../workspace/types/items/PresenceInfo";

const handleCollaborationEvent = (event: CollaborationEvent) => {
  const currentUser = useAuthStore.getState().currentUser;

  if (currentUser && event.actorId === currentUser.name) {
    return;
  }

  const { action, entityType, payload } = event;

  switch (entityType) {
    case "COLLECTION": {
      if (action === "DELETED") {
        useCollectionStore
          .getState()
          .cascadeRemoveCollection((payload as DeletedPayload).id);
      } else {
        useCollectionStore
          .getState()
          .upsertCollection(payload as CollectionResponse);
      }
      break;
    }

    case "FOLDER": {
      if (action === "DELETED") {
        useFolderStore
          .getState()
          .cascadeRemoveFolder((payload as DeletedPayload).id);
      } else {
        useFolderStore.getState().upsertFolder(payload as FolderResponse);
      }
      break;
    }

    case "REQUEST": {
      if (action === "DELETED") {
        const deletedId = (payload as DeletedPayload).id;
        useRequestStore.getState().removeRequest(deletedId);
        const activeRequest = useRequestStore.getState().activeRequest;
        if (activeRequest?.id === deletedId) {
          useRequestStore.getState().setActiveRequestDirectly(null);
        }
      } else {
        const reqPayload = payload as RequestItemResponse;
        const mappedRequest = mapResponseToRequestItem(
          reqPayload,
          reqPayload.collectionId,
          reqPayload.folderId,
        );
        useRequestStore.getState().upsertRequest(mappedRequest);
      }
      break;
    }

    case "ENVIRONMENT": {
      if (action === "DELETED") {
        useEnvironmentStore
          .getState()
          .cascadeRemoveEnvironment((payload as DeletedPayload).id);
      } else {
        useEnvironmentStore
          .getState()
          .upsertEnvironment(payload as Environment);
      }
      break;
    }

    case "ENVIRONMENT_VARIABLE": {
      if (action === "DELETED") {
        useVariableStore
          .getState()
          .removeVariable((payload as DeletedPayload).id);
      } else {
        useVariableStore.getState().upsertVariable(payload as VariableResponse);
      }
      break;
    }

    case "WORKSPACE": {
      const workspacePayloadId = (payload as DeletedPayload).id;
      if (action === "DELETED") {
        useWorkspaceStore.getState().removeWorkspace(workspacePayloadId);
        const activeWorkspaceId =
          useWorkspaceStore.getState().activeWorkspaceId;
        if (activeWorkspaceId === workspacePayloadId) {
          const remaining = Object.keys(
            useWorkspaceStore.getState().workspaces,
          );
          const fallbackId = remaining[0] ?? null;
          useWorkspaceStore.getState().setActiveWorkspaceId(fallbackId);
        }
      } else {
        useWorkspaceStore.getState().upsertWorkspace(payload as WorkspaceItem);
      }
      break;
    }

    case "WORKSPACE_MEMBER": {
      if (action === "DELETED") {
        const deletedMemberId = (payload as DeletedPayload).id;
        useWorkspaceMemberStore
          .getState()
          .removeMember(event.workspaceId, deletedMemberId);
        useWorkspaceStore.getState().updateMemberCount(event.workspaceId, -1);

        if (currentUser && deletedMemberId === currentUser.id) {
          useNotificationStore
            .getState()
            .addNotification("You were removed from this workspace.", "ERROR");
          useWorkspaceMemberStore
            .getState()
            .clearWorkspaceMembers(event.workspaceId);
          useWorkspaceStore.getState().removeWorkspace(event.workspaceId);

          const { activeWorkspaceId, workspaces } =
            useWorkspaceStore.getState();
          if (activeWorkspaceId === event.workspaceId) {
            const fallbackId = Object.keys(workspaces)[0] ?? null;
            useWorkspaceStore.getState().setActiveWorkspaceId(fallbackId);
          }
        }
      } else {
        const memberPayload = payload as WorkspaceMember;
        useWorkspaceMemberStore
          .getState()
          .upsertMember(memberPayload.workspaceId, memberPayload);
        useWorkspaceStore
          .getState()
          .updateMemberCount(memberPayload.workspaceId, 1);
      }
      break;
    }
  }
};

const activeSubscriptions: Record<string, () => void> = {};

function startWorkspaceRealtime(workspaceId: string) {
  const { subscribe } = useWebsocketStore.getState();

  const unsubEvents = subscribe(`/topic/workspace/${workspaceId}`, (event) => {
    handleCollaborationEvent(event as CollaborationEvent<unknown>);
  });

  const unsubPresence = subscribe(
    `/topic/workspace/${workspaceId}/presence`,
    (presenceEvent) => {
      const presence = presenceEvent as {
        userId: string;
        username: string;
        status: "online" | "idle" | "OFFLINE";
      };
      if (presence.status === "OFFLINE") {
        usePresenceStore
          .getState()
          .removePresence(workspaceId, presence.userId);
      } else {
        usePresenceStore
          .getState()
          .updatePresence(workspaceId, presence as PresenceInfo);
      }
    },
  );

  activeSubscriptions[`${workspaceId}:events`] = unsubEvents;
  activeSubscriptions[`${workspaceId}:presence`] = unsubPresence;
}

function stopWorkspaceRealtime(workspaceId: string) {
  activeSubscriptions[`${workspaceId}:events`]?.();
  activeSubscriptions[`${workspaceId}:presence`]?.();
  delete activeSubscriptions[`${workspaceId}:events`];
  delete activeSubscriptions[`${workspaceId}:presence`];
  usePresenceStore.getState().clearWorkspacePresence(workspaceId);
}

const eventRouter = {
  handleCollaborationEvent,
  startWorkspaceRealtime,
  stopWorkspaceRealtime,
};

export default eventRouter;
