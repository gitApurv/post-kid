import { create } from "zustand";
import type WorkspaceMemberState from "../types/state/WorkspaceMemberState";
import type WorkspaceMember from "../types/items/WorkspaceMember";
import type MemberResponse from "../types/response/MemberResponse";

export function mapResponseToMember(member: MemberResponse): WorkspaceMember {
  return {
    workspaceId: member.workspaceId,
    userId: member.userId,
    username: member.username,
    role: member.role,
  };
}

const useWorkspaceMemberStore = create<WorkspaceMemberState>((set) => ({
  members: {},

  // ─── Mutations ───────────────────────────────────────────────

  upsertMember: (member) =>
    set((state) => ({
      members: {
        ...state.members,
        [member.userId]: member,
      },
    })),

  upsertMembers: (membersList) =>
    set((state) => ({
      members: {
        ...state.members,
        ...Object.fromEntries(
          membersList.map((member) => [member.userId, member]),
        ),
      },
    })),

  removeMember: (userId) =>
    set((state) => {
      const remainingMembers = { ...state.members };
      delete remainingMembers[userId];
      return { members: remainingMembers };
    }),

  reset: () => set({ members: {} }),
}));

export default useWorkspaceMemberStore;
