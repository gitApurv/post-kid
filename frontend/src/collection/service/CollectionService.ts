import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/response/ApiResponse";
import type CollectionRequest from "../types/request/CollectionRequest";
import type CollectionResponse from "../types/response/CollectionResponse";
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

// Fetch all collections for the active workspace
export async function fetchCollections() {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.get<ApiResponse<CollectionResponse[]>>(
      `/workspaces/${workspaceId}/collections`,
    );
    if (res.data.success && res.data.data) {
      return { success: true as const, data: res.data.data };
    }
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch collections.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch collections."),
    };
  }
}

// Fetch all folders for a specific collection in the active workspace
export async function fetchCollectionFolders(collectionId: string) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.get<ApiResponse<FolderResponse[]>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/folders`,
    );
    if (res.data.success)
      return { success: true as const, data: res.data.data || [] };
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch folders.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch folders."),
    };
  }
}

// Fetch all root-level requests for a specific collection in the active workspace
export async function fetchCollectionRootRequests(collectionId: string) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.get<ApiResponse<RequestItemResponse[]>>(
      `/workspaces/${workspaceId}/collections/${collectionId}/requests`,
    );
    if (res.data.success)
      return { success: true as const, data: res.data.data || [] };
    return {
      success: false as const,
      error: res.data.message || "Failed to fetch requests.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to fetch requests."),
    };
  }
}

// Create a new collection in the active workspace
export async function createCollection(req: CollectionRequest) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.post<ApiResponse<CollectionResponse>>(
      `/workspaces/${workspaceId}/collections`,
      req,
    );
    if (res.data.success && res.data.data)
      return { success: true as const, data: res.data.data };
    return {
      success: false as const,
      error: res.data.message || "Failed to add collection.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to add collection."),
    };
  }
}

// Update an existing collection in the active workspace
export async function updateCollection(id: string, req: CollectionRequest) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.put<ApiResponse<CollectionResponse>>(
      `/workspaces/${workspaceId}/collections/${id}`,
      req,
    );
    if (res.data.success && res.data.data)
      return { success: true as const, data: res.data.data };
    return {
      success: false as const,
      error: res.data.message || "Failed to update collection.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to update collection."),
    };
  }
}

// Delete a collection from the active workspace
export async function deleteCollection(id: string) {
  const workspaceId = getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false as const, error: "No active workspace selected" };
  }
  try {
    const res = await api.delete<ApiResponse<unknown>>(
      `/workspaces/${workspaceId}/collections/${id}`,
    );
    if (res.data && res.data.success === false) {
      return {
        success: false as const,
        error: res.data.message || "Failed to delete collection.",
      };
    }
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Failed to delete collection."),
    };
  }
}

const CollectionService = {
  fetchCollections,
  fetchCollectionFolders,
  fetchCollectionRootRequests,
  createCollection,
  updateCollection,
  deleteCollection,
};

export default CollectionService;
