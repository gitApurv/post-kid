import type { WorkspaceRole } from "../items/WorkspaceRole";

export default interface InviteMemberRequest {
  email: string;
  role: WorkspaceRole;
}
