import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/response/ApiResponse";
import type VariableResponse from "../types/response/VariableResponse";
import type VariableRequest from "../types/request/VariableRequest";
import { getActiveWorkspaceId } from "../../workspace/utils/activeWorkspace";

// Helper function to extract error messages from Axios errors
function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

// Fetch all variables for a specific environment in a collection within the active workspace
export async function fetchVariables(
  collectionId: string,
  environmentId: string,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.get<ApiResponse<VariableResponse[]>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments/${environmentId}/variables`,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch variables.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch variables."),
    };
  }
}

// Add a new variable to a specific environment in a collection within the active workspace
export async function addVariable(
  collectionId: string,
  environmentId: string,
  request: VariableRequest,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.post<ApiResponse<VariableResponse>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments/${environmentId}/variables`,
      request,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to add variable.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to add variable."),
    };
  }
}

// Update an existing variable in a specific environment in a collection within the active workspace
export async function updateVariable(
  collectionId: string,
  environmentId: string,
  variableId: string,
  request: VariableRequest,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.put<ApiResponse<VariableResponse>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments/${environmentId}/variables/${variableId}`,
      request,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to update variable.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to update variable."),
    };
  }
}

// Delete a variable from a specific environment in a collection within the active workspace
export async function deleteVariable(
  collectionId: string,
  environmentId: string,
  variableId: string,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.delete<ApiResponse<void>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/environments/${environmentId}/variables/${variableId}`,
    );
    if (res.data.success) {
      return { success: true as const };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to delete variable.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to delete variable."),
    };
  }
}

const EnvironmentVariableService = {
  fetchVariables,
  addVariable,
  updateVariable,
  deleteVariable,
};

export default EnvironmentVariableService;
