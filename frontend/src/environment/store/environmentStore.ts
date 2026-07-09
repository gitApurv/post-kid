import { create } from "zustand";
import useWorkspaceStore from "../../workspace/store/workspaceStore";
import type Environment from "../types/items/Environment";
import type EnvironmentState from "../types/state/EnvironmentState";
import EnvironmentService from "../service/EnvironmentService";
import type EnvironmentResponse from "../types/response/EnvironmentResponse";
import useVariableStore from "./variableStore";

// ── Utility: map EnvironmentResponse DTO → Environment ──
function mapResponseToEnvironment(res: EnvironmentResponse): Environment {
  return {
    id: res.id,
    name: res.name,
    color: res.environmentColor,
    collectionId: res.collectionId,
    variables: {},
  };
}

const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  environments: {},
  activeEnvironmentId: "",

  // ─── Mutations ───────────────────────────────────────────────

  upsertEnvironment: (environment) =>
    set((state) => ({
      environments: { ...state.environments, [environment.id]: environment },
    })),

  setEnvironments: (environments) => set({ environments }),

  removeEnvironment: (environmentId) =>
    set((state) => {
      const remainingEnvironments = { ...state.environments };
      delete remainingEnvironments[environmentId];
      return {
        environments: remainingEnvironments,
        activeEnvironmentId:
          state.activeEnvironmentId === environmentId
            ? ""
            : state.activeEnvironmentId,
      };
    }),

  setActiveEnvironmentId: (id) => set({ activeEnvironmentId: id }),

  reset: () =>
    set({
      environments: {},
      activeEnvironmentId: "",
    }),

  // ─── Cascade Mutation ────────────────────────────────────────

  cascadeRemoveEnvironment: (environmentId) => {
    useEnvironmentStore.getState().removeEnvironment(environmentId);
    useVariableStore.getState().removeVariablesByEnvironmentId(environmentId);
  },

  // ─── Actions ─────────────────────────────────────────────────

  fetchEnvironmentsAction: async (collectionId) => {
    const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!workspaceId)
      return { success: false, error: "No active workspace selected" };

    const res = await EnvironmentService.fetchEnvironments(
      workspaceId,
      collectionId,
    );
    if (!res.success) return res;

    const record: Record<string, Environment> = Object.fromEntries(
      res.data.map((environment) => [
        environment.id,
        mapResponseToEnvironment(environment),
      ]),
    );

    get().setEnvironments(record);

    const { activeEnvironmentId } = get();
    const ids = Object.keys(record);
    if (!activeEnvironmentId || !record[activeEnvironmentId]) {
      get().setActiveEnvironmentId(ids[0] ?? "");
    }

    return { success: true };
  },

  deleteEnvironmentAction: async (environmentId) => {
    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!activeWorkspaceId)
      return { success: false, error: "No active workspace selected" };

    const environment = get().environments[environmentId];
    if (!environment) return { success: true };
    const collectionId = environment.collectionId;

    const response = await EnvironmentService.deleteEnvironment(
      activeWorkspaceId,
      collectionId,
      environmentId,
    );
    if (!response.success) return response;

    get().cascadeRemoveEnvironment(environmentId);

    return { success: true };
  },
}));

export default useEnvironmentStore;
