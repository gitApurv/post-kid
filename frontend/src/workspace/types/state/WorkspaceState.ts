import type WorkspaceItem from "../items/WorkspaceItem";
import type WorkspaceRequest from "../request/WorkspaceRequest";

export default interface WorkspaceState {
  workspaces: Record<string, WorkspaceItem>;
  activeWorkspaceId: string | null;

  // Mutations
  upsertWorkspace: (workspace: WorkspaceItem) => void;

  upsertWorkspaces: (workspaces: WorkspaceItem[]) => void;

  removeWorkspace: (id: string) => void;

  updateMemberCount: (id: string, delta: number) => void;

  setActiveWorkspaceId: (id: string | null) => void;

  reset: () => void;

  // Actions
  setActiveWorkspaceAction: (
    id: string | null,
  ) => Promise<{ success: boolean; error?: string }>;

  fetchWorkspacesAction: () => Promise<{ success: boolean; error?: string }>;

  createWorkspaceAction: (
    req: WorkspaceRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  deleteWorkspaceAction: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
}
