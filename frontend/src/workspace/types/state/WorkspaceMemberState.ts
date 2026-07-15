import type WorkspaceMember from "../items/WorkspaceMember";

export default interface WorkspaceMemberState {
  members: Record<string, WorkspaceMember>;

  upsertMember: (member: WorkspaceMember) => void;

  upsertMembers: (list: WorkspaceMember[]) => void;

  removeMember: (userId: string) => void;

  reset: () => void;
}
