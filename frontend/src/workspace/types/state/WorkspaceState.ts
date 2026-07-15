import type WorkspaceItem from "../items/WorkspaceItem";
import type WorkspaceRequest from "../request/WorkspaceRequest";

export default interface WorkspaceState {
  workspaces: Record<string, WorkspaceItem>;
  activeWorkspaceId: string | null;

  upsertWorkspace: (workspace: WorkspaceItem) => void;

  upsertWorkspaces: (workspaces: WorkspaceItem[]) => void;

  removeWorkspace: (workspaceId: string) => void;

  updateMemberCount: (workspaceId: string, delta: number) => void;

  setActiveWorkspaceId: (workspaceId: string | null) => void;

  reset: () => void;

  setActiveWorkspaceAction: (
    workspaceId: string | null,
  ) => Promise<{ success: boolean; error?: string }>;

  fetchWorkspacesAction: () => Promise<{ success: boolean; error?: string }>;

  createWorkspaceAction: (
    req: WorkspaceRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  deleteWorkspaceAction: (
    workspaceId: string,
  ) => Promise<{ success: boolean; error?: string }>;
}
