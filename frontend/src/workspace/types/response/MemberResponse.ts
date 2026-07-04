export type WorkspaceRole = "ADMIN" | "MEMBER" | "VIEWER";

export default interface MemberResponse {
  userId: string;
  username: string;
  email: string;
  role: WorkspaceRole;
  joinedAt: string;
}
