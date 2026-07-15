import { create } from "zustand";
import type PresenceState from "../types/state/PresenceState";

const usePresenceStore = create<PresenceState>((set) => ({
  presence: {},

  // ─── Mutations ───────────────────────────────────────────────

  updatePresence: (info) =>
    set((state) => ({
      presence: {
        ...state.presence,
        [info.userId]: info,
      },
    })),

  removePresence: (userId) =>
    set((state) => {
      const remainingPresence = { ...state.presence };
      delete remainingPresence[userId];
      return { presence: remainingPresence };
    }),

  reset: () => set({ presence: {} }),
}));

export default usePresenceStore;
