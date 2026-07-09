import { useEffect, useRef } from "react";
import useWorkspaceStore from "../store/workspaceStore";
import CollectionService from "../../collection/service/CollectionService";
import WorkspaceMemberService from "../service/WorkspaceMemberService";
import useCollectionStore from "../../collection/store/collectionStore";
import useWorkspaceMemberStore from "../store/WorkspaceMemberStore";

/**
 * Watches activeWorkspaceId and re-fetches collections + members whenever
 * it changes. This hook fires ONLY on changes (not on initial mount), so it
 * does not duplicate the fetch already performed by fetchWorkspacesAction at
 * startup. It is the React-side reaction to a router-triggered workspace
 * switch (e.g. when a WebSocket event removes the current workspace).
 */
export function useActiveWorkspaceData() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  // undefined = not yet observed; null | string = observed value
  const prevIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Skip the very first render — fetchWorkspacesAction already handles the
    // initial load via setActiveWorkspaceAction.
    if (prevIdRef.current === undefined) {
      prevIdRef.current = activeWorkspaceId;
      return;
    }

    // Only react to an actual change.
    if (prevIdRef.current === activeWorkspaceId) return;
    prevIdRef.current = activeWorkspaceId;

    if (!activeWorkspaceId) return;

    // Fetch collections for the newly active workspace.
    CollectionService.fetchCollections(activeWorkspaceId).then((res) => {
      if (!res.success) return;
      useCollectionStore.getState().upsertCollections(
        res.data.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description || "",
          isLoaded: false,
          isLoading: false,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      );
    });

    // Fetch members for the newly active workspace.
    WorkspaceMemberService.fetchMembers(activeWorkspaceId).then((res) => {
      if (!res.success) return;
      const mapped = res.data.map((m: any) => ({
        workspaceId: activeWorkspaceId,
        userId: m.userId,
        username: m.username,
        role: m.role,
      }));
      useWorkspaceMemberStore.getState().upsertMembers(activeWorkspaceId, mapped);
    });
  }, [activeWorkspaceId]);
}
