import useWorkspaceStore from "../../workspace/store/workspaceStore";
import useAuthStore from "../../auth/store/authStore";
import useCollectionStore from "../../collection/store/collectionStore";
import useFolderStore from "../../collection/store/folderStore";
import useRequestStore, {
  mapResponseToRequestItem,
} from "../../request/store/requestStore";
import useWorkspaceMemberStore from "../../workspace/store/workspaceMemberStore";
import useEnvironmentStore, {
  mapResponseToEnvironment,
} from "../../environment/store/environmentStore";
import useNotificationStore from "../../common/store/NotificationStore";
import type CollaborationEvent from "../types/event/CollaborationEvent";
import useEnvironmentVariableStore from "../../environment/store/environmentVariableStore";
import type DeletedPayload from "../types/event/DeletedPayload";
import type CollectionResponse from "../../collection/types/response/CollectionResponse";
import type FolderResponse from "../../collection/types/response/FolderResponse";
import type RequestItemResponse from "../../request/types/response/RequestItemResponse";
import type EnvironmentResponse from "../../environment/types/response/EnvironmentResponse";
import type VariableResponse from "../../environment/types/response/VariableResponse";
import type WorkspaceItem from "../../workspace/types/items/WorkspaceItem";
import type WorkspaceMember from "../../workspace/types/items/WorkspaceMember";

const handleCollaborationEvent = (event: CollaborationEvent) => {
  const currentUser = useAuthStore.getState().currentUser;

  // Ignore events that are triggered by the current user, as they are already handled locally
  if (currentUser && event.actorId === currentUser.id) {
    return;
  }

  const { action, entityType, payload } = event;

  // Handle the event based on its entity type and action
  switch (entityType) {
    case "COLLECTION": {
      if (action === "DELETED") {
        const deletedPayload = payload as DeletedPayload;

        // Cascade remove the collection and its associated folders and requests
        useCollectionStore
          .getState()
          .cascadeRemoveCollection(deletedPayload.id);
      } else {
        const collectionPayload = payload as CollectionResponse;

        // Upsert the collection in the store
        useCollectionStore.getState().upsertCollection(collectionPayload);
      }
      break;
    }

    case "FOLDER": {
      if (action === "DELETED") {
        const deletedPayload = payload as DeletedPayload;
        // Cascade remove the folder and its associated requests
        useFolderStore.getState().cascadeRemoveFolder(deletedPayload.id);
      } else {
        const folderPayload = payload as FolderResponse;
        // Upsert the folder in the store
        useFolderStore.getState().upsertFolder(folderPayload);
      }
      break;
    }

    case "REQUEST": {
      if (action === "DELETED") {
        const deletedPayload = payload as DeletedPayload;
        // Remove the request from the store
        useRequestStore.getState().removeRequest(deletedPayload.id);

        // If the deleted request was the active request, clear the active request
        const activeRequest = useRequestStore.getState().activeRequest;
        if (activeRequest?.id === deletedPayload.id) {
          useRequestStore.getState().setActiveRequestDirectly(null);
        }
      } else {
        const reqPayload = payload as RequestItemResponse;
        const mappedRequest = mapResponseToRequestItem(reqPayload);
        // Upsert the request in the store
        useRequestStore.getState().upsertRequest(mappedRequest);

        // If the upserted request is the active request, update the active request in the store
        if (useRequestStore.getState().activeRequestId === mappedRequest.id) {
          useRequestStore.getState().setActiveRequest(mappedRequest);
        }
      }
      break;
    }

    case "ENVIRONMENT": {
      if (action === "DELETED") {
        const deletedPayload = payload as DeletedPayload;
        // Cascade remove the environment and its associated variables
        useEnvironmentStore
          .getState()
          .cascadeRemoveEnvironment(deletedPayload.id);
      } else {
        const envPayload = payload as EnvironmentResponse;
        const mappedEnv = mapResponseToEnvironment(envPayload);
        // Upsert the environment in the store
        useEnvironmentStore.getState().upsertEnvironment(mappedEnv);
      }
      break;
    }

    case "ENVIRONMENT_VARIABLE": {
      if (action === "DELETED") {
        const deletedPayload = payload as DeletedPayload;
        // Remove the variable from the store
        useEnvironmentVariableStore
          .getState()
          .removeVariable(deletedPayload.id);
      } else {
        const varPayload = payload as VariableResponse;
        // Upsert the variable in the store
        useEnvironmentVariableStore.getState().upsertVariable(varPayload);
      }
      break;
    }

    case "WORKSPACE": {
      if (action === "DELETED") {
        const deletedPayload = payload as DeletedPayload;
        // Remove the workspace from the store
        useWorkspaceStore.getState().removeWorkspace(deletedPayload.id);

        // If the deleted workspace was the active workspace, set the active workspace to null or a fallback workspace
        const activeWorkspaceId =
          useWorkspaceStore.getState().activeWorkspaceId;
        if (activeWorkspaceId === deletedPayload.id) {
          const remaining = Object.keys(
            useWorkspaceStore.getState().workspaces,
          );
          const fallbackId = remaining[0] ?? null;
          useWorkspaceStore.getState().setActiveWorkspaceId(fallbackId);
        }
      } else {
        const workspacePayload = payload as WorkspaceItem;
        // Upsert the workspace in the store
        useWorkspaceStore.getState().upsertWorkspace(workspacePayload);
      }
      break;
    }

    case "WORKSPACE_MEMBER": {
      if (action === "DELETED") {
        const deletedPayload = payload as DeletedPayload;
        const exists =
          !!useWorkspaceMemberStore.getState().members[deletedPayload.id];

        // Remove the member from the store
        useWorkspaceMemberStore.getState().removeMember(deletedPayload.id);

        // If the deleted member existed, decrement the member count for the workspace
        if (exists) {
          useWorkspaceStore.getState().updateMemberCount(event.workspaceId, -1);
        }

        // If the deleted member is the current user, show a notification and reset the workspace member store
        if (currentUser && deletedPayload.id === currentUser.id) {
          useNotificationStore
            .getState()
            .addNotification("You were removed from this workspace.", "ERROR");
          useWorkspaceMemberStore.getState().reset();
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
        const exists =
          !!useWorkspaceMemberStore.getState().members[memberPayload.userId];

        // Upsert the member in the store
        useWorkspaceMemberStore.getState().upsertMember(memberPayload);

        // If the member did not exist before, increment the member count for the workspace
        if (!exists) {
          useWorkspaceStore
            .getState()
            .updateMemberCount(memberPayload.workspaceId, 1);
        }
      }
      break;
    }
  }
};

const eventRouter = {
  handleCollaborationEvent,
};

export default eventRouter;
