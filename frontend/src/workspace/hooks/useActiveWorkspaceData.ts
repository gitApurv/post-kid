import { useEffect, useRef } from "react";
import useWorkspaceStore from "../store/workspaceStore";
import CollectionService from "../../collection/service/CollectionService";
import WorkspaceMemberService from "../service/WorkspaceMemberService";
import useCollectionStore, {
  mapResponseToCollection,
} from "../../collection/store/collectionStore";
import useWorkspaceMemberStore, {
  mapResponseToMember,
} from "../store/WorkspaceMemberStore";

/**
 * Custom hook to reactively synchronize collections and workspace members
 * whenever the active workspace changes.
 *
 * Note: This hook ignores the initial mount to prevent duplicate API requests
 * (the initial load is already handled during app initialization). It acts as
 * a fallback observer for workspace changes triggered programmatically, such
 * as background workspace switch events received via WebSockets.
 */
export function useActiveWorkspaceData() {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const prevIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Skip initial mount check to avoid duplicating the initialization fetch
    if (prevIdRef.current === undefined) {
      prevIdRef.current = activeWorkspaceId;
      return;
    }

    // Only trigger fetches if the workspace ID actually changed
    if (prevIdRef.current === activeWorkspaceId) return;
    prevIdRef.current = activeWorkspaceId;

    if (!activeWorkspaceId) return;

    // Load collections matching the newly selected workspace
    CollectionService.fetchCollections().then((res) => {
      if (!res.success) return;
      useCollectionStore
        .getState()
        .upsertCollections(res.data.map(mapResponseToCollection));
    });

    // Load members belonging to the newly selected workspace
    WorkspaceMemberService.fetchMembers().then((res) => {
      if (!res.success) return;
      const mapped = res.data.map(mapResponseToMember);
      useWorkspaceMemberStore.getState().upsertMembers(mapped);
    });
  }, [activeWorkspaceId]);
}
