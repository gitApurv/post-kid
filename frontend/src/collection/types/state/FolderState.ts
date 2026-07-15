import type Folder from "../items/FolderItem";

export default interface FolderState {
  folders: Record<string, Folder>;
  expandedFolderIds: Record<string, boolean>;

  upsertFolder: (folder: Folder) => void;

  upsertFolders: (folders: Folder[]) => void;

  removeFolder: (folderId: string) => void;

  removeFoldersByCollectionId: (collectionId: string) => void;

  removeFoldersByIds: (folderIds: string[]) => void;

  setFolderLoading: (folderId: string, isLoading: boolean) => void;

  toggleFolderExpansion: (folderId: string, expanded: boolean) => void;

  reset: () => void;

  cascadeRemoveFolder: (folderId: string) => void;

  deleteFolderAction: (
    folderId: string,
  ) => Promise<{ success: boolean; error?: string }>;
}
