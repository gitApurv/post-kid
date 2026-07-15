import { create } from "zustand";
import type AuthState from "../types/state/AuthState";
import type UserItem from "../types/items/UserItem";
import AuthService from "../service/AuthService";
import useWorkspaceStore from "../../workspace/store/workspaceStore";
import useCollectionStore from "../../collection/store/collectionStore";
import useFolderStore from "../../collection/store/folderStore";
import useRequestStore from "../../request/store/requestStore";
import useEnvironmentStore from "../../environment/store/environmentStore";
import useHistoryStore from "../../history/store/historyStore";
import useWebsocketStore from "../../collaboration/store/useWebsocketStore";
import useWorkspaceMemberStore from "../../workspace/store/workspaceMemberStore";
import usePresenceStore from "../../workspace/store/presenceStore";
import useEnvironmentVariableStore from "../../environment/store/environmentVariableStore";
import getGravatarUrl from "../utils/gravatar";

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: !!localStorage.getItem("accessToken"),
  currentUser: (() => {
    try {
      const raw = localStorage.getItem("currentUser");
      return raw ? (JSON.parse(raw) as UserItem) : null;
    } catch {
      return null;
    }
  })(),

  // ─── Mutations ───────────────────────────────────────────────

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setCurrentUser: (user) => set({ currentUser: user }),

  // ─── Actions ─────────────────────────────────────────────────

  loginAction: async (req) => {
    const res = await AuthService.login(req);
    if (!res.success) return res;

    const avatar = await getGravatarUrl(res.data.email);
    const user: UserItem = {
      id: res.data.userId,
      name: res.data.username,
      email: res.data.email,
      avatar,
    };

    // Store tokens and user info in local storage
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Update authentication state in the store
    get().setAuthenticated(true);
    get().setCurrentUser(user);

    return { success: true };
  },

  registerAction: async (req) => {
    const res = await AuthService.register(req);
    if (!res.success) return res;

    const avatar = await getGravatarUrl(res.data.email);
    const user: UserItem = {
      id: res.data.userId,
      name: res.data.username,
      email: res.data.email,
      avatar,
    };

    // Store tokens and user info in local storage
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Update authentication state in the store
    get().setAuthenticated(true);
    get().setCurrentUser(user);

    return { success: true };
  },

  logoutAction: async () => {
    const refreshToken = localStorage.getItem("refreshToken") ?? "";
    await AuthService.logout(refreshToken);

    // Clear local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");

    // Reset authentication state in the store
    get().setAuthenticated(false);
    get().setCurrentUser(null);

    // Reset all resource and utility stores
    useWorkspaceStore.getState().reset();
    useCollectionStore.getState().reset();
    useFolderStore.getState().reset();
    useRequestStore.getState().reset();
    useEnvironmentStore.getState().reset();
    useHistoryStore.getState().reset();
    useWorkspaceMemberStore.getState().reset();
    usePresenceStore.getState().reset();
    useEnvironmentVariableStore.getState().reset();

    // Close WebSocket connection cleanly on logout
    useWebsocketStore.getState().disconnect();

    return { success: true };
  },
}));

export default useAuthStore;
