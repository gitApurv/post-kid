import type VariableResponse from "../response/VariableResponse";

export default interface EnvironmentVariableState {
  variables: Record<string, VariableResponse>;

  upsertVariable: (variable: VariableResponse) => void;

  upsertVariables: (variables: VariableResponse[]) => void;

  removeVariable: (variableId: string) => void;

  removeVariablesByEnvironmentId: (environmentId: string) => void;

  reset: () => void;
}
