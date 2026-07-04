import type { WorkspaceRole } from "../response/MemberResponse";

export default interface InviteMemberRequest {
  email: string;
  role: WorkspaceRole;
}
