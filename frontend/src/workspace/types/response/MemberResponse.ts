import type { WorkspaceRole } from "../items/WorkspaceRole";

export default interface MemberResponse {
  userId: string;
  username: string;
  email: string;
  role: WorkspaceRole;
  joinedAt: string;
  workspaceId: string;
}
