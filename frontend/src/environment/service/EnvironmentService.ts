import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/response/ApiResponse";
import type EnvironmentResponse from "../types/response/EnvironmentResponse";
import type EnvironmentRequest from "../types/request/EnvironmentRequest";
import { getActiveWorkspaceId } from "../../workspace/utils/activeWorkspace";

// Helper function to extract error messages from Axios errors
function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

// Fetch all environments for a specific collection in the active workspace
export async function fetchEnvironments(collectionId: string) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.get<ApiResponse<EnvironmentResponse[]>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments`,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch environments.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch environments."),
    };
  }
}

// Add a new environment to a specific collection in the active workspace
export async function addEnvironment(
  collectionId: string,
  request: EnvironmentRequest,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.post<ApiResponse<EnvironmentResponse>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments`,
      request,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to add environment.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to add environment."),
    };
  }
}

// Edit an existing environment in a specific collection in the active workspace
export async function editEnvironment(
  collectionId: string,
  environmentId: string,
  request: EnvironmentRequest,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.put<ApiResponse<EnvironmentResponse>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments/${environmentId}`,
      request,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to edit environment.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to edit environment."),
    };
  }
}

// Delete an environment from a specific collection in the active workspace
export async function deleteEnvironment(
  collectionId: string,
  environmentId: string,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.delete<ApiResponse<void>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments/${environmentId}`,
    );
    if (res.data.success) {
      return { success: true as const };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to delete environment.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to delete environment."),
    };
  }
}

const EnvironmentService = {
  fetchEnvironments,
  addEnvironment,
  editEnvironment,
  deleteEnvironment,
};

export default EnvironmentService;
