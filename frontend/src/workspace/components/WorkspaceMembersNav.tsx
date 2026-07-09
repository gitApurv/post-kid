import useWorkspaceStore from "../store/workspaceStore";
import useWorkspaceMemberStore from "../store/WorkspaceMemberStore";
import usePresenceStore from "../store/PresenceStore";

export default function WorkspaceMembersNav() {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const members = useWorkspaceMemberStore((state) =>
    activeWorkspaceId ? state.members[activeWorkspaceId] || {} : {},
  );
  const presence = usePresenceStore((state) =>
    activeWorkspaceId ? state.presence[activeWorkspaceId] || {} : {},
  );

  const memberList = Object.values(members);

  if (memberList.length === 0) return null;

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 16 }}
    >
      {memberList.map((member) => {
        const isOnline = !!presence[member.userId];
        return (
          <div
            key={member.userId}
            title={`${member.username}${isOnline ? " (online)" : ""}`}
            style={{
              position: "relative",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#312E81", // modern premium indigo background
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#E0E7FF",
              opacity: isOnline ? 1 : 0.45,
              transition: "all 0.2s ease-in-out",
            }}
          >
            {member.username.slice(0, 2).toUpperCase()}
            {isOnline && (
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10B981", // beautiful emerald green
                  border: "2px solid #07090E", // match app background
                  boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
