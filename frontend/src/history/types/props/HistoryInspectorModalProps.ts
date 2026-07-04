import type HistoryItem from "../items/HistoryItem";

export default interface HistoryInspectorModalProps {
  item: HistoryItem | null;
  onClose: () => void;
}
