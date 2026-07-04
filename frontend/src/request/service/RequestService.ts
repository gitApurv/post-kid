import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/ApiResponse";
import type RequestItemResponse from "../types/response/RequestItemResponse";
import type ExecutionResponse from "../types/response/ExecutionResponse";
import type RequestItemRequest from "../types/request/RequestItemRequest";

function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function createRequest(
  workspaceId: string,
  collectionId: string,
  req: { name: string; method: string; url: string },
) {
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

export async function createFolderRequest(
  workspaceId: string,
  collectionId: string,
  folderId: string,
  req: { name: string; method: string; url: string },
) {
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

export async function deleteRequest(
  workspaceId: string,
  collectionId: string,
  requestId: string,
) {
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

export async function deleteFolderRequest(
  workspaceId: string,
  collectionId: string,
  folderId: string,
  requestId: string,
) {
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

export async function updateRequest(
  workspaceId: string,
  collectionId: string,
  folderId: string | null,
  requestId: string,
  payload: RequestItemRequest,
) {
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

export async function executeRequest(
  workspaceId: string,
  collectionId: string,
  folderId: string | null,
  payload: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    authType: string;
    authValue: Record<string, string>;
    timeoutSeconds: number;
  },
) {
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
  createRequest,
  createFolderRequest,
  deleteRequest,
  deleteFolderRequest,
  updateRequest,
  executeRequest,
};

export default RequestService;
