import { create } from "zustand";
import type PresenceState from "../types/state/PresenceState";

const usePresenceStore = create<PresenceState>((set) => ({
  presence: {},

  // ─── Mutations ───────────────────────────────────────────────

  updatePresence: (workspaceId, info) =>
    set((state) => ({
      presence: {
        ...state.presence,
        [workspaceId]: {
          ...(state.presence[workspaceId] || {}),
          [info.userId]: info,
        },
      },
    })),

  removePresence: (workspaceId, userId) =>
    set((state) => {
      const workspacePresence = { ...(state.presence[workspaceId] || {}) };
      delete workspacePresence[userId];
      return {
        presence: { ...state.presence, [workspaceId]: workspacePresence },
      };
    }),

  clearWorkspacePresence: (workspaceId) =>
    set((state) => {
      const remaining = { ...state.presence };
      delete remaining[workspaceId];
      return { presence: remaining };
    }),
}));

export default usePresenceStore;
