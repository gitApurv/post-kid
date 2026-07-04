import { create } from "zustand";
import type AuthState from "../types/state/AuthState";
import type UserItem from "../types/items/UserItem";
import AuthService from "../service/AuthService";
import useWorkspaceStore from "../../workspace/store/WorkspaceStore";
import useCollectionStore from "../../collection/store/CollectionStore";
import useFolderStore from "../../collection/store/FolderStore";
import useRequestStore from "../../request/store/RequestStore";
import useEnvironmentStore from "../../environment/store/EnvironmentStore";
import useHistoryStore from "../../history/store/HistoryStore";

// ── Utility: derive Gravatar URL from email ──
async function getGravatarUrl(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `https://www.gravatar.com/avatar/${hashHex}?d=identicon`;
}

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
      name: res.data.username,
      email: res.data.email,
      avatar,
    };

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    localStorage.setItem("currentUser", JSON.stringify(user));

    get().setAuthenticated(true);
    get().setCurrentUser(user);

    return { success: true };
  },

  registerAction: async (req) => {
    const res = await AuthService.register(req);
    if (!res.success) return res;

    const avatar = await getGravatarUrl(res.data.email);
    const user: UserItem = {
      name: res.data.username,
      email: res.data.email,
      avatar,
    };

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    localStorage.setItem("currentUser", JSON.stringify(user));

    get().setAuthenticated(true);
    get().setCurrentUser(user);

    return { success: true };
  },

  logoutAction: async () => {
    const refreshToken = localStorage.getItem("refreshToken") ?? "";

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");

    get().setAuthenticated(false);
    get().setCurrentUser(null);

    // Reset all resource and utility stores
    useWorkspaceStore.getState().reset();
    useCollectionStore.getState().reset();
    useFolderStore.getState().reset();
    useRequestStore.getState().reset();
    useEnvironmentStore.getState().reset();
    useHistoryStore.getState().reset();

    await AuthService.logout(refreshToken);

    return { success: true };
  },

  bootstrapAuthAction: async () => {
    const token = localStorage.getItem("accessToken");
    const raw = localStorage.getItem("currentUser");

    if (!token || !raw) {
      get().setAuthenticated(false);
      get().setCurrentUser(null);
      return { success: false, error: "No session found" };
    }

    try {
      const user = JSON.parse(raw) as UserItem;
      get().setAuthenticated(true);
      get().setCurrentUser(user);
      return { success: true };
    } catch {
      get().setAuthenticated(false);
      get().setCurrentUser(null);
      return { success: false, error: "Corrupted session data" };
    }
  },
}));

export default useAuthStore;
