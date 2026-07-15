import { create } from "zustand";
import type FolderState from "../types/state/FolderState";
import type Folder from "../types/items/FolderItem";
import FolderService from "../service/FolderService";
import useWorkspaceStore from "../../workspace/store/workspaceStore";
import useRequestStore from "../../request/store/requestStore";

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
    set((state) => {
      const existing = state.folders[folder.id];
      return {
        folders: {
          ...state.folders,
          [folder.id]: {
            ...existing,
            ...folder,
          },
        },
      };
    }),

  upsertFolders: (foldersList) =>
    set((state) => {
      const newFolders = { ...state.folders };
      for (const folder of foldersList) {
        newFolders[folder.id] = {
          ...newFolders[folder.id],
          ...folder,
        };
      }
      return { folders: newFolders };
    }),

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

  removeFoldersByIds: (ids) =>
    set((state) => ({
      folders: Object.fromEntries(
        Object.entries(state.folders).filter(([id]) => !ids.includes(id)),
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

  cascadeRemoveFolder: (folderId) => {
    const folders = useFolderStore.getState().folders;
    const idsToRemove = collectDescendantIds(folders, folderId);

    // Remove the folder and its descendants from the store
    useFolderStore.getState().removeFoldersByIds(idsToRemove);
    useRequestStore.getState().removeRequestsByFolderIds(idsToRemove);

    // If the active request belongs to any of the removed folders, clear it
    const activeRequest = useRequestStore.getState().activeRequest;
    if (
      activeRequest?.folderId &&
      idsToRemove.includes(activeRequest.folderId)
    ) {
      useRequestStore.getState().setActiveRequestDirectly(null);
    }
  },

  // ─── Actions ─────────────────────────────────────────────────

  deleteFolderAction: async (folderId) => {
    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!activeWorkspaceId)
      return { success: false, error: "No active workspace selected" };

    const folder = get().folders[folderId];
    if (!folder) return { success: false, error: "Folder not found in store" };

    const response = await FolderService.deleteFolder(
      folder.collectionId,
      folderId,
    );
    if (!response.success) return response;

    // Cascade remove the folder and its descendant folders and requests from the store
    get().cascadeRemoveFolder(folderId);

    return { success: true };
  },
}));

export default useFolderStore;
