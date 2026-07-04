import type HistoryItem from "../items/HistoryItem";

export default interface HistoryState {
  histories: Record<string, HistoryItem>;

  // Mutations
  upsertHistory: (history: HistoryItem) => void;

  upsertHistories: (histories: HistoryItem[]) => void;

  removeHistory: (id: string) => void;

  clearHistories: () => void;

  reset: () => void;
}
