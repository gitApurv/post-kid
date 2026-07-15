import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/response/ApiResponse";
import type FolderRequest from "../types/request/FolderRequest";
import type FolderResponse from "../types/response/FolderResponse";
import type RequestItemResponse from "../../request/types/response/RequestItemResponse";
import { getActiveWorkspaceId } from "../../workspace/utils/activeWorkspace";

// Helper function to extract error messages from Axios errors
function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

// Fetch all subfolders of a given folder in a collection
export async function fetchSubfolders(collectionId: string, folderId: string) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.get<ApiResponse<FolderResponse[]>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/folders/${folderId}/subfolders`,
    );
    if (res.data.success)
      return { success: true as const, data: res.data.data || [] };
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch subfolders.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch subfolders."),
    };
  }
}

// Fetch all requests within a specific folder of a collection
export async function fetchFolderRequests(
  collectionId: string,
  folderId: string,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.get<ApiResponse<RequestItemResponse[]>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/folders/${folderId}/requests`,
    );
    if (res.data.success)
      return { success: true as const, data: res.data.data || [] };
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch folder requests.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch folder requests."),
    };
  }
}

// Create a new folder within a collection
export async function createFolder(collectionId: string, req: FolderRequest) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.post<ApiResponse<FolderResponse>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/folders`,
      req,
    );
    if (res.data.success && res.data.data)
      return { success: true as const, data: res.data.data };
    return {
      success: false as const,
      error: res.data.message || "Failed to add folder.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to add folder."),
    };
  }
}

// Create a new subfolder within a specific folder of a collection
export async function createSubfolder(
  collectionId: string,
  folderId: string,
  req: FolderRequest,
) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.post<ApiResponse<FolderResponse>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/folders/${folderId}/subfolders`,
      req,
    );
    if (res.data.success && res.data.data)
      return { success: true as const, data: res.data.data };
    return {
      success: false as const,
      error: res.data.message || "Failed to add subfolder.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to add subfolder."),
    };
  }
}

// Delete a folder from a collection
export async function deleteFolder(collectionId: string, folderId: string) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.delete<ApiResponse<unknown>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/folders/${folderId}`,
    );
    if (res.data && res.data.success === false) {
      return {
        success: false as const,
        error: res.data.message || "Failed to delete folder.",
      };
    }
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to delete folder."),
    };
  }
}

const FolderService = {
  fetchSubfolders,
  fetchFolderRequests,
  createFolder,
  createSubfolder,
  deleteFolder,
};

export default FolderService;
