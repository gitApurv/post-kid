import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useWorkspaceStore from "../../workspace/store/workspaceStore";
import useWebsocketStore from "../../collaboration/store/useWebsocketStore";
import useWorkspaceRealtime from "../../collaboration/hooks/useWorkspaceRealtime";
import { useActiveWorkspaceData } from "../../workspace/hooks/useActiveWorkspaceData";

export default function DashboardLayout() {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );

  // Connect to the WebSocket once when the dashboard mounts
  useEffect(() => {
    useWebsocketStore.getState().connect();
  }, []);

  // Establish subscriptions dynamically based on active workspace
  useWorkspaceRealtime(activeWorkspaceId);

  // Re-fetch collections + members whenever the active workspace changes
  // (handles router-triggered switches from socket events)
  useActiveWorkspaceData();

  return (
    <div className="h-screen flex bg-[#07090E] text-slate-100 font-sans selection:bg-brand-primary/30 selection:text-white overflow-hidden">
      {/* 1. Sidebar Panel Navigation */}
      <Sidebar />

      {/* 2. Main Work Container */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        {/* Header Panel */}
        <Navbar />

        {/* Core Canvas Viewport router outlet */}
        <main className="flex-1 min-h-0 overflow-hidden relative">
          {/* Main workspace layout background mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(99,102,241,0.02),transparent_60%)] pointer-events-none z-0" />

          <div className="relative z-10 w-full h-full min-h-0 overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
