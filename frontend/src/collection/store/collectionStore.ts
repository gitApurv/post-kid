import { create } from "zustand";
import type CollectionState from "../types/state/CollectionState";
import type Collection from "../types/items/CollectionItem";
import type CollectionResponse from "../types/response/CollectionResponse";
import CollectionService from "../service/CollectionService";
import useWorkspaceStore from "../../workspace/store/workspaceStore";
import useFolderStore from "./folderStore";
import useRequestStore from "../../request/store/requestStore";

export function mapResponseToCollection(
  collection: CollectionResponse,
): Collection {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description || "",
    isLoaded: false,
    isLoading: false,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
}

const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: {},

  // ─── Mutations ───────────────────────────────────────────────

  upsertCollection: (collection) =>
    set((state) => {
      const existing = state.collections[collection.id];
      return {
        collections: {
          ...state.collections,
          [collection.id]: {
            ...existing,
            ...collection,
          },
        },
      };
    }),

  upsertCollections: (collectionsList) =>
    set((state) => {
      const newCollections = { ...state.collections };
      for (const collection of collectionsList) {
        newCollections[collection.id] = {
          ...newCollections[collection.id],
          ...collection,
        };
      }
      return { collections: newCollections };
    }),

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

  cascadeRemoveCollection: (collectionId) => {
    // Cascade remove the collection and its related folders and requests from the store
    useCollectionStore.getState().removeCollection(collectionId);
    useFolderStore.getState().removeFoldersByCollectionId(collectionId);
    useRequestStore.getState().removeRequestsByCollectionId(collectionId);

    // If the active request or active collection belongs to the removed collection, clear them
    const requestStoreState = useRequestStore.getState();
    if (
      requestStoreState.activeRequest?.collectionId === collectionId ||
      requestStoreState.activeCollectionId === collectionId
    ) {
      requestStoreState.setActiveCollection(null);
    }
  },

  // ─── Actions ─────────────────────────────────────────────────

  deleteCollectionAction: async (collectionId) => {
    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!activeWorkspaceId)
      return { success: false, error: "No active workspace selected" };

    const response = await CollectionService.deleteCollection(collectionId);
    if (!response.success) return response;

    // Cascade remove the collection and its related folders and requests from the store
    get().cascadeRemoveCollection(collectionId);

    return { success: true };
  },
}));

export default useCollectionStore;
