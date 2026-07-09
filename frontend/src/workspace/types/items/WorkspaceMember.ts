import type { WorkspaceRole } from "./WorkspaceRole";

export default interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  username: string;
  role: WorkspaceRole;
}
