import type RequestItem from "../../../request/types/items/RequestItem";

export default interface RequestTreeItemProps {
  request: RequestItem;
  onDelete: (id: string, name: string) => void;
}
