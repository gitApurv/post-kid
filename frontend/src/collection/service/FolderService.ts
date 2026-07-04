import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/ApiResponse";
import type FolderRequest from "../types/request/FolderRequest";
import type FolderResponse from "../types/response/FolderResponse";
import type RequestItemResponse from "../../request/types/response/RequestItemResponse";

function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function fetchSubfolders(
  workspaceId: string,
  collectionId: string,
  folderId: string,
) {
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

export async function fetchFolderRequests(
  workspaceId: string,
  collectionId: string,
  folderId: string,
) {
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

export async function createFolder(
  workspaceId: string,
  collectionId: string,
  req: FolderRequest,
) {
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

export async function createSubfolder(
  workspaceId: string,
  collectionId: string,
  folderId: string,
  req: FolderRequest,
) {
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

export async function deleteFolder(
  workspaceId: string,
  collectionId: string,
  folderId: string,
) {
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
