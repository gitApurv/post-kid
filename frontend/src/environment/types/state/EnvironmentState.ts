import type Environment from "../items/Environment";
import type Variable from "../items/Variable";

export default interface EnvironmentState {
  environments: Record<string, Environment>;
  activeEnvironmentId: string;

  // Mutations
  upsertEnvironment: (environment: Environment) => void;

  setEnvironments: (environments: Record<string, Environment>) => void;

  removeEnvironment: (environmentId: string) => void;

  setActiveEnvironmentId: (id: string) => void;

  upsertVariable: (environmentId: string, variable: Variable) => void;

  removeVariable: (environmentId: string, variableId: string) => void;

  reset: () => void;

  // Actions
  fetchEnvironmentsAction: (
    collectionId: string,
  ) => Promise<{ success: boolean; error?: string }>;
}
