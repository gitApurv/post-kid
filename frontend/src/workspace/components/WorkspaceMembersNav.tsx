import useWorkspaceMemberStore from "../store/WorkspaceMemberStore";
import usePresenceStore from "../store/PresenceStore";

export default function WorkspaceMembersNav() {
  const members = useWorkspaceMemberStore((state) => state.members);
  const presence = usePresenceStore((state) => state.presence);

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
            className="group cursor-pointer"
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
            {/* Premium Custom Tooltip */}
            <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-150 ease-out z-50 bg-[#0F111A] border border-indigo-500/20 text-[#E2E8F0] text-[10px] font-semibold py-1 px-2 rounded-md shadow-[0_0_12px_rgba(49,46,129,0.3)] whitespace-nowrap pointer-events-none">
              {member.username} {isOnline ? "(online)" : "(offline)"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
