import type Environment from "../items/Environment";

export default interface EnvironmentState {
  environments: Record<string, Environment>;
  activeEnvironmentId: string;

  upsertEnvironment: (environment: Environment) => void;

  setEnvironments: (environments: Record<string, Environment>) => void;

  removeEnvironment: (environmentId: string) => void;

  setActiveEnvironmentId: (environmentId: string) => void;

  cascadeRemoveEnvironment: (environmentId: string) => void;

  reset: () => void;

  deleteEnvironmentAction: (
    environmentId: string,
  ) => Promise<{ success: boolean; error?: string }>;
}
