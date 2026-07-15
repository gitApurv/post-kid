import { create } from "zustand";
import type WorkspaceItem from "../types/items/WorkspaceItem";
import type WorkspaceState from "../types/state/WorkspaceState";
import useCollectionStore, {
  mapResponseToCollection,
} from "../../collection/store/collectionStore";
import useFolderStore from "../../collection/store/folderStore";
import useEnvironmentStore from "../../environment/store/environmentStore";
import useRequestStore from "../../request/store/requestStore";
import WorkspaceService from "../service/WorkspaceService";
import CollectionService from "../../collection/service/CollectionService";
import useWorkspaceMemberStore, {
  mapResponseToMember,
} from "./workspaceMemberStore";
import WorkspaceMemberService from "../service/WorkspaceMemberService";
import useVariableStore from "../../environment/store/variableStore";
import { setActiveWorkspaceId as setActiveWorkspaceIdUtil } from "../utils/activeWorkspace";

const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: {},
  activeWorkspaceId: null,

  // ─── Mutations ───────────────────────────────────────────────

  upsertWorkspace: (workspace) =>
    set((state) => {
      const existing = state.workspaces[workspace.id];
      return {
        workspaces: {
          ...state.workspaces,
          [workspace.id]: {
            ...existing,
            ...workspace,
          },
        },
      };
    }),

  upsertWorkspaces: (workspaces) =>
    set((state) => {
      const newWorkspaces = { ...state.workspaces };
      for (const workspace of workspaces) {
        newWorkspaces[workspace.id] = {
          ...newWorkspaces[workspace.id],
          ...workspace,
        };
      }
      return { workspaces: newWorkspaces };
    }),

  removeWorkspace: (workspaceId) =>
    set((state) => {
      const remainingWorkspaces = { ...state.workspaces };
      delete remainingWorkspaces[workspaceId];
      return { workspaces: remainingWorkspaces };
    }),

  updateMemberCount: (workspaceId, delta) =>
    set((state) => {
      const existing = state.workspaces[workspaceId];
      if (!existing) return state;
      return {
        workspaces: {
          ...state.workspaces,
          [workspaceId]: {
            ...existing,
            memberCount: Math.max(1, existing.memberCount + delta),
          },
        },
      };
    }),

  setActiveWorkspaceId: (workspaceId) => {
    set({ activeWorkspaceId: workspaceId });
    setActiveWorkspaceIdUtil(workspaceId);
  },

  reset: () => {
    set({ workspaces: {}, activeWorkspaceId: null });
    setActiveWorkspaceIdUtil(null);
  },

  // ─── Actions ─────────────────────────────────────────────────

  setActiveWorkspaceAction: async (workspaceId) => {
    get().setActiveWorkspaceId(workspaceId);

    // Reset all related stores when switching workspaces
    useEnvironmentStore.getState().reset();
    useRequestStore.getState().reset();
    useFolderStore.getState().reset();
    useCollectionStore.getState().reset();
    useWorkspaceMemberStore.getState().reset();
    useVariableStore.getState().reset();

    if (!workspaceId) {
      return { success: true };
    }

    // Fetch collections for the active workspace
    const collectionsRes = await CollectionService.fetchCollections();
    if (!collectionsRes.success) return collectionsRes;

    useCollectionStore
      .getState()
      .upsertCollections(collectionsRes.data.map(mapResponseToCollection));

    // Fetch members for the active workspace
    const membersRes = await WorkspaceMemberService.fetchMembers();
    if (membersRes.success) {
      const mapped = membersRes.data.map(mapResponseToMember);
      useWorkspaceMemberStore.getState().upsertMembers(mapped);
    }

    return { success: true };
  },

  fetchWorkspacesAction: async () => {
    const res = await WorkspaceService.fetchWorkspaces();
    if (!res.success) return res;

    // Map the fetched workspaces to include isLoading property
    const mapped: WorkspaceItem[] = res.data.map((workspace) => ({
      ...workspace,
      isLoading: false,
    }));
    get().upsertWorkspaces(mapped);

    const { activeWorkspaceId, workspaces } = get();
    const ids = Object.keys(workspaces);

    // If the current active workspace is not in the fetched list, set a fallback active workspace
    if (!activeWorkspaceId || !workspaces[activeWorkspaceId]) {
      const fallbackId = ids[0] ?? null;
      await get().setActiveWorkspaceAction(fallbackId);
    }

    return { success: true };
  },

  createWorkspaceAction: async (req) => {
    const res = await WorkspaceService.createWorkspace(req);
    if (!res.success) return res;

    const newWorkspace: WorkspaceItem = { ...res.data, isLoading: false };
    get().upsertWorkspace(newWorkspace);

    // Set the newly created workspace as the active workspace
    await get().setActiveWorkspaceAction(newWorkspace.id);

    return { success: true };
  },

  deleteWorkspaceAction: async (workspaceId) => {
    const res = await WorkspaceService.deleteWorkspace();
    if (!res.success) return res;

    get().removeWorkspace(workspaceId);

    // If the deleted workspace was the active one, set a fallback active workspace
    const { activeWorkspaceId, workspaces } = get();
    if (activeWorkspaceId === workspaceId) {
      const remaining = Object.keys(workspaces);
      const fallbackId = remaining[0] ?? null;
      await get().setActiveWorkspaceAction(fallbackId);
    }

    return { success: true };
  },
}));

export default useWorkspaceStore;
