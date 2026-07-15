import type Collection from "../items/CollectionItem";

export default interface CollectionState {
  collections: Record<string, Collection>;

  upsertCollection: (collection: Collection) => void;

  upsertCollections: (collections: Collection[]) => void;

  removeCollection: (collectionId: string) => void;

  cascadeRemoveCollection: (collectionId: string) => void;

  setCollectionLoading: (id: string, isLoading: boolean) => void;

  reset: () => void;

  deleteCollectionAction: (
    collectionId: string,
  ) => Promise<{ success: boolean; error?: string }>;
}
