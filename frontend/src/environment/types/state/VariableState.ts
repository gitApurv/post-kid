import type VariableResponse from "../response/VariableResponse";

export default interface VariableState {
  variables: Record<string, VariableResponse>;

  // Mutations
  upsertVariable: (variable: VariableResponse) => void;

  upsertVariables: (variablesList: VariableResponse[]) => void;

  removeVariable: (variableId: string) => void;

  removeVariablesByEnvironmentId: (environmentId: string) => void;

  reset: () => void;
}
