import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/response/ApiResponse";
import type RequestItemResponse from "../types/response/RequestItemResponse";
import type ExecutionResponse from "../types/response/ExecutionResponse";
import type RequestItemRequest from "../types/request/RequestItemRequest";
import type RequestExecutionRequest from "../types/request/RequestExecutionRequest";
import { getActiveWorkspaceId } from "../../workspace/utils/activeWorkspace";

// Helper function to extract error messages from Axios errors
function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

// Create a request within a collection
export async function createCollectionRequest(
  collectionId: string,
  req: { name: string; method: string; url: string },
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.post<ApiResponse<RequestItemResponse>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/requests`,
      req,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to create request.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to create request."),
    };
  }
}

// Create a request within a folder
export async function createFolderRequest(
  collectionId: string,
  folderId: string,
  req: { name: string; method: string; url: string },
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.post<ApiResponse<RequestItemResponse>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/folders/${folderId}/requests`,
      req,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to create request in folder.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to create request in folder."),
    };
  }
}

// Delete a request from a collection
export async function deleteCollectionRequest(
  collectionId: string,
  requestId: string,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.delete<ApiResponse<unknown>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/requests/${requestId}`,
    );
    if (res.data && res.data.success === false) {
      return {
        success: false as const,
        error: res.data.message || "Failed to delete request.",
      };
    }
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to delete request."),
    };
  }
}

// Delete a request from a folder
export async function deleteFolderRequest(
  collectionId: string,
  folderId: string,
  requestId: string,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.delete<ApiResponse<unknown>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/folders/${folderId}/requests/${requestId}`,
    );
    if (res.data && res.data.success === false) {
      return {
        success: false as const,
        error: res.data.message || "Failed to delete request from folder.",
      };
    }
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to delete request from folder."),
    };
  }
}

// Update a request, either in a collection or a folder
export async function updateRequest(
  collectionId: string,
  folderId: string | null,
  requestId: string,
  payload: RequestItemRequest,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  const targetUrl = folderId
    ? `/workspaces/${workspaceId}/collections/${collectionId}/folders/${folderId}/requests/${requestId}`
    : `/workspaces/${workspaceId}/collections/${collectionId}/requests/${requestId}`;
  try {
    const res = await api.put<ApiResponse<RequestItemResponse>>(
      targetUrl,
      payload,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to update request.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to update request."),
    };
  }
}

// Execute a request, either in a collection or a folder
export async function executeRequest(
  collectionId: string,
  folderId: string | null,
  payload: RequestExecutionRequest,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  const executeUrl = folderId
    ? `/workspaces/${workspaceId}/collections/${collectionId}/folders/${folderId}/requests/execute`
    : `/workspaces/${workspaceId}/collections/${collectionId}/requests/execute`;
  try {
    const res = await api.post<ApiResponse<ExecutionResponse>>(
      executeUrl,
      payload,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to execute request.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to execute request."),
    };
  }
}

const RequestService = {
  createCollectionRequest,
  createFolderRequest,
  deleteCollectionRequest,
  deleteFolderRequest,
  updateRequest,
  executeRequest,
};

export default RequestService;
