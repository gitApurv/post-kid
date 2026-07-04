import type WorkspaceResponse from "../response/WorkspaceResponse";

export default interface WorkspaceItem extends WorkspaceResponse {
  isLoading?: boolean;
}
