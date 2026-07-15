import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/response/ApiResponse";
import type MemberResponse from "../types/response/MemberResponse";
import type InviteMemberRequest from "../types/request/InviteMemberRequest";
import { getActiveWorkspaceId } from "../utils/activeWorkspace";

// Helper function to extract error messages from Axios errors
function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

// Fetch all members of the active workspace
export async function fetchMembers() {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.get<ApiResponse<MemberResponse[]>>(
      `/workspaces/${workspaceId}/members`,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch members.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch members."),
    };
  }
}

// Invite a member to the active workspace
export async function inviteMember(request: InviteMemberRequest) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.post<ApiResponse<MemberResponse>>(
      `/workspaces/${workspaceId}/members`,
      request,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to invite member.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to invite member."),
    };
  }
}

// Remove a member from the active workspace
export async function removeMember(userId: string) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.delete<ApiResponse<void>>(
      `/workspaces/${workspaceId}/members/${userId}`,
    );
    if (res.data.success) {
      return { success: true as const };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to remove member.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to remove member."),
    };
  }
}

// Leave the active workspace
export async function leaveWorkspace() {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.delete<ApiResponse<void>>(
      `/workspaces/${workspaceId}/members/leave`,
    );
    if (res.data.success) {
      return { success: true as const };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to leave workspace.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to leave workspace."),
    };
  }
}

const WorkspaceMemberService = {
  fetchMembers,
  inviteMember,
  removeMember,
  leaveWorkspace,
};

export default WorkspaceMemberService;
