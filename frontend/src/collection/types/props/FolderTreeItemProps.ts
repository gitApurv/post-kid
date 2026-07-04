import type Folder from "../items/FolderItem";

export default interface FolderTreeItemProps {
  folder: Folder;
  collectionId: string;
  level: number;
  onAddFolder: (collectionId: string, folderId: string | null) => void;
  onAddRequest: (collectionId: string, folderId: string | null) => void;
}
