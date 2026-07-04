import type HistoryItem from "../items/HistoryItem";

export default interface HistoryListProps {
  items: HistoryItem[];
  onInspect: (item: HistoryItem) => void;
}
