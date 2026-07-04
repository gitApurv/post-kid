import type Collection from "../items/CollectionItem";

export default interface CollectionState {
  collections: Record<string, Collection>;

  // Mutations
  upsertCollection: (collection: Collection) => void;

  upsertCollections: (collections: Collection[]) => void;

  removeCollection: (id: string) => void;

  setCollectionLoading: (id: string, isLoading: boolean) => void;

  reset: () => void;

  // Actions
  deleteCollectionAction: (
    collectionId: string,
  ) => Promise<{ success: boolean; error?: string }>;
}
