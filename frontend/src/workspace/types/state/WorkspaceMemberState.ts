import type WorkspaceMember from "../items/WorkspaceMember";

export default interface WorkspaceMemberState {
  members: Record<string, Record<string, WorkspaceMember>>;

  // Mutations
  upsertMember: (workspaceId: string, member: WorkspaceMember) => void;

  upsertMembers: (workspaceId: string, list: WorkspaceMember[]) => void;

  removeMember: (workspaceId: string, userId: string) => void;

  clearWorkspaceMembers: (workspaceId: string) => void;

  reset: () => void;
}
