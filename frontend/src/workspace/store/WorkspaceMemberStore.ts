import { create } from "zustand";
import type WorkspaceMemberState from "../types/state/WorkspaceMemberState";

const useWorkspaceMemberStore = create<WorkspaceMemberState>((set) => ({
  members: {},

  // ─── Mutations ───────────────────────────────────────────────

  upsertMember: (workspaceId, member) =>
    set((state) => ({
      members: {
        ...state.members,
        [workspaceId]: {
          ...(state.members[workspaceId] || {}),
          [member.userId]: member,
        },
      },
    })),

  upsertMembers: (workspaceId, membersList) =>
    set((state) => ({
      members: {
        ...state.members,
        [workspaceId]: {
          ...(state.members[workspaceId] || {}),
          ...Object.fromEntries(
            membersList.map((member) => [member.userId, member]),
          ),
        },
      },
    })),

  removeMember: (workspaceId, userId) =>
    set((state) => {
      const workspaceMembers = { ...(state.members[workspaceId] || {}) };
      delete workspaceMembers[userId];
      return { members: { ...state.members, [workspaceId]: workspaceMembers } };
    }),

  clearWorkspaceMembers: (workspaceId) =>
    set((state) => {
      const remaining = { ...state.members };
      delete remaining[workspaceId];
      return { members: remaining };
    }),

  reset: () => set({ members: {} }),
}));

export default useWorkspaceMemberStore;
