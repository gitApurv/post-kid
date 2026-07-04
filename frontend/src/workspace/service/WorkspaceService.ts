import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/ApiResponse";
import type WorkspaceResponse from "../types/response/WorkspaceResponse";
import type WorkspaceRequest from "../types/request/WorkspaceRequest";
import type MemberResponse from "../types/response/MemberResponse";
import type InviteMemberRequest from "../types/request/InviteMemberRequest";

function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function fetchWorkspaces() {
  try {
    const res = await api.get<ApiResponse<WorkspaceResponse[]>>("/workspaces");
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch workspaces.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch workspaces."),
    };
  }
}

export async function createWorkspace(request: WorkspaceRequest) {
  try {
    const res = await api.post<ApiResponse<WorkspaceResponse>>(
      "/workspaces",
      request,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to create workspace.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to create workspace."),
    };
  }
}

export async function updateWorkspace(
  workspaceId: string,
  request: WorkspaceRequest,
) {
  try {
    const res = await api.put<ApiResponse<WorkspaceResponse>>(
      `/workspaces/${workspaceId}`,
      request,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to update workspace.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to update workspace."),
    };
  }
}

export async function deleteWorkspace(workspaceId: string) {
  try {
    const res = await api.delete<ApiResponse<void>>(
      `/workspaces/${workspaceId}`,
    );
    if (res.data.success) {
      return { success: true as const };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to delete workspace.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to delete workspace."),
    };
  }
}

export async function fetchMembers(workspaceId: string) {
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

export async function inviteMember(
  workspaceId: string,
  request: InviteMemberRequest,
) {
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

export async function removeMember(workspaceId: string, userId: string) {
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

export async function leaveWorkspace(workspaceId: string) {
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

const WorkspaceService = {
  fetchWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  fetchMembers,
  inviteMember,
  removeMember,
  leaveWorkspace,
};

export default WorkspaceService;
