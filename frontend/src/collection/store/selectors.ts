import { useMemo } from "react";
import useFolderStore from "./FolderStore";
import type Folder from "../types/items/FolderItem";
import useRequestStore from "../../request/store/RequestStore";
import type RequestItem from "../../request/types/items/RequestItem";

// Root folders for a collection
export function useRootFolders(collectionId: string): Folder[] {
  const folders = useFolderStore((state) => state.folders);
  return useMemo(() => {
    return Object.values(folders).filter(
      (folder) =>
        folder.collectionId === collectionId && !folder.parentFolderId,
    );
  }, [folders, collectionId]);
}

// Direct children of a folder
export function useChildFolders(folderId: string): Folder[] {
  const folders = useFolderStore((state) => state.folders);
  return useMemo(() => {
    return Object.values(folders).filter(
      (folder) => folder.parentFolderId === folderId,
    );
  }, [folders, folderId]);
}

// Root requests for a collection
export function useRootRequests(collectionId: string): RequestItem[] {
  const requests = useRequestStore((state) => state.requests);
  return useMemo(() => {
    return Object.values(requests).filter(
      (requestItem) =>
        requestItem.collectionId === collectionId && !requestItem.folderId,
    );
  }, [requests, collectionId]);
}

// Requests belonging to a folder
export function useFolderRequests(folderId: string): RequestItem[] {
  const requests = useRequestStore((state) => state.requests);
  return useMemo(() => {
    return Object.values(requests).filter(
      (requestItem) => requestItem.folderId === folderId,
    );
  }, [requests, folderId]);
}

// Derived count of root folders
export function useRootFolderCount(collectionId: string): number {
  const folders = useFolderStore((state) => state.folders);
  return useMemo(() => {
    return Object.values(folders).filter(
      (folder) =>
        folder.collectionId === collectionId && !folder.parentFolderId,
    ).length;
  }, [folders, collectionId]);
}
