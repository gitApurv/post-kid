import { create } from "zustand";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import type Environment from "../types/items/Environment";
import type EnvironmentState from "../types/state/EnvironmentState";
import EnvironmentService from "../service/EnvironmentService";
import type EnvironmentResponse from "../types/response/EnvironmentResponse";

// ── Utility: map EnvironmentResponse DTO → Environment ──
function mapResponseToEnvironment(res: EnvironmentResponse): Environment {
  return {
    id: res.id,
    name: res.name,
    color: res.environmentColor,
    variables: Object.fromEntries(
      res.variables.map((variable) => [
        variable.id,
        { id: variable.id, key: variable.key, value: variable.value },
      ]),
    ),
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

  upsertVariable: (environmentId, variable) =>
    set((state) => {
      const existing = state.environments[environmentId];
      if (!existing) return state;
      return {
        environments: {
          ...state.environments,
          [environmentId]: {
            ...existing,
            variables: { ...existing.variables, [variable.id]: variable },
          },
        },
      };
    }),

  removeVariable: (environmentId, variableId) =>
    set((state) => {
      const existing = state.environments[environmentId];
      if (!existing) return state;

      const remainingVariables = { ...existing.variables };
      delete remainingVariables[variableId];

      return {
        environments: {
          ...state.environments,
          [environmentId]: { ...existing, variables: remainingVariables },
        },
      };
    }),

  reset: () =>
    set({
      environments: {},
      activeEnvironmentId: "",
    }),

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
}));

export default useEnvironmentStore;
