import { create } from "zustand";
import type VariableState from "../types/state/VariableState";

const useVariableStore = create<VariableState>((set) => ({
  variables: {},

  // ─── Mutations ───────────────────────────────────────────────

  upsertVariable: (variable) =>
    set((state) => ({
      variables: { ...state.variables, [variable.id]: variable },
    })),

  upsertVariables: (variablesList) =>
    set((state) => ({
      variables: {
        ...state.variables,
        ...Object.fromEntries(
          variablesList.map((variable) => [variable.id, variable]),
        ),
      },
    })),

  removeVariable: (variableId) =>
    set((state) => {
      const remainingVariables = { ...state.variables };
      delete remainingVariables[variableId];
      return { variables: remainingVariables };
    }),

  removeVariablesByEnvironmentId: (environmentId) =>
    set((state) => ({
      variables: Object.fromEntries(
        Object.entries(state.variables).filter(
          ([, variable]) => variable.environmentId !== environmentId,
        ),
      ),
    })),

  reset: () => set({ variables: {} }),
}));

export default useVariableStore;
