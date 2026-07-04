import { create } from "zustand";
import type CollectionState from "../types/state/CollectionState";
import CollectionService from "../service/CollectionService";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import useFolderStore from "./FolderStore";
import useRequestStore from "../../request/store/RequestStore";

const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: {},

  // ─── Mutations ───────────────────────────────────────────────

  upsertCollection: (collection) =>
    set((state) => ({
      collections: { ...state.collections, [collection.id]: collection },
    })),

  upsertCollections: (collectionsList) =>
    set((state) => ({
      collections: {
        ...state.collections,
        ...Object.fromEntries(
          collectionsList.map((collection) => [collection.id, collection]),
        ),
      },
    })),

  removeCollection: (collectionId) =>
    set((state) => {
      const remainingCollections = { ...state.collections };
      delete remainingCollections[collectionId];
      return { collections: remainingCollections };
    }),

  setCollectionLoading: (collectionId, isLoading) =>
    set((state) => {
      const existingCollection = state.collections[collectionId];
      if (!existingCollection) return state;
      return {
        collections: {
          ...state.collections,
          [collectionId]: { ...existingCollection, isLoading: isLoading },
        },
      };
    }),

  reset: () => set({ collections: {} }),

  // ─── Actions ─────────────────────────────────────────────────

  deleteCollectionAction: async (collectionId) => {
    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!activeWorkspaceId)
      return { success: false, error: "No active workspace selected" };

    const response = await CollectionService.deleteCollection(
      activeWorkspaceId,
      collectionId,
    );
    if (!response.success) return response;

    get().removeCollection(collectionId);

    useFolderStore.getState().removeFoldersByCollectionId(collectionId);
    useRequestStore.getState().removeRequestsByCollectionId(collectionId);

    const requestStoreState = useRequestStore.getState();
    if (
      requestStoreState.activeRequest?.collectionId === collectionId ||
      requestStoreState.activeCollectionId === collectionId
    ) {
      requestStoreState.setActiveCollectionAction(null);
    }

    return { success: true };
  },
}));

export default useCollectionStore;
