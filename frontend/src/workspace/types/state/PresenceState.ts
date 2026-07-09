import type PresenceInfo from "../items/PresenceInfo";

export default interface PresenceState {
  presence: Record<string, Record<string, PresenceInfo>>;

  // Mutations
  updatePresence: (workspaceId: string, info: PresenceInfo) => void;

  removePresence: (workspaceId: string, userId: string) => void;

  clearWorkspacePresence: (workspaceId: string) => void;
}
