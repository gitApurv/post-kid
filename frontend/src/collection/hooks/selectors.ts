import { useMemo } from "react";
import useFolderStore from "../store/folderStore";
import type Folder from "../types/items/FolderItem";
import useRequestStore from "../../request/store/requestStore";
import type RequestItem from "../../request/types/items/RequestItem";

/**
 * Hook to retrieve all root-level folders belonging directly to a collection.
 * Root folders are those that have no parentFolderId.
 * Uses useMemo to prevent unnecessary filtering computations on re-renders.
 */
export function useRootFolders(collectionId: string): Folder[] {
  const folders = useFolderStore((state) => state.folders);
  return useMemo(() => {
    return Object.values(folders).filter(
      (folder) =>
        folder.collectionId === collectionId && !folder.parentFolderId,
    );
  }, [folders, collectionId]);
}

/**
 * Hook to retrieve all child folders nested directly under a specific folder.
 * Uses useMemo to optimize filtering across folder state changes.
 */
export function useChildFolders(folderId: string): Folder[] {
  const folders = useFolderStore((state) => state.folders);
  return useMemo(() => {
    return Object.values(folders).filter(
      (folder) => folder.parentFolderId === folderId,
    );
  }, [folders, folderId]);
}

/**
 * Hook to retrieve all root-level requests belonging directly to a collection.
 * Root requests are those that do not reside inside any folder (folderId is null/undefined).
 * Uses useMemo to optimize performance.
 */
export function useRootRequests(collectionId: string): RequestItem[] {
  const requests = useRequestStore((state) => state.requests);
  return useMemo(() => {
    return Object.values(requests).filter(
      (requestItem) =>
        requestItem.collectionId === collectionId && !requestItem.folderId,
    );
  }, [requests, collectionId]);
}

/**
 * Hook to retrieve all requests contained directly inside a specific folder.
 * Uses useMemo to prevent recalculating list mappings on unrelated state changes.
 */
export function useFolderRequests(folderId: string): RequestItem[] {
  const requests = useRequestStore((state) => state.requests);
  return useMemo(() => {
    return Object.values(requests).filter(
      (requestItem) => requestItem.folderId === folderId,
    );
  }, [requests, folderId]);
}
