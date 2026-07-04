import { create } from "zustand";
import type WorkspaceItem from "../types/items/WorkspaceItem";
import type WorkspaceState from "../types/state/WorkspaceState";
import useCollectionStore from "../../collection/store/CollectionStore";
import useFolderStore from "../../collection/store/FolderStore";
import useEnvironmentStore from "../../environment/store/EnvironmentStore";
import useRequestStore from "../../request/store/RequestStore";
import WorkspaceService from "../service/WorkspaceService";
import CollectionService from "../../collection/service/CollectionService";

const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: {},
  activeWorkspaceId: null,

  // ─── Mutations ───────────────────────────────────────────────

  upsertWorkspace: (workspace) =>
    set((state) => ({
      workspaces: { ...state.workspaces, [workspace.id]: workspace },
    })),

  upsertWorkspaces: (list) =>
    set((state) => ({
      workspaces: {
        ...state.workspaces,
        ...Object.fromEntries(
          list.map((workspace) => [workspace.id, workspace]),
        ),
      },
    })),

  removeWorkspace: (id) =>
    set((state) => {
      const remainingWorkspaces = { ...state.workspaces };
      delete remainingWorkspaces[id];
      return { workspaces: remainingWorkspaces };
    }),

  updateMemberCount: (id, delta) =>
    set((state) => {
      const existing = state.workspaces[id];
      if (!existing) return state;
      return {
        workspaces: {
          ...state.workspaces,
          [id]: {
            ...existing,
            memberCount: Math.max(1, existing.memberCount + delta),
          },
        },
      };
    }),

  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),

  reset: () => set({ workspaces: {}, activeWorkspaceId: null }),

  // ─── Actions ─────────────────────────────────────────────────

  setActiveWorkspaceAction: async (id) => {
    get().setActiveWorkspaceId(id);

    useEnvironmentStore.getState().reset();
    useRequestStore.getState().reset();
    useFolderStore.getState().reset();
    useCollectionStore.getState().reset();

    if (!id) {
      return { success: true };
    }

    const collectionsRes = await CollectionService.fetchCollections(id);
    if (!collectionsRes.success) return collectionsRes;

    useCollectionStore.getState().upsertCollections(
      collectionsRes.data.map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description || "",
        isLoaded: false,
        isLoading: false,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      })),
    );

    return { success: true };
  },

  fetchWorkspacesAction: async () => {
    const res = await WorkspaceService.fetchWorkspaces();
    if (!res.success) return res;

    const mapped: WorkspaceItem[] = res.data.map((workspace) => ({
      ...workspace,
      isLoading: false,
    }));
    get().upsertWorkspaces(mapped);

    const { activeWorkspaceId, workspaces } = get();
    const ids = Object.keys(workspaces);

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

    await get().setActiveWorkspaceAction(newWorkspace.id);

    return { success: true };
  },

  deleteWorkspaceAction: async (id) => {
    const res = await WorkspaceService.deleteWorkspace(id);
    if (!res.success) return res;

    get().removeWorkspace(id);

    const { activeWorkspaceId, workspaces } = get();
    if (activeWorkspaceId === id) {
      const remaining = Object.keys(workspaces);
      const fallbackId = remaining[0] ?? null;
      await get().setActiveWorkspaceAction(fallbackId);
    }

    return { success: true };
  },
}));

export default useWorkspaceStore;
