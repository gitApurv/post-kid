import type VariableResponse from "./VariableResponse";
import type { EnvironmentColor } from "../items/Environment";

export default interface EnvironmentResponse {
  id: string;
  name: string;
  environmentColor: EnvironmentColor;
  variables: VariableResponse[];
  createdAt: string;
  updatedAt: string;
}
