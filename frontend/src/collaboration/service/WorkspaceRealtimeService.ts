import useWebsocketStore from "../store/useWebsocketStore";
import usePresenceStore from "../../workspace/store/presenceStore";
import eventRouter from "../lib/eventRouter";
import type CollaborationEvent from "../types/event/CollaborationEvent";
import type PresenceInfo from "../../workspace/types/items/PresenceInfo";

const activeSubscriptions: Record<string, () => void> = {};

export function startWorkspaceRealtime(workspaceId: string) {
  const { subscribe } = useWebsocketStore.getState();

  const unsubEvents = subscribe(`/topic/workspace/${workspaceId}`, (event) => {
    eventRouter.handleCollaborationEvent(event as CollaborationEvent<unknown>);
  });

  const unsubPresence = subscribe(
    `/topic/workspace/${workspaceId}/presence`,
    (presenceEvent) => {
      const presence = presenceEvent as PresenceInfo;
      if (presence.status === "OFFLINE") {
        usePresenceStore.getState().removePresence(presence.userId);
      } else {
        usePresenceStore.getState().updatePresence(presence);
      }
    },
  );

  activeSubscriptions[`${workspaceId}:events`] = unsubEvents;
  activeSubscriptions[`${workspaceId}:presence`] = unsubPresence;
}

export function stopWorkspaceRealtime(workspaceId: string) {
  activeSubscriptions[`${workspaceId}:events`]?.();
  activeSubscriptions[`${workspaceId}:presence`]?.();
  delete activeSubscriptions[`${workspaceId}:events`];
  delete activeSubscriptions[`${workspaceId}:presence`];
  usePresenceStore.getState().reset();
}

const WorkspaceRealtimeService = {
  startWorkspaceRealtime,
  stopWorkspaceRealtime,
};

export default WorkspaceRealtimeService;
