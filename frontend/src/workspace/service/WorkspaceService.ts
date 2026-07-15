import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/response/ApiResponse";
import type WorkspaceResponse from "../types/response/WorkspaceResponse";
import type WorkspaceRequest from "../types/request/WorkspaceRequest";
import { getActiveWorkspaceId } from "../utils/activeWorkspace";

// Helper function to extract error messages from Axios errors
function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

// Fetch all workspaces for the current user
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

// Create a new workspace
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

// Update an existing workspace
export async function updateWorkspace(request: WorkspaceRequest) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
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

// Delete the active workspace
export async function deleteWorkspace() {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
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

const WorkspaceService = {
  fetchWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
};

export default WorkspaceService;
