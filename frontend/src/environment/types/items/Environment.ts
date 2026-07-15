import type EnvironmentVariable from "./EnvironmentVariable";

export type EnvironmentColor = "EMERALD" | "AMBER" | "GREY" | "BLUE" | "ROSE";

export default interface Environment {
  id: string;
  name: string;
  color: EnvironmentColor;
  collectionId: string;
  variables: Record<string, EnvironmentVariable>;
}
