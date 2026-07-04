import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/ApiResponse";
import type CollectionRequest from "../types/request/CollectionRequest";
import type CollectionResponse from "../types/response/CollectionResponse";
import type FolderResponse from "../types/response/FolderResponse";
import type RequestItemResponse from "../../request/types/response/RequestItemResponse";

function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function fetchCollections(workspaceId: string) {
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

export async function fetchCollectionFolders(
  workspaceId: string,
  collectionId: string,
) {
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

export async function fetchCollectionRootRequests(
  workspaceId: string,
  collectionId: string,
) {
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

export async function createCollection(
  workspaceId: string,
  req: CollectionRequest,
) {
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

export async function updateCollection(
  workspaceId: string,
  id: string,
  req: CollectionRequest,
) {
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

export async function deleteCollection(workspaceId: string, id: string) {
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
