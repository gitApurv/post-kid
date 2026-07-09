import type { EnvironmentColor } from "../items/Environment";

export default interface EnvironmentResponse {
  id: string;
  name: string;
  environmentColor: EnvironmentColor;
  createdAt: string;
  updatedAt: string;
  collectionId: string;
}
