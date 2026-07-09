import { useEffect } from "react";
import useWebsocketStore from "../store/useWebsocketStore";
import eventRouter from "../lib/eventRouter";

export default function useWorkspaceRealtime(workspaceId: string | null) {
  const isConnected = useWebsocketStore((state) => state.isConnected);

  useEffect(() => {
    if (!workspaceId || !isConnected) return;

    eventRouter.startWorkspaceRealtime(workspaceId);
    return () => {
      eventRouter.stopWorkspaceRealtime(workspaceId);
    };
  }, [workspaceId, isConnected]);
}
