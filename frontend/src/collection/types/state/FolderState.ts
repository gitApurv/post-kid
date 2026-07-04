import type Folder from "../items/FolderItem";

export default interface FolderState {
  folders: Record<string, Folder>;
  expandedFolderIds: Record<string, boolean>;

  // Mutations
  upsertFolder: (folder: Folder) => void;

  upsertFolders: (folders: Folder[]) => void;

  removeFolder: (id: string) => void;

  removeFoldersByCollectionId: (collectionId: string) => void;

  setFolderLoading: (id: string, isLoading: boolean) => void;

  toggleFolderExpansion: (folderId: string, expanded: boolean) => void;

  reset: () => void;

  // Actions
  deleteFolderAction: (
    collectionId: string,
    folderId: string,
  ) => Promise<{ success: boolean; error?: string }>;
}
