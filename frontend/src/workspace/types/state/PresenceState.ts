import type PresenceInfo from "../items/PresenceInfo";

export default interface PresenceState {
  presence: Record<string, PresenceInfo>;

  updatePresence: (info: PresenceInfo) => void;

  removePresence: (userId: string) => void;

  reset: () => void;
}
