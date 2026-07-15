import { create } from "zustand";
import useWorkspaceStore from "../../workspace/store/workspaceStore";
import type Environment from "../types/items/Environment";
import type EnvironmentState from "../types/state/EnvironmentState";
import EnvironmentService from "../service/EnvironmentService";
import type EnvironmentResponse from "../types/response/EnvironmentResponse";
import useEnvironmentVariableStore from "./environmentVariableStore";

export function mapResponseToEnvironment(
  res: EnvironmentResponse,
): Environment {
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

  setActiveEnvironmentId: (environmentId) =>
    set({ activeEnvironmentId: environmentId }),

  reset: () =>
    set({
      environments: {},
      activeEnvironmentId: "",
    }),

  cascadeRemoveEnvironment: (environmentId) => {
    useEnvironmentStore.getState().removeEnvironment(environmentId);
    // Cascade remove associated variables from the environment variable store
    useEnvironmentVariableStore
      .getState()
      .removeVariablesByEnvironmentId(environmentId);
  },

  // ─── Actions ─────────────────────────────────────────────────

  deleteEnvironmentAction: async (environmentId) => {
    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!activeWorkspaceId)
      return { success: false, error: "No active workspace selected" };

    const environment = get().environments[environmentId];
    if (!environment) return { success: true };
    const collectionId = environment.collectionId;

    const response = await EnvironmentService.deleteEnvironment(
      collectionId,
      environmentId,
    );
    if (!response.success) return response;

    // Cascade remove the environment and its associated variables from the store
    get().cascadeRemoveEnvironment(environmentId);

    return { success: true };
  },
}));

export default useEnvironmentStore;
