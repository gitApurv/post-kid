import type LoginRequest from "../request/LoginRequest";
import type RegisterRequest from "../request/RegisterRequest";
import type UserItem from "../items/UserItem";

export default interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserItem | null;

  setAuthenticated: (isAuthenticated: boolean) => void;

  setCurrentUser: (currentUser: UserItem | null) => void;

  loginAction: (
    req: LoginRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  registerAction: (
    req: RegisterRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  logoutAction: () => Promise<{ success: boolean; error?: string }>;
}
