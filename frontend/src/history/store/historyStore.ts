import { create } from "zustand";
import type HistoryItem from "../types/items/HistoryItem";
import type HistoryState from "../types/state/HistoryState";

const useHistoryStore = create<HistoryState>((set) => ({
  histories: {},

  // ─── Mutations ───────────────────────────────────────────────

  upsertHistory: (historyItem: HistoryItem) =>
    set((state) => ({
      histories: { ...state.histories, [historyItem.id]: historyItem },
    })),

  upsertHistories: (historiesList: HistoryItem[]) =>
    set((state) => ({
      histories: {
        ...state.histories,
        ...Object.fromEntries(
          historiesList.map((historyItem) => [historyItem.id, historyItem]),
        ),
      },
    })),

  removeHistory: (id) =>
    set((state) => {
      const remainingHistories = { ...state.histories };
      delete remainingHistories[id];
      return { histories: remainingHistories };
    }),

  clearHistories: () => set({ histories: {} }),

  reset: () => set({ histories: {} }),
}));

export default useHistoryStore;
