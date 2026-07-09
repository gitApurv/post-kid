import type Environment from "../items/Environment";

export default interface EnvironmentState {
  environments: Record<string, Environment>;
  activeEnvironmentId: string;

  // Mutations
  upsertEnvironment: (environment: Environment) => void;

  setEnvironments: (environments: Record<string, Environment>) => void;

  removeEnvironment: (environmentId: string) => void;

  setActiveEnvironmentId: (id: string) => void;

  /** Mutation-only cascade: removes the environment + clears its variables from variableStore. No API call. */
  cascadeRemoveEnvironment: (environmentId: string) => void;

  reset: () => void;

  // Actions
  fetchEnvironmentsAction: (
    collectionId: string,
  ) => Promise<{ success: boolean; error?: string }>;

  deleteEnvironmentAction: (
    environmentId: string,
  ) => Promise<{ success: boolean; error?: string }>;

}

