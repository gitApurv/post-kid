import { useEffect } from "react";
import useWebsocketStore from "../store/useWebsocketStore";
import WorkspaceRealtimeService from "../service/WorkspaceRealtimeService";

export default function useWorkspaceRealtime(workspaceId: string | null) {
  const isConnected = useWebsocketStore((state) => state.isConnected);

  useEffect(() => {
    if (!workspaceId || !isConnected) return;

    WorkspaceRealtimeService.startWorkspaceRealtime(workspaceId);
    return () => {
      WorkspaceRealtimeService.stopWorkspaceRealtime(workspaceId);
    };
  }, [workspaceId, isConnected]);
}
