import { create } from "zustand";
import type FolderState from "../types/state/FolderState";
import type Folder from "../types/items/FolderItem";
import FolderService from "../service/FolderService";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import useRequestStore from "../../request/store/RequestStore";

function collectDescendantIds(
  folders: Record<string, Folder>,
  rootId: string,
): string[] {
  const descendantIds = new Set<string>([rootId]);
  let didStateChange = true;
  while (didStateChange) {
    didStateChange = false;
    for (const folder of Object.values(folders)) {
      if (
        folder.parentFolderId &&
        descendantIds.has(folder.parentFolderId) &&
        !descendantIds.has(folder.id)
      ) {
        descendantIds.add(folder.id);
        didStateChange = true;
      }
    }
  }
  return [...descendantIds];
}

const useFolderStore = create<FolderState>((set, get) => ({
  folders: {},
  expandedFolderIds: {},

  // ─── Mutations ───────────────────────────────────────────────

  upsertFolder: (folder) =>
    set((state) => ({ folders: { ...state.folders, [folder.id]: folder } })),

  upsertFolders: (foldersList) =>
    set((state) => ({
      folders: {
        ...state.folders,
        ...Object.fromEntries(foldersList.map((folder) => [folder.id, folder])),
      },
    })),

  removeFolder: (folderId) =>
    set((state) => {
      const remainingFolders = { ...state.folders };
      delete remainingFolders[folderId];
      return { folders: remainingFolders };
    }),

  removeFoldersByCollectionId: (collectionId) =>
    set((state) => ({
      folders: Object.fromEntries(
        Object.entries(state.folders).filter(
          ([, folder]) => folder.collectionId !== collectionId,
        ),
      ),
    })),

  setFolderLoading: (folderId, isLoading) =>
    set((state) => {
      const existingFolder = state.folders[folderId];
      if (!existingFolder) return state;
      return {
        folders: {
          ...state.folders,
          [folderId]: { ...existingFolder, isLoading: isLoading },
        },
      };
    }),

  toggleFolderExpansion: (folderId, expanded) =>
    set((state) => ({
      expandedFolderIds: { ...state.expandedFolderIds, [folderId]: expanded },
    })),

  reset: () => set({ folders: {}, expandedFolderIds: {} }),

  // ─── Actions ─────────────────────────────────────────────────

  deleteFolderAction: async (collectionId, folderId) => {
    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!activeWorkspaceId)
      return { success: false, error: "No active workspace selected" };

    const response = await FolderService.deleteFolder(
      activeWorkspaceId,
      collectionId,
      folderId,
    );
    if (!response.success) return response;

    const idsToRemove = collectDescendantIds(get().folders, folderId);

    set((state) => ({
      folders: Object.fromEntries(
        Object.entries(state.folders).filter(
          ([id]) => !idsToRemove.includes(id),
        ),
      ),
    }));

    useRequestStore.getState().removeRequestsByFolderIds(idsToRemove);

    const activeRequest = useRequestStore.getState().activeRequest;
    if (
      activeRequest?.folderId &&
      idsToRemove.includes(activeRequest.folderId)
    ) {
      useRequestStore.getState().setActiveRequestDirectlyAction(null);
    }

    return { success: true };
  },
}));

export default useFolderStore;
